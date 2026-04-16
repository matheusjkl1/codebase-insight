import { MemoryStore } from '../memory';
import { retrieveChunks } from './index';

async function test() {
  console.log("Iniciando teste do Retriever Semântico...");

  const store = new MemoryStore();
  
  // Vetor de teste: representa semântica mais alinhada ao eixo X positivo [1, 0, 0]
  const queryVector = [1, 0, 0];

  // Injetando Chunks no Memory Store
  store.save([
    {
      path: 'src/mock1.ts',
      content: 'Este é um arquivo altamente alinhado ao significado (Alta Similaridade).',
      metadata: { chunkIndex: 0, totalChunks: 1 },
      embedding: [0.9, 0.1, 0.0]
    },
    {
       path: 'src/mock2.ts',
       content: 'Este arquivo é totalmente ortogonal ao que queremos (Similaridade ~0).',
       metadata: { chunkIndex: 0, totalChunks: 1 },
       embedding: [0.0, 1.0, 0.0]
    },
    {
       path: 'src/mock3.ts',
       content: 'Este arquivo é o oposto do que desejamos (Similaridade Negativa).',
       metadata: { chunkIndex: 0, totalChunks: 1 },
       embedding: [-1.0, 0.0, 0.0]
    }
  ]);

  const topK = 2; // Queremos os 2 mais similares
  const results = retrieveChunks(queryVector, store, topK);

  console.log(`\nEfetuando busca semântica (Top-K = ${topK})...`);
  
  if (results.length !== topK) {
      console.warn(`Era esperado retornar ${topK} itens, mas retornou ${results.length}.`);
  }

  for (const res of results) {
     console.log(`[Score: ${res.similarity.toFixed(4)}] ${res.path} -> ${res.content}`);
  }
}

test().catch(console.error);
