import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';

/**
 * Salva a análise em um arquivo Markdown.
 *
 * @param content Conteúdo validado em Markdown gerado pelo Analyzer.
 * @param outputPath Caminho do arquivo de saída (padrão: "codebase-insight.md").
 * @returns O caminho absoluto do arquivo salvo.
 */
export async function saveMarkdownFile(
  content: string,
  outputPath: string = 'codebase-insight.md'
): Promise<string> {
  const absolutePath = resolve(process.cwd(), outputPath);

  // Garantir que a estrutura de diretórios exista, caso o usuário passe um caminho complexo
  const directory = dirname(absolutePath);
  await fs.mkdir(directory, { recursive: true });

  await fs.writeFile(absolutePath, content, 'utf8');

  return absolutePath;
}
