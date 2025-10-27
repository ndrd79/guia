import React, { useState } from 'react';
import Image from 'next/image';

const ImageTest: React.FC = () => {
  const [imageStatus, setImageStatus] = useState<{[key: string]: string}>({});

  const testImages = [
    {
      id: 'supabase-noticias',
      url: 'https://mlkpnapnijdbskaimquj.supabase.co/storage/v1/object/public/noticias/images/1755699106545-yy3omr-carlo-ancelotti-forma-selecao-brasileira-webp.webp',
      name: 'Supabase Notícias'
    },
    {
      id: 'supabase-banners',
      url: 'https://mlkpnapnijdbskaimquj.supabase.co/storage/v1/object/public/banners/images/1755636259153-zydf3n-junina-png.png',
      name: 'Supabase Banners'
    },
    {
      id: 'unsplash',
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      name: 'Unsplash'
    }
  ];

  const handleImageLoad = (id: string) => {
    console.log(`✅ Imagem carregada: ${id}`);
    setImageStatus(prev => ({ ...prev, [id]: 'loaded' }));
  };

  const handleImageError = (id: string, url: string) => {
    console.error(`❌ Erro ao carregar imagem: ${id}`, url);
    setImageStatus(prev => ({ ...prev, [id]: 'error' }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Teste de Carregamento de Imagens</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testImages.map((img) => (
          <div key={img.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{img.name}</h3>
            
            <div className="relative w-full h-48 mb-2 bg-gray-100 rounded">
              <Image
                src={img.url}
                alt={img.name}
                fill
                className="object-cover rounded"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={() => handleImageLoad(img.id)}
                onError={() => handleImageError(img.id, img.url)}
              />
            </div>
            
            <div className="text-sm">
              <p><strong>Status:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  imageStatus[img.id] === 'loaded' ? 'bg-green-100 text-green-800' :
                  imageStatus[img.id] === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {imageStatus[img.id] === 'loaded' ? '✅ Carregada' :
                   imageStatus[img.id] === 'error' ? '❌ Erro' :
                   '⏳ Carregando...'}
                </span>
              </p>
              <p className="mt-1 break-all text-xs text-gray-600">
                <strong>URL:</strong> {img.url.substring(0, 50)}...
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTest;