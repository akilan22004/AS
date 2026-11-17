/**
 * Client-side high-performance image optimizer
 * Compresses images before uploading to Supabase Storage,
 * reducing multi-megabyte camera photos down to lightweight WebP/JPEG images (~150-300KB)
 * while preserving high visual quality.
 */
export async function optimizeImage(
  file: File,
  maxDimension = 1800,
  quality = 0.85
): Promise<File> {
  // Only process images
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // Skip SVG or GIF (preserves animations and vectors)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If already under 350KB, keep as is
  if (file.size < 350 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Scale down proportionally if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP if supported, otherwise JPEG
      const outputMime = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
      const ext = outputMime === 'image/webp' ? 'webp' : 'jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file); // Don't use if compressed size is larger
          } else {
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const optimized = new File([blob], `${baseName}.${ext}`, {
              type: outputMime,
              lastModified: Date.now(),
            });
            resolve(optimized);
          }
        },
        outputMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
