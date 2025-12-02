import React, { useEffect, useState } from 'react';
import { X, ZoomIn, Maximize2 } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to allow DOM to render before starting animation
      requestAnimationFrame(() => setIsAnimating(true));
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = 'unset';
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with Blur */}
      <div 
        className={`absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Close Button (Fixed on screen for easy access) */}
      <button 
        onClick={onClose}
        className={`absolute top-4 right-4 md:top-6 md:right-6 z-[110] bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:rotate-90 shadow-lg ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image Container Pop-up */}
      <div 
        className={`relative z-10 w-auto max-w-5xl mx-auto transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
      >
        <div className="relative bg-white p-1.5 md:p-2 rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/20">
            <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto max-h-[80vh] md:max-h-[85vh] object-contain rounded-[1.7rem] bg-slate-50"
            />
        </div>
        
        {/* Caption */}
        <div className={`mt-4 text-center transition-opacity duration-500 delay-100 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
             <span className="inline-block bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 shadow-lg">
                {alt}
             </span>
        </div>
      </div>
    </div>
  );
};

// Helper component for triggering the lightbox
export const ZoomableImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className={`relative group cursor-zoom-in overflow-hidden transform transition-all duration-300 ${className}`} 
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 will-change-transform" 
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur p-2.5 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
             <Maximize2 className="w-5 h-5 text-slate-800" />
          </div>
        </div>
      </div>
      
      <ImageLightbox src={src} alt={alt} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};