# 🚀 Codebase Insight

[![pt-br](https://img.shields.io/badge/lang-pt--BR-green.svg)](#-português-pt-br) [![en-us](https://img.shields.io/badge/lang-en--US-blue.svg)](#-english-en-us)

---

## 🇧🇷 Português (pt-BR)

**Codebase Insight** é uma biblioteca ultra-rápida escrita em Node.js e TypeScript. Ela analisa recursivamente um projeto de código fonte local e, combinando técnicas avançadas de RAG (*Retrieval-Augmented Generation*) em uma estrutura *In-Memory* ágil, gera um relatório técnico completo em Markdown. 

A arquitetura extrai automaticamente pontos como:
* 🛠️ Stack detectada
* 🧩 Arquitetura identificada
* 📉 Oportunidades de Melhoria
* ✅ Pontos Fortes

### 📦 Instalação

Pode ser instalada através do npm:
```bash
npm install codebase-insight
```
*(Certifique-se de que o seu ambiente também possui acesso a bibliotecas como `dotenv` se for buscar chaves locais).*

### 🎯 Como Usar (Quick Start)

Graças ao padrão **Strategy**, você jamais expõe chaves por baixo dos panos e pode escolher plugar o seu projeto diretamente na **OpenAI** ou no agregador universal **OpenRouter** para usar uma variedade de provedores (ex: Anthropic, Llama, Google, etc).

Crie o arquivo na sua aplicação e execute:

```typescript
import { config } from 'dotenv';
import { 
  analyzeCodebase, 
  OpenAIEmbeddingProvider, 
  OpenRouterAnalyzerProvider,
  OpenRouterEmbeddingProvider,
  OpenAIAnalyzerProvider
} from 'codebase-insight';

// Carrega as suas próprias de variáveis de ambiente
config();

async function run() {
  // 1. Instancie e configure seus provedores de Embedding e Análise LLM usando a sua chave 
   const embedProvider = 
    new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY, 'text-embedding-3-small') ||
    new OpenRouterEmbeddingProvider(process.env.OPENROUTER_API_KEY, 'nvidia/llama-nemotron-embed-vl-1b-v2:free');

  const aiProvider = new OpenRouterAnalyzerProvider(
    process.env.OPENROUTER_API_KEY, 
    'openai/gpt-4o-mini' // Pode usar anthropic/claude-3-haiku, etc!
  ) || new OpenAIAnalyzerProvider(process.env.OPENAI_API_KEY, 'gpt-4o-mini');

  // 2. Chame a função principal apontando o caminhando do projeto que deve ser lido
  await analyzeCodebase({
    path: './src',                             // Caminho do diretório que será analisado
    output: 'relatorio-tecnico-insight.md',    // Caminho opcional do arquivo de saída gerado
    embeddingProvider: embedProvider,          // A classe que processa os vetores
    analyzerProvider: aiProvider,              // A classe que fará a leitura e escreverá a análise técnica
    
    // Configurações Opcionais Avançadas de RAG:
    mode: 'full', // 'technical' | 'business' | 'full'
    chunkSize: 1000, 
    chunkOverlap: 200,
    topK: 5,
  });
}

run();
```

### ⚙️ Configurações / API Pública

A propriedade core da biblioteca, o método assíncrono `analyzeCodebase`, aceita um objeto da interface `AnalyzeCodebaseOptions`:

| Propriedade | Obrigatório? | Tipo | Descrição |
| ----------- | ----------- | ---- | --------- |
| `path` | **Sim** | `string` | Diretório de origem que o nosso `Loader` lerá recursivamente (p. ex: `./src`). |
| `embeddingProvider` | **Sim** | `EmbeddingProvider` | Módulo encarregado da vetorização. Classes pré-integradas: `OpenAIEmbeddingProvider` e `OpenRouterEmbeddingProvider`. |
| `analyzerProvider` | **Sim** | `AnalyzerProvider` | Encapsulador para o LLM gerador da análise (LLM de *Text/Chat*). Classes: `OpenAIAnalyzerProvider` e `OpenRouterAnalyzerProvider`. |
| `output` | Não | `string` | Destino final do markdown da resposta. (padrão `codebase-insight.md`). |
| `mode` | Não | `string` | Tipo da lente de análise a ser gerada: `'technical'`, `'business'` ou `'full'` (padrão `full`). |
| `query` | Não | `string` | Comando oculto customizado para buscar o contexto via *Retrieval* (vem com um prompt focado em eng. de software pré-configurado). |
| `chunkSize` | Não | `number` | Capacidade máxima de quebra de cada parte de código (padrão `1000`). |
| `chunkOverlap` | Não | `number` | Quantia de caracteres sobrepostos na quebra de limite dos Chunks (padrão `200`). |
| `topK` | Não | `number` | O número `K` de blocos que serão efetivamente enviados por cima do prompt ao final (padrão `5`). |

### 🧩 Arquitetura de Pipelines In-Memory

O Insight Pipeline dispensa a infraestrutura custosa e lenta de um Banco de Dados Vetorial robusto e externo atuando por um ciclo altamente modular operado sob Node.js:
1. **Loader:** Faz o scrape recursivo local filtrando arquivos padrão (`.ts`, `.js`, etc).
2. **Splitter:** Baseado na API nativa oficial do _Langchain_, processa `RecursiveCharacterTextSplitter` inteligente evitando rompimento de blocos lógicos.
3. **Embedder e Memory Store:** Uma estrutura baseada em *Maps* do JS puro indexa rapidamente metadados (`[caminho/arquivo#12]`) sem poluir cache.
4. **Retriever:** Calcula o angulo da *Similaridade do Cosseno* em matemática pura para puxar apenas o ouro processável das lógicas extraídas.
5. **Bypass Blindado:** Concatena os arquivos core da pasta (como `README.md` e `package.json` minuciosamente depurados) na prioridade máxima do ranking, impedindo a "amnésia" espacial do LLM.
6. **Analyzer:** Acopla as chaves semânticas baseadas unicamente no `mode` solicitado ao Prompt inteligente, garantindo respostas de estrita utilística funcional e arquitetural restritas ao formato `MD` focado.

---

## 🇺🇸 English (en-US)

**Codebase Insight** is an ultra-fast Node.js and TypeScript library. It recursively analyzes a local source code project and, by combining advanced RAG (*Retrieval-Augmented Generation*) techniques within an agile *In-Memory* structure, generates a comprehensive technical report in Markdown.

The architecture automatically extracts key points such as:
* 🛠️ Detected Stack
* 🧩 Identified Architecture
* 📉 Opportunities for Improvement
* ✅ Strengths

### 📦 Installation

It can be installed via npm:
```bash
npm install codebase-insight
```
*(Ensure your environment has access to packages like `dotenv` if you intend to fetch local keys).*

### 🎯 How to Use (Quick Start)

Thanks to the **Strategy** pattern, you never expose your hidden keys and can choose to plug your project directly via **OpenAI** or the universal aggregator **OpenRouter** to use a variety of providers (e.g. Anthropic, Llama, Google, etc).

Create a file in your application and run:

```typescript
import { config } from 'dotenv';
import { 
  analyzeCodebase, 
  OpenAIEmbeddingProvider, 
  OpenRouterAnalyzerProvider,
  OpenRouterEmbeddingProvider,
  OpenAIAnalyzerProvider
} from 'codebase-insight';

// Load your own environment variables
config();

async function run() {
  // 1. Instantiate and configure your Embedding and LLM Analysis providers using your keys
  const embedProvider = new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY, 'text-embedding-3-small') ||
    new OpenRouterEmbeddingProvider(process.env.OPENROUTER_API_KEY, 'nvidia/llama-nemotron-embed-vl-1b-v2:free');
  
  const aiProvider = new OpenRouterAnalyzerProvider(
    process.env.OPENROUTER_API_KEY, 
    'openai/gpt-4o-mini' // You can use anthropic/claude-3-haiku, etc!
  ) || new OpenAIAnalyzerProvider(process.env.OPENAI_API_KEY, 'gpt-4o-mini');

  // 2. Call the main function pointing to the project path to be read
  await analyzeCodebase({
    path: './src',                             // Path of the directory to be analyzed
    output: 'insight-technical-report.md',     // Optional path for the generated output file
    embeddingProvider: embedProvider,          // The class that processes the vectors
    analyzerProvider: aiProvider,              // The class that will read and write the technical analysis
    
    // Optional Advanced RAG Settings:
    mode: 'full', // 'technical' | 'business' | 'full'
    chunkSize: 1000, 
    chunkOverlap: 200,
    topK: 5,
  });
}

run();
```

### ⚙️ Configuration / Public API

The core property of the library, the asynchronous method `analyzeCodebase`, accepts an object of the `AnalyzeCodebaseOptions` interface:

| Property | Required? | Type | Description |
| -------- | --------- | ---- | ----------- |
| `path` | **Yes** | `string` | Source directory that our `Loader` will read recursively (e.g.: `./src`). |
| `embeddingProvider` | **Yes** | `EmbeddingProvider` | Module in charge of vectorization. Pre-integrated classes: `OpenAIEmbeddingProvider` and `OpenRouterEmbeddingProvider`. |
| `analyzerProvider` | **Yes** | `AnalyzerProvider` | Encapsulator for the analysis generator LLM (Text/Chat LLM). Classes: `OpenAIAnalyzerProvider` and `OpenRouterAnalyzerProvider`. |
| `output` | No | `string` | Final destination of the response markdown. (default `codebase-insight.md`). |
| `mode` | No | `string` | The focus lens of the analysis to be generated: `'technical'`, `'business'`, or `'full'` (default `full`). |
| `query` | No | `string` | Custom hidden command to fetch context via *Retrieval* (comes with a pre-configured software engineering focused prompt). |
| `chunkSize` | No | `number` | Maximum break capacity for each piece of code (default `1000`). |
| `chunkOverlap` | No | `number` | Amount of overlapping characters passing the chunk limit break (default `200`). |
| `topK` | No | `number` | The number `K` of blocks that will effectively be sent over the prompt if their cosine similarity is the closest to the request (default `5`). |

### 🧩 In-Memory Pipelines Architecture

The Insight Pipeline bypasses the costly and slow infrastructure of a robust, external Vector Database by acting through a highly modular cycle operated under Node.js:
1. **Loader:** Recursively scrapes local files, filtering standard extensions (`.ts`, `.js`, etc).
2. **Splitter:** Based on the official native _Langchain_ API, it processes intelligent `RecursiveCharacterTextSplitter` preventing logical block breakage.
3. **Embedder and Memory Store:** A pure JS *Maps* based structure quickly indexes metadata (`[path/to/file#12]`) without polluting cache.
4. **Retriever:** Calculates the *Cosine Similarity* angle in pure math to pull only the processable gold from the extracted logics.
5. **Core File Bypass:** Concatenates crucial context files (`README.md`, `docker-compose.yml`, mapped/shrunken `package.json`) at highest rank bridging vector limits, mitigating spatial amnesia completely.
6. **Analyzer:** Assertively injects context alongside dynamic instructions according to the requested `mode`, generating flawlessly tailored technical and business Markdown outputs.
