import { put } from '@vercel/blob';

/**
 * Uploads an image to the configured storage backend (Vercel Blob or local disk).
 * @param file Buffer of the image file
 * @param filename Name to save the file as
 * @returns Public URL to access the image
 */
export async function uploadImage(file: Buffer, filename: string): Promise<string> {
  if (process.env.STORAGE_TYPE === 'blob') {
    // Vercel Blob
    const blob = await put(`products/${filename}`, file, { access: 'public' });
    return blob.url;
  } else {
    // Local disk (VPS or dev)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file);
    // Return the public URL for the file
    return `/uploads/products/${filename}`;
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  const storageSource = process.env.IMAGE_STORAGE_SOURCE;

  if (storageSource === 'blob') {
    // Upload to Vercel Blob
    const blobPath = `public/uploads/products/${file.name}`;
    const { url } = await put(blobPath, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return url;
  } else {
    // Upload to VPS/local (API route)
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload-product-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.url; // Should be the public URL
  }
} 