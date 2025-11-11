import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import os from 'os';
// Validação simples de UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUuid(value: string): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  description?: string;
  folder_path: string;
  tags: string[];
  metadata: any;
  thumbnail_url?: string;
  optimized_url?: string;
  usage_count: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

// Função para determinar o tipo de arquivo
function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

// Função para gerar nome único do arquivo
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '-');
  return `${name}-${timestamp}-${random}${ext}`;
}

// Função para otimizar imagem
async function optimizeImage(filePath: string, filename: string, bucketName: string): Promise<{
  thumbnail_url?: string;
  optimized_url?: string;
  width?: number;
  height?: number;
}> {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Gerar thumbnail (300x300)
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(path.dirname(filePath), thumbnailFilename);
    
    await image
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Gerar versão otimizada WebP
    const optimizedFilename = `${path.basename(filename, path.extname(filename))}.webp`;
    const optimizedPath = path.join(path.dirname(filePath), optimizedFilename);
    
    await image
      .webp({ quality: 85 })
      .toFile(optimizedPath);

    // Upload para Supabase Storage
    const thumbnailBuffer = fs.readFileSync(thumbnailPath);
    const optimizedBuffer = fs.readFileSync(optimizedPath);

    const { data: thumbnailUpload } = await supabase.storage
      .from(bucketName)
      .upload(`thumbnails/${thumbnailFilename}`, thumbnailBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    const { data: optimizedUpload } = await supabase.storage
      .from(bucketName)
      .upload(`optimized/${optimizedFilename}`, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    // Limpar arquivos temporários
    fs.unlinkSync(thumbnailPath);
    fs.unlinkSync(optimizedPath);

    const { data: { publicUrl: thumbnailPublicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`thumbnails/${thumbnailFilename}`);

    const { data: { publicUrl: optimizedPublicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`optimized/${optimizedFilename}`);

    return {
      thumbnail_url: thumbnailPublicUrl,
      optimized_url: optimizedPublicUrl,
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    return {};
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de mídia:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// GET - Listar mídia com filtros e paginação
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = '1',
    limit = '20',
    search = '',
    type = '',
    folder = '/',
    sortBy = 'created_at',
    sortOrder = 'desc',
    bucket = 'noticias'
  } = req.query;

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  let query = supabase
    .from('media_library')
    .select('*', { count: 'exact' });

  // Filtros
  if (search) {
    query = query.or(`filename.ilike.%${search}%,original_filename.ilike.%${search}%,alt_text.ilike.%${search}%`);
  }

  if (type) {
    query = query.eq('file_type', type);
  }

  if (folder) {
    query = query.eq('folder_path', folder);
  }

  // Ordenação
  query = query.order(sortBy as string, { ascending: sortOrder === 'asc' });

  // Paginação
  query = query.range(offset, offset + parseInt(limit as string) - 1);

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({
    data,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / parseInt(limit as string))
    }
  });
}

// POST - Upload múltiplo de arquivos
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // Usar diretório temporário compatível com Windows/Linux
  const tmpDir = os.tmpdir();

  const form = formidable({
    multiples: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    uploadDir: tmpDir,
    keepExtensions: true
  });

  const [fields, files] = await form.parse(req);
  const uploadedFiles: MediaFile[] = [];
  const errorMessages: string[] = [];

  const fileArray = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
  const folderPath = (fields.folder_path?.[0] as string) || '/';
  const bucketName = (fields.bucket?.[0] as string) || 'noticias';
  const uploadedBy = (fields.uploaded_by?.[0] as string) || '';
  const uploadedBySafe = uploadedBy && isValidUuid(uploadedBy) ? uploadedBy : null;

  for (const file of fileArray) {
    if (!file) continue;

    try {
      const uniqueFilename = generateUniqueFilename(file.originalFilename || 'unknown');
      const fileType = getFileType(file.mimetype || 'application/octet-stream');

      // Upload para Supabase Storage
      const fileBuffer = fs.readFileSync(file.filepath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`files/${uniqueFilename}`, fileBuffer, {
          contentType: file.mimetype || 'application/octet-stream',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        errorMessages.push(`upload: ${uploadError.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`files/${uniqueFilename}`);

      // Otimizar imagem se for o caso
      let optimizationData = {};
      if (fileType === 'image') {
        optimizationData = await optimizeImage(file.filepath, uniqueFilename, bucketName);
      }

      // Salvar no banco de dados
      const { data: mediaData, error: dbError } = await supabase
        .from('media_library')
        .insert({
          filename: uniqueFilename,
          original_filename: file.originalFilename || 'unknown',
          file_path: `files/${uniqueFilename}`,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.mimetype || 'application/octet-stream',
          file_type: fileType,
          folder_path: folderPath,
          uploaded_by: uploadedBySafe,
          ...optimizationData
        })
        .select()
        .single();

      if (dbError) {
        console.error('Erro ao salvar no banco:', dbError);
        errorMessages.push(`database: ${dbError.message}`);
        continue;
      }

      uploadedFiles.push(mediaData);

      // Limpar arquivo temporário
      fs.unlinkSync(file.filepath);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    }
  }

  if (uploadedFiles.length === 0) {
    return res.status(400).json({
      error: errorMessages.length ? errorMessages.join('; ') : 'Falha no upload: nenhum arquivo processado',
      success: false
    });
  }

  return res.status(201).json({
    message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
    data: uploadedFiles,
    success: true,
    files: uploadedFiles.map(f => ({ url: f.file_url, ...f }))
  });
}

// PUT - Atualizar metadados de mídia
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { alt_text, caption, description, tags, folder_path } = req.body;

  const { data, error } = await supabase
    .from('media_library')
    .update({
      alt_text,
      caption,
      description,
      tags,
      folder_path,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

// DELETE - Deletar arquivo de mídia
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id, bucket } = req.query;
  const bucketName = (bucket as string) || 'noticias';

  // Buscar dados do arquivo
  const { data: mediaFile, error: fetchError } = await supabase
    .from('media_library')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !mediaFile) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  // Deletar do storage
  await supabase.storage
    .from(bucketName)
    .remove([mediaFile.file_path]);

  // Deletar thumbnails e versões otimizadas se existirem
  if (mediaFile.thumbnail_url) {
    const thumbnailPath = mediaFile.thumbnail_url.split('/').pop();
    await supabase.storage
      .from(bucketName)
      .remove([`thumbnails/${thumbnailPath}`]);
  }

  if (mediaFile.optimized_url) {
    const optimizedPath = mediaFile.optimized_url.split('/').pop();
    await supabase.storage
      .from(bucketName)
      .remove([`optimized/${optimizedPath}`]);
  }

  // Deletar do banco
  const { error: deleteError } = await supabase
    .from('media_library')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.status(200).json({ message: 'Arquivo deletado com sucesso' });
}