import fs from 'fs/promises';
import path from 'path';

export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

export function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

export function getFileNameWithoutExtension(filename) {
  return path.basename(filename, path.extname(filename));
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
}