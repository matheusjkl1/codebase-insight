import { OpenAIEmbeddings } from '@langchain/openai';
import type { Chunk } from '../splitters';

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private client: OpenAIEmbeddings;

  constructor(apiKey?: string, modelName: string = 'text-embedding-3-small') {
    this.client = new OpenAIEmbeddings({
      modelName,
      openAIApiKey: apiKey,
    });
  }

  async embed(texts: string[]) {
    return this.client.embedDocuments(texts);
  }
}

export class OpenRouterEmbeddingProvider implements EmbeddingProvider {
  constructor(
    private apiKey: string,
    private model: string = 'openai/text-embedding-3-small'
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    return data.data.map((item: any) => item.embedding);
  }
}

export async function generateEmbeddings(
  chunks: Chunk[],
  provider: EmbeddingProvider
): Promise<EmbeddedChunk[]> {
  const texts = chunks.map((chunk) => chunk.content);
  const vectors = await provider.embed(texts);

  return chunks.map((chunk, i) => {
    const embedding = vectors[i];
    if (!embedding) {
      throw new Error(`Missing embedding for chunk ${i}`);
    }
    return {
      ...chunk,
      embedding,
    };
  });
}
