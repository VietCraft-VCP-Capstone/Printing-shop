import { useState } from 'react';
import { resolveArtworkUrl } from '../services/api';

interface ArtworkImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function ArtworkImage({
  src,
  alt = 'Bản vẽ in ấn',
  className = 'w-full h-full object-contain'
}: ArtworkImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveArtworkUrl(src);

  if (hasError || !src) {
    return (
      <img
        src="/images/default-design.png"
        alt={alt}
        className={className}
        onError={(e) => {
          // If fallback fails, prevent infinite loop
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
