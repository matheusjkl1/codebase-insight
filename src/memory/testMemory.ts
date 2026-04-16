import { MemoryStore } from './index';

async function test() {
  console.log("Iniciando teste do MemoryStore...");

  const store = new MemoryStore();

  const fakeChunks = [
    {
      path: 'src/mock.ts',
      content: 'console.log("Hello");',
      metadata: { chunkIndex: 0, totalChunks: 2 },
      embedding: [0.1, 0.2, 0.3],
    },
    {
      path: 'src/mock.ts',
      content: 'console.log("World");',
      metadata: { chunkIndex: 1, totalChunks: 2 },
      embedding: [0.4, 0.5, 0.6],
    }
  ];

  store.save(fakeChunks);

  const vectors = store.getAllVectors();
  const chunks = store.getAllChunks();

  console.log(`✅ Chunks salvos: ${chunks.length}`);
  console.log(`✅ Vetores salvos: ${vectors.size}`);
  console.log(`Exemplo de Chave no mapa de vetores:`, Array.from(vectors.keys())[0]);
  console.log(`Exemplo de Vetor:`, vectors.get('src/mock.ts#0'));

  store.clear();
}

test().catch(console.error);
