import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CropOptions {
  width: number;
  height: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

async function cropImage(
  imageBuffer: Buffer,
  options: CropOptions
): Promise<Buffer> {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover'
  } = options;

  try {
    let pipeline = sharp(imageBuffer)
      .resize(width, height, {
        fit,
        withoutEnlargement: true
      });

    // Aplicar formato e qualidade
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.error('Error cropping image:', error);
    throw new Error('Failed to crop image');
  }
}

// API Route para processamento de imagens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const width = parseInt(searchParams.get('width') || '400');
    const height = parseInt(searchParams.get('height') || '200');
    const quality = parseInt(searchParams.get('quality') || '80');
    const format = (searchParams.get('format') || 'webp') as 'webp' | 'jpeg' | 'png';
    const fit = (searchParams.get('fit') || 'cover') as 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validar dimensões máximas
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;
    
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      return NextResponse.json(
        { error: 'Dimensions too large' },
        { status: 400 }
      );
    }

    // Buscar imagem original
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch original image' },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Processar imagem
    const croppedBuffer = await cropImage(imageBuffer, {
      width,
      height,
      quality,
      format,
      fit
    });

    // Retornar imagem processada
    return new NextResponse(croppedBuffer, {
      headers: {
        'Content-Type': `image/${format}`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

// helper removido: use src/lib/images.getOptimizedImageUrl no client
