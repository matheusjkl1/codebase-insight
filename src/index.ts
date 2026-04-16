import { loadFiles } from './loaders';
import { splitFiles } from './splitters';
import { MemoryStore } from './memory';
import { retrieveChunks, type RetrievedChunk } from './retriever';
import { generateEmbeddings, type EmbeddingProvider } from './embeddings';
import { generateAnalysis, type AnalyzerProvider } from './analyzer';
import { saveMarkdownFile } from './output';
import type { AnalysisMode } from './analyzer/prompts';

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
  mode?: AnalysisMode;
  query?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  topK?: number;
}

const CORE_FILES_REGEX = /(package\.json|README\.md|docker-compose\.yml)$/i;

function processCoreContent(path: string, content: string): string {
  if (path.endsWith('package.json')) {
    try {
      const pkg = JSON.parse(content);
      // Evita injeção pesada de dependências visuais/testes que engolem tokens do LLM
      delete pkg.devDependencies;
      delete pkg.scripts;
      return JSON.stringify(pkg, null, 2);
    } catch {
      return content;
    }
  }
  if (path.toLowerCase().endsWith('readme.md')) {
    // Remove badges gigantes e excessivas
    let cleaned = content.replace(/\[!\[[\s\S]*?\]\([\s\S]*?\]\)/g, ''); 
    // Trunca inteligentemente focado no "macro-aspecto" do Header, sem quebrar tokens infinitos
    if (cleaned.length > 2500) {
      return cleaned.slice(0, 2500) + '\n\n...[Conteúdo Truncado]';
    }
    return cleaned;
  }
  return content; // docker-compose.yml descem totalmente preservados
}

function getDefaultQueryForMode(mode: AnalysisMode): string {
  if (mode === 'business') {
    return 'Entenda as regras de negócios primárias, domínios, entidades e os casos de uso vitais em nível de sistema.';
  } else if (mode === 'technical') {
    return 'Descreva os padrões arquiteturais, tecnologias e estrutura de bibliotecas estritamente focando na arquitetura.';
  }
  return 'Faça um apanhado integral descobrindo papéis estruturais funcionais e também quais tecnologias estão por trás do código fonte.';
}

export async function analyzeCodebase(options: AnalyzeCodebaseOptions): Promise<void> {
  const {
    path,
    output = 'codebase-insight.md',
    embeddingProvider,
    analyzerProvider,
    mode = 'full', // Default fallback
    chunkSize = 1000,
    chunkOverlap = 200,
    topK = 5
  } = options;

  const query = options.query ?? getDefaultQueryForMode(mode);

  console.log(`[1/6] Lendo arquivos recursivamente a partir de: ${path}`);
  const files = await loadFiles(path);
  
  if (files.length === 0) {
    throw new Error('Nenhum arquivo válido encontrado no caminho especificado.');
  }

  console.log(`[1.5/6] Extraindo inteligência Core (Bypass Blindado do Retriever)...`);
  const coreChunksQueue: RetrievedChunk[] = [];
  const normalFiles = files.filter(f => {
    if (CORE_FILES_REGEX.test(f.path)) {
      coreChunksQueue.push({
        path: f.path,
        content: processCoreContent(f.path, f.content),
        metadata: { chunkIndex: 0, totalChunks: 1, isCore: true },
        embedding: [], 
        similarity: 1.0 // Classificação garantida nível máximo
      });
      return false; // Não vai passar pelo chunking matemático nem roubar espaço no Store 
    }
    return true;
  });

  console.log(`[2/6] Dividindo submatérias nos chunks (Size: ${chunkSize}, Overlap: ${chunkOverlap})...`);
  const chunks = await splitFiles(normalFiles, chunkSize, chunkOverlap);

  console.log(`[3/6] Indexando as matrizes de embeddings...`);
  const embeddedChunks = await generateEmbeddings(chunks, embeddingProvider);

  console.log(`[4/6] Populando memory store...`);
  const store = new MemoryStore();
  store.save(embeddedChunks);

  console.log(`[5/6] Recuperando contexto semântico profundo (Top-K: ${topK})...`);
  const [queryVector] = await embeddingProvider.embed([query]);
  if (!queryVector) {
    throw new Error('Falha a longo prazo ao gerar Embedding da query.');
  }
  
  const relevantChunks = retrieveChunks(queryVector, store, topK);

  // Combina o Passaporte Injetável de Configurações aos itens varridos em Similaridade  
  const finalContext = [...coreChunksQueue, ...relevantChunks];

  console.log(`[6/6] Extraindo insights em modo '${mode.toUpperCase()}' combinando contexto e núcleo...`);
  const markdown = await generateAnalysis(finalContext, analyzerProvider, mode);

  const savedPath = await saveMarkdownFile(markdown, output);
  console.log(`\n🎉 Análise técnica expandida concluída! O Relatório Arquitetural em Markdown foi salvo em: ${savedPath}`);
}
