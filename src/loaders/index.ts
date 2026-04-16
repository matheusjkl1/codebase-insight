import { promises as fs } from 'fs';
import { join, extname } from 'path';

export interface LoadedFile {
  path: string;
  content: string;
}

export async function loadFiles(
  basePath: string,
  allowedExtensions: string[] = ['.ts', '.js', '.json']
): Promise<LoadedFile[]> {
  const loadedFiles: LoadedFile[] = [];

  async function exploreDirectory(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Ignorar pastas comuns que não precisam ser analisadas
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === '.agents'
        ) {
          continue;
        }
        await exploreDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (allowedExtensions.includes(ext) || allowedExtensions.length === 0) {
          const content = await fs.readFile(fullPath, 'utf8');
          loadedFiles.push({
            path: fullPath,
            content,
          });
        }
      }
    }
  }

  await exploreDirectory(basePath);
  return loadedFiles;
}
