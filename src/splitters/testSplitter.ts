import { loadFiles } from '../loaders';
import { splitFiles } from './index';

async function test() {
  const files = await loadFiles('./src');
  console.log(`Loaded ${files.length} files.`);
  
  const chunks = await splitFiles(files, 500, 100);
  console.log(`Split into ${chunks.length} chunks.`);

  if (chunks.length > 0) {
    console.log('\n--- Exemplo do Pimeiro Chunk ---');
    console.log(`Path: ${chunks[0].path}`);
    console.log(`Metadata:`, chunks[0].metadata);
    console.log(`Content:\n${chunks[0].content}`);
  }
}

test().catch(console.error);
