import { loadFiles } from './loaders';
import { splitFiles } from './splitters';
import { MemoryStore } from './memory';
import { retrieveChunks } from './retriever';
import { generateEmbeddings, type EmbeddingProvider } from './embeddings';
import { generateAnalysis, type AnalyzerProvider } from './analyzer';
import { saveMarkdownFile } from './output';

export * from './loaders';
export * from './splitters';
export * from './memory';
export * from './retriever';
export * from './embeddings';
export * from './analyzer';
export * from './output';

export interface AnalyzeCodebaseOptions {
  path: string;
  output?: string;
  embeddingProvider: EmbeddingProvider;
  analyzerProvider: AnalyzerProvider;
  query?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  topK?: number;
}

/**
 * Função principal pública responsável por extrair análises técnicas de um projeto de software.
 */
export async function analyzeCodebase(options: AnalyzeCodebaseOptions): Promise<void> {
  const {
    path,
    output = 'codebase-insight.md',
    embeddingProvider,
    analyzerProvider,
    query = 'Descreva os padrões arquiteturais, tecnologias e principais bibliotecas inferidas a partir deste código, focando na sua arquitetura.',
    chunkSize = 1000,
    chunkOverlap = 200,
    topK = 5
  } = options;

  console.log(`[1/6] Lendo arquivos recursivamente a partir de: ${path}`);
  const files = await loadFiles(path);
  
  if (files.length === 0) {
    throw new Error('Nenhum arquivo válido encontrado no caminho especificado.');
  }

  console.log(`[2/6] Dividindo os arquivos em chunks (Size: ${chunkSize}, Overlap: ${chunkOverlap})...`);
  const chunks = await splitFiles(files, chunkSize, chunkOverlap);

  console.log(`[3/6] Gerando embeddings via EmbeddingProvider...`);
  const embeddedChunks = await generateEmbeddings(chunks, embeddingProvider);

  console.log(`[4/6] Populando memory store vetorial...`);
  const store = new MemoryStore();
  store.save(embeddedChunks);

  console.log(`[5/6] Recuperando contexto semântico (Top-K: ${topK})...`);
  const [queryVector] = await embeddingProvider.embed([query]);
  if (!queryVector) {
    throw new Error('Falha contínua ao gerar o Embedding da Query local.');
  }
  
  const relevantChunks = retrieveChunks(queryVector, store, topK);

  console.log(`[6/6] Extraindo insights enviando os dados relevantes para o AnalyzerProvider...`);
  const markdown = await generateAnalysis(relevantChunks, analyzerProvider);

  const savedPath = await saveMarkdownFile(markdown, output);
  console.log(`\n🎉 Análise técnica concluída e consolidada! Arquivo salvo na máquina em: ${savedPath}`);
}
