import { config } from 'dotenv';
import { loadFiles } from '../loaders';
import { splitFiles } from '../splitters';
import {
  generateEmbeddings,
  OpenAIEmbeddingProvider,
  OpenRouterEmbeddingProvider,
} from './index';

config();

async function test() {
  const openAiKey = process.env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!openAiKey && !openRouterKey) {
    console.warn(
      '⚠️ API keys (OPENAI_API_KEY ou OPENROUTER_API_KEY) ausentes. Teste de embeddings real cancelado.'
    );
    return;
  }

  const provider = openRouterKey
    ? new OpenRouterEmbeddingProvider(openRouterKey)
    : new OpenAIEmbeddingProvider(openAiKey);

  console.log(`Utilizando provider: ${provider.constructor.name}`);

  const files = await loadFiles('./src/loaders');
  const chunks = await splitFiles(files, 500, 100);

  console.log(`Gerando embeddings reais para ${chunks.length} chunks...`);

  try {
    const embeddedChunks = await generateEmbeddings(chunks, provider);
    console.log(`✅ Embeddings gerados com sucesso.`);

    if (embeddedChunks.length > 0) {
      const firstChunk = embeddedChunks[0];
      if (firstChunk) {
        console.log(
          `- Dimensão do vetor do 1º chunk: ${firstChunk.embedding.length}`
        );
        console.log(
          `- Amostra vetor [0..3]:`,
          firstChunk.embedding.slice(0, 3)
        );
      }
    }
  } catch (err: any) {
    console.error('❌ Falha na geração:', err.message);
  }
}

test().catch(console.error);
