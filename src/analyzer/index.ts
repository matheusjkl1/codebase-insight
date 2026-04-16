import type { RetrievedChunk } from '../retriever';
import { getSystemPrompt, type AnalysisMode } from './prompts';
import { ChatOpenAI } from '@langchain/openai';

export interface AnalyzerProvider {
  analyze(context: string, mode: AnalysisMode): Promise<string>;
}

export class OpenAIAnalyzerProvider implements AnalyzerProvider {
  private model: ChatOpenAI;

  constructor(apiKey?: string, modelName: string = 'gpt-4o-mini') {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName,
      temperature: 0.2,
    });
  }

  async analyze(context: string, mode: AnalysisMode): Promise<string> {
    const prompt = getSystemPrompt(mode) + '\n\n=== CONTEXTO DA BUSCA ===\n' + context;
    const response = await this.model.invoke(prompt);
    
    return typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
  }
}

export class OpenRouterAnalyzerProvider implements AnalyzerProvider {
  constructor(
    private apiKey: string,
    private model: string = 'openai/gpt-4o-mini'
  ) {}

  async analyze(context: string, mode: AnalysisMode): Promise<string> {
    const prompt = getSystemPrompt(mode) + '\n\n=== CONTEXTO DA BUSCA ===\n' + context;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (typeof content !== 'string') {
      throw new Error('Formato inesperado na resposta do OpenRouter');
    }

    return content;
  }
}

export async function generateAnalysis(
  chunks: RetrievedChunk[],
  provider: AnalyzerProvider,
  mode: AnalysisMode
): Promise<string> {
  const contextParts = chunks.map((chunk) => {
    return `[Arquivo/Atributo: ${chunk.path}]\n${chunk.content}`;
  });

  const fullContext = contextParts.join('\n\n-----------------\n\n');

  return provider.analyze(fullContext, mode);
}
