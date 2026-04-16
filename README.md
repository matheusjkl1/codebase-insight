# 🚀 Codebase Insight

**Codebase Insight** é uma biblioteca ultra-rápida escrita em Node.js e TypeScript. Ela analisa recursivamente um projeto de código fonte local e, combinando técnicas avançadas de RAG (*Retrieval-Augmented Generation*) em uma estrutura *In-Memory* ágil, gera um relatório técnico completo em Markdown. 

A arquitetura extrai automaticamente pontos como:
* 🛠️ Stack detectada
* 🧩 Arquitetura identificada
* 📉 Oportunidades de Melhoria
* ✅ Pontos Fortes

---

## 📦 Instalação

Pode ser instalada através do npm:
```bash
npm install codebase-insight
```
*(Certifique-se de que o seu ambiente também possui acesso a bibliotecas como `dotenv` se for buscar chaves locais).*

---

## 🎯 Como Usar (Quick Start)

Graças ao padrão **Strategy**, você jamais expõe chaves por baixo dos panos e pode escolher plugar o seu projeto diretamente na **OpenAI** ou no agregador universal **OpenRouter** para usar uma variedade de provedores (ex: Anthropic, Llama, Google, etc).

Crie o arquivo na sua aplicação e execute:

```typescript
import { config } from 'dotenv';
import { 
  analyzeCodebase, 
  OpenAIEmbeddingProvider, 
  OpenRouterAnalyzerProvider 
} from 'codebase-insight';

// Carrega as suas próprias de variáveis de ambiente
config();

async function run() {
  // 1. Instancie e configure seus provedores de Embedding e Análise LLM usando a sua chave 
  const embedProvider = new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY, 'text-embedding-3-small');
  
  const aiProvider = new OpenRouterAnalyzerProvider(
    process.env.OPENROUTER_API_KEY, 
    'openai/gpt-4o-mini' // Pode usar anthropic/claude-3-haiku, etc!
  );

  // 2. Chame a função principal apontando o caminhando do projeto que deve ser lido
  await analyzeCodebase({
    path: './src',                             // Caminho do diretório que será analisado
    output: 'relatorio-tecnico-insight.md',    // Caminho opcional do arquivo de saída gerado
    embeddingProvider: embedProvider,          // A classe que processa os vetores
    analyzerProvider: aiProvider,              // A classe que fará a leitura e escreverá a análise técnica
    
    // Configurações Opcionais Avançadas de RAG:
    chunkSize: 1000, 
    chunkOverlap: 200,
    topK: 5,
  });
}

run();
```

---

## ⚙️ Configurações / API Pública

A propriedade core da biblioteca, o método assíncrono `analyzeCodebase`, aceita um objeto da interface `AnalyzeCodebaseOptions`:

| Propriedade | Obrigatório? | Tipo | Descrição |
| ----------- | ----------- | ---- | --------- |
| `path` | **Sim** | `string` | Diretório de origem que o nosso `Loader` lerá recursivamente (p. ex: `./src`). |
| `embeddingProvider` | **Sim** | `EmbeddingProvider` | Módulo encarregado da vetorização. Classes pré-integradas: `OpenAIEmbeddingProvider` e `OpenRouterEmbeddingProvider`. |
| `analyzerProvider` | **Sim** | `AnalyzerProvider` | Encapsulador para o LLM gerador da análise (LLM de *Text/Chat*). Classes: `OpenAIAnalyzerProvider` e `OpenRouterAnalyzerProvider`. |
| `output` | Não | `string` | Destino final do markdown da resposta. (padrão `codebase-insight.md`). |
| `query` | Não | `string` | Comando oculto customizado para buscar o contexto via *Retrieval* (vem com um prompt focado em engenharia de software pré-configurado). |
| `chunkSize` | Não | `number` | Capacidade máxima de quebra de cada parte de código (padrão `1000`). |
| `chunkOverlap` | Não | `number` | Quantia de caracteres sobrepostos na quebra de limite dos Chunks (padrão `200`). |
| `topK` | Não | `number` | O número `K` de blocos que serão efetivamente enviados por cima do prompt ao final caso sua similaridade do cosseno seja a mais próxima do pedido (padrão `5`). |

---

## 🧩 Arquitetura de Pipelines In-Memory

O Insight Pipeline dispensa a infraestrutura custosa e lenta de um Banco de Dados Vetorial robusto e externo atuando por um ciclo altamente modular operado sob Node.js:
1. **Loader:** Faz o scrape recursivo local filtrando arquivos padrão (`.ts`, `.js`, etc).
2. **Splitter:** Baseado na API nativa oficial do _Langchain_, processa `RecursiveCharacterTextSplitter` inteligente evitando rompimento de blocos lógicos.
3. **Embedder e Memory Store:** Uma estrutura baseada em *Maps* do JS puro indexa rapidamente metadados (`[caminho/arquivo#12]`) sem poluir cache.
4. **Retriever:** Calcula o angulo da *Similaridade do Cosseno* em matemática pura para puxar apenas o ouro processável das lógicas extraídas.
5. **Analyzer:** Injeta de forma assertiva as chaves na Prompt principal, garantindo respostas de estrita utilística funcional restritas ao `MD` técnico final.
