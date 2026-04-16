import type { EmbeddedChunk } from '../embeddings';

export class MemoryStore {
  // Mapa de vetores conforme exigido pela arquitetura
  public vectors: Map<string, number[]> = new Map();
  
  // Mapa de dados brutos para posterior recuperação (Retrieval)
  public chunks: Map<string, EmbeddedChunk> = new Map();

  /**
   * Salva uma lista de EmbeddedChunks na memória.
   * Utiliza o caminho do arquivo e o índice do chunk como chave única.
   */
  save(chunksToSave: EmbeddedChunk[]): void {
    for (const chunk of chunksToSave) {
      // Exemplo de id: src/index.ts#0
      const id = `${chunk.path}#${chunk.metadata.chunkIndex}`;
      
      this.vectors.set(id, chunk.embedding);
      this.chunks.set(id, chunk);
    }
  }

  /**
   * Retorna todos os chunks salvos.
   */
  getAllChunks(): EmbeddedChunk[] {
    return Array.from(this.chunks.values());
  }

  /**
   * Retorna os vetores salvos.
   */
  getAllVectors(): Map<string, number[]> {
    return this.vectors;
  }

  /**
   * Limpa todo o armazenamento em memória.
   */
  clear(): void {
    this.vectors.clear();
    this.chunks.clear();
  }
}
