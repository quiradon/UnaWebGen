// Gera o index.html raiz usando o mecanismo atual de páginas (CJS)
const { writeFile, mkdir } = require('fs/promises');
const path = require('path');
const fs = require('fs');

async function main() {
  // Carrega módulo CJS
  const indexMod = require(path.resolve(process.cwd(), 'pages', 'index.js'));
  const t = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'i18n', 'en.json'), 'utf-8'));
  t.lang = 'en';
  const html = await indexMod.page(t, '/index');
  const outDir = path.resolve(process.cwd(), 'dist');
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html, 'utf-8');
  console.log('[postbuild] dist/index.html gerado com sucesso.');
}

main().catch((err) => {
  console.error('[postbuild] Falha ao gerar index.html', err);
  process.exit(1);
});
