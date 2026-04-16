import { loadFiles } from './index';

async function test() {
  const files = await loadFiles('./src');
  console.log(`Found ${files.length} files:`);
  for (const file of files) {
    console.log(`- ${file.path} (${file.content.length} characters)`);
  }
}

test().catch(console.error);
