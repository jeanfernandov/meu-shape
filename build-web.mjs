import { cp, mkdir, rm } from 'node:fs/promises';

const files = [
  'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'sw.js', 'icons'
];
await rm('www', { recursive: true, force: true });
await mkdir('www', { recursive: true });
for (const file of files) {
  await cp(file, `www/${file}`, { recursive: true });
}
console.log('Arquivos web copiados para www/.');
