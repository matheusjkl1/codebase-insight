import { config } from 'dotenv';
import { resolve } from 'path';
import { analyzeCodebase, OpenRouterEmbeddingProvider, OpenRouterAnalyzerProvider } from 'codebase-insight';

// Carrega as variáveis de ambiente capturando o retorno
const result = config({ path: resolve(__dirname, './.env') });

async function runIntegration() {
  console.log("🚀 Lançando Insight Tool na nova API Frutas usando OpenRouter...");
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterKey) {
    throw new Error('Chave OPENROUTER_API_KEY não localizada no .env!');
  }

  const embedProvider = new OpenRouterEmbeddingProvider(openRouterKey);
  const aiProvider = new OpenRouterAnalyzerProvider(openRouterKey);

  await analyzeCodebase({
    path: resolve(__dirname, '.'),
    output: resolve(__dirname, 'technical-frutas-analise.md'),
    embeddingProvider: embedProvider,
    analyzerProvider: aiProvider,
    chunkSize: 1500,
    mode: 'technical',
    topK: 15,
  });
}

runIntegration().catch(console.error);
