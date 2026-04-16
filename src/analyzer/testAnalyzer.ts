import { config } from 'dotenv';
import { OpenAIAnalyzerProvider, OpenRouterAnalyzerProvider, generateAnalysis } from './index';
import type { RetrievedChunk } from '../retriever';

config();

async function test() {
  console.log('Iniciando teste do Analyzer (LLM)...');

  const openAiKey = process.env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!openAiKey && !openRouterKey) {
    console.warn(
      '⚠️ API keys ausentes. Mock local verificado. Teste de geração LLM real cancelado.'
    );
    return;
  }

  const provider = openRouterKey
    ? new OpenRouterAnalyzerProvider(openRouterKey)
    : new OpenAIAnalyzerProvider(openAiKey);

  console.log(`Utilizando provider: ${provider.constructor.name}`);

  // Simula chunks encontrados via retrieval
  const fakeChunks: RetrievedChunk[] = [
    {
      path: 'src/index.ts',
      content: 'import express from "express";\nconst app = express();\napp.listen(3000, () => console.log("OK"));',
      metadata: { chunkIndex: 0, totalChunks: 1 },
      embedding: [],
      similarity: 0.95
    },
    {
      path: 'package.json',
      content: '{\n  "dependencies": {\n    "express": "^4.18.2",\n    "mongoose": "^7.0.0"\n  }\n}',
      metadata: { chunkIndex: 0, totalChunks: 1 },
      embedding: [],
      similarity: 0.92
    }
  ];

  try {
    console.log(`Enviando ${fakeChunks.length} chunks sintéticos como contexto para a IA...`);
    
    // Timer para mostrar quanto tempo durou a chamada
    const start = Date.now();
    const analysis = await generateAnalysis(fakeChunks, provider);
    const end = Date.now();
    
    console.log(`\n✅ Análise gerada com sucesso (${end - start}ms):\n`);
    console.log(analysis);
  } catch (err: any) {
    console.error('\n❌ Falha na geração da análise:', err.message);
  }
}

test().catch(console.error);
