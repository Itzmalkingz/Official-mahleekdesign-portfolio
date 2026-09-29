"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: "lazy" | "eager";
}

export default function SafeImage({
  src,
  alt,
  className,
  style,
  fallback,
  onLoad,
  onError,
  loading,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Guard against non-string src
  if (typeof src !== "string" || !src) {
    setHasError(true);
    setIsLoading(false);
  }

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  if (hasError) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--blue-deep)",
          color: "rgba(255,255,255,0.4)",
          fontSize: "2rem",
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
        role="img"
        aria-label={alt}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoading ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
      onLoad={handleLoad}
      onError={handleError}
      loading={loading ?? "lazy"}
    />
  );
}