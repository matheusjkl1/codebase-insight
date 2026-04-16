import { saveMarkdownFile } from './index';
import { promises as fs } from 'fs';

async function test() {
  try {
    const mockContent = `# 🚀 Análise do Codebase (Mock)

## 🛠️ Stack Detectada
- TypeScript
- Node.js
- LangChain

## 🧩 Arquitetura
Arquitetura Modular baseada em pipelines.
`;

    const fileName = 'codebase-insight-test.md';
    const filePath = await saveMarkdownFile(mockContent, fileName);
    
    console.log(`✅ Arquivo salvo com sucesso em: ${filePath}`);

    // Validação
    const read = await fs.readFile(filePath, 'utf8');
    if (read === mockContent) {
      console.log('✅ Validação do conteúdo confirmada - Identidade perfeita.');
    } else {
      console.error('❌ Falha na validação do dado salvo.');
    }

    // Cleanup
    await fs.unlink(filePath);
    console.log('🧹 Arquivo de teste limpo.');

  } catch (err: any) {
    console.error('❌ Erro no fluxo de Output:', err.message);
  }
}

test().catch(console.error);
