import type { MemoryStore } from '../memory';
import type { EmbeddedChunk } from '../embeddings';

export interface RetrievedChunk extends EmbeddedChunk {
  similarity: number;
}

/**
 * Calcula a similaridade do cosseno entre dois vetores de mesma dimensionalidade.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vetores com dimensões diferentes na avaliação de similaridade.');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    if (a === undefined || b === undefined) {
      throw new Error('Index undefined na avaliação de similaridade.');
    }
    dotProduct += a * b;
    normA += a ** 2;
    normB += b ** 2;
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retorna os top-K chunks mais similares ao vetor de consulta.
 */
export function retrieveChunks(
  queryVector: number[],
  store: MemoryStore,
  topK: number = 5
): RetrievedChunk[] {
  const vectors = store.getAllVectors();
  const scoredItems: { id: string; score: number }[] = [];

  for (const [id, vector] of vectors.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    scoredItems.push({ id, score: similarity });
  }

  // Organiza em ordem decrescente de similaridade
  scoredItems.sort((a, b) => b.score - a.score);

  // Retém apenas os top-K itens
  const topHits = scoredItems.slice(0, topK);

  const results: RetrievedChunk[] = [];
  for (const hit of topHits) {
    const chunk = store.chunks.get(hit.id);
    if (chunk) {
      results.push({
        ...chunk,
        similarity: hit.score,
      });
    }
  }

  return results;
}
