import React, { useState } from 'react';
import InfinityLoader from './InfinityLoader';

/**
 * InfinityImage — High-performance image component with horizontal figure-8 (∞) loader
 * 
 * Shows the animated horizontal infinity symbol while the image loads,
 * then smoothly fades the image in with zero layout shift.
 */
const InfinityImage = ({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  aspectRatio = 'aspect-[4/5]',
  loaderSize = 'sm',
  width,
  height,
  loading = 'lazy',
  fetchPriority = 'auto',
  decoding = 'async',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#FAF8F4] flex items-center justify-center ${aspectRatio} ${className}`}>
      {/* Horizontal Figure-8 (∞) Infinity Symbol Loading Indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F4] z-10 transition-opacity duration-300">
          <InfinityLoader size={loaderSize} />
        </div>
      )}

      {/* Actual Product Image */}
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding={decoding}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-400 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
          {...props}
        />
      ) : hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-[#687386] bg-[#FAF8F4]">
          <span className="text-[11px] font-medium">Image unavailable</span>
        </div>
      ) : null}
    </div>
  );
};

export default InfinityImage;
