"use client";
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { TemplateProps } from '../BannerTemplateRegistry';

export function VideoTemplate({ banners, config, onBannerClick, deviceType }: TemplateProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const {
    autoplay = false,
    muted = true,
    controls = true,
    dimensions = { width: 800, height: 450 }
  } = config;

  if (banners.length === 0) {
    return null;
  }

  // Video template mostra apenas o primeiro banner como vídeo
  const banner = banners[0];
  const isVideoUrl = banner.image_url.match(/\.(mp4|webm|ogg)$/i);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    // Opcional: avançar para próximo banner ou reiniciar
    onBannerClick(banner);
  };

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden"
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        maxWidth: '100%'
      }}
    >
      {isVideoUrl ? (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={banner.image_url}
            muted={muted || isMuted}
            autoPlay={autoplay}
            onEnded={handleVideoEnd}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Video Controls */}
          {controls && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label={isPlaying ? 'Pausar' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">
                  {banner.title || 'Vídeo'}
                </span>
              </div>
              
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label={isMuted ? 'Ativar som' : 'Mutar'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          )}
        </>
      ) : (
        // Fallback para imagem se não for vídeo
        <div className="relative w-full h-full">
          <Image
            src={banner.image_url}
            alt={banner.title}
            fill
            className="object-cover"
            sizes={`${dimensions.width}w`}
            priority
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={() => onBannerClick(banner)}
              className="bg-white/90 hover:bg-white text-black rounded-full p-4 transition-colors"
              aria-label="Ver conteúdo"
            >
              <Play className="w-8 h-8" />
            </button>
          </div>
          
          {banner.title && (
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-lg font-semibold drop-shadow-lg">
                {banner.title}
              </h3>
            </div>
          )}
        </div>
      )}

      {/* Mobile indicator */}
      {deviceType === 'mobile' && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {isVideoUrl ? (isPlaying ? 'Tocando' : 'Pausado') : 'Toque para ver'}
        </div>
      )}
    </div>
  );
}
