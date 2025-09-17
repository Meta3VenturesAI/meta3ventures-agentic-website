import React, { useState, useRef, useEffect, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackText?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcSet?: string;
  fallbackSrc?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError,
  fallbackText,
  loading = 'lazy',
  sizes,
  srcSet,
  fallbackSrc
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reliable fallback images with proper CORS headers
  const fallbackImages = [
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || isInView) return;

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading, isInView]);

  // Handle image load success
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image load error with fallback
  const handleError = useCallback(() => {
    console.warn(`Failed to load image: ${currentSrc}`);
    
    // Try provided fallback if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    // Try first fallback if we haven't already
    if (currentSrc === src && fallbackImages.length > 0) {
      setCurrentSrc(fallbackImages[0]);
      return;
    }
    
    // If fallback also fails, show error state
    setHasError(true);
    onError?.();
  }, [currentSrc, src, onError, fallbackImages, fallbackSrc]);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Log image loading for debugging
  useEffect(() => {
    console.log(`Loading image: ${src}`);
  }, [src]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Main image */}
      {isInView && !hasError && (
        <img
          src={currentSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          decoding="async"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            display: hasError ? 'none' : 'block'
          }}
        />
      )}
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700 min-h-[200px]">
          <div className="text-center p-4">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {fallbackText || alt || 'Image unavailable'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;