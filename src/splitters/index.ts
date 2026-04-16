import { RecursiveCharacterTextSplitter, type SupportedTextSplitterLanguage } from '@langchain/textsplitters';
import type { LoadedFile } from '../loaders';
import { extname } from 'path';

export interface Chunk {
  path: string;
  content: string;
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    [key: string]: any;
  };
}

const EXTENSION_TO_LANGUAGE: Record<string, SupportedTextSplitterLanguage> = {
  '.ts': 'js',
  '.js': 'js',
  '.html': 'html',
  '.cpp': 'cpp',
  '.go': 'go',
  '.py': 'python',
  '.java': 'java',
  '.php': 'php',
  '.rb': 'ruby',
  '.rs': 'rust',
  '.sol': 'sol'
};

export async function splitFiles(
  files: LoadedFile[],
  chunkSize = 1000,
  chunkOverlap = 200
): Promise<Chunk[]> {
  const allChunks: Chunk[] = [];

  for (const file of files) {
    const ext = extname(file.path);
    let splitter: RecursiveCharacterTextSplitter;

    const language = EXTENSION_TO_LANGUAGE[ext];

    if (language) {
      splitter = RecursiveCharacterTextSplitter.fromLanguage(language, {
        chunkSize,
        chunkOverlap,
      });
    } else {
      splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
      });
    }

    // Gerar os Documents via Langchain
    const docChunks = await splitter.createDocuments([file.content]);

    for (let i = 0; i < docChunks.length; i++) {
      const docChunk = docChunks[i];
      if (!docChunk) continue;

      allChunks.push({
        path: file.path,
        content: docChunk.pageContent,
        metadata: {
          chunkIndex: i,
          totalChunks: docChunks.length,
          loc: docChunk.metadata.loc,
        },
      });
    }
  }

  return allChunks;
}
