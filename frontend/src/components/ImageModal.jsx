import React, { useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

const ImageModal = ({ images, currentIndex, isOpen, onClose, onNavigate }) => {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage.url;
  const imageCaption = typeof currentImage === 'object' ? currentImage.caption : '';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-90 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="flex items-center justify-center h-full p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
          aria-label="Close"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 z-50 px-3 py-1 rounded-full bg-black bg-opacity-50 text-white">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Previous Button */}
        {images.length > 1 && currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className="absolute left-4 z-50 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className="absolute right-4 z-50 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            aria-label="Next image"
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>
        )}

        {/* Main Image Container */}
        <div className="relative max-w-7xl max-h-[90vh] flex flex-col items-center">
          {/* Image */}
          <img
            src={imageUrl}
            alt={imageCaption || `Image ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Caption */}
          {imageCaption && (
            <div className="mt-4 px-4 py-2 bg-black bg-opacity-50 rounded-lg">
              <p className="text-white text-center">{imageCaption}</p>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const img = new Image();
              img.src = imageUrl;
              const w = window.open('', '_blank');
              w.document.write(img.outerHTML);
              w.document.title = imageCaption || 'Image';
              w.document.body.style.margin = '0';
              w.document.body.style.display = 'flex';
              w.document.body.style.justifyContent = 'center';
              w.document.body.style.alignItems = 'center';
              w.document.body.style.minHeight = '100vh';
              w.document.body.style.backgroundColor = '#000';
            }}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            aria-label="Open in new tab"
          >
            <ArrowsPointingOutIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-black bg-opacity-50 rounded-lg max-w-full overflow-x-auto">
            {images.map((img, index) => {
              const thumbUrl = typeof img === 'string' ? img : img.url;
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;