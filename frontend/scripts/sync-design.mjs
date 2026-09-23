import { copyFile, mkdir, readFile } from 'node:fs/promises';

const check = process.argv.includes('--check');
const source = new URL('../../design/wishlight/', import.meta.url);
const target = new URL('../src/assets/styles/', import.meta.url);

if (!check) await mkdir(target, { recursive: true });

for (const name of ['tokens.css', 'components.css', 'tokens.json']) {
  if (check) {
    const [expected, actual] = await Promise.all([
      readFile(new URL(name, source), 'utf8'),
      readFile(new URL(name, target), 'utf8'),
    ]);
    if (expected !== actual) {
      console.error(`${name} chưa đồng bộ. Chạy npm run sync:design.`);
      process.exitCode = 1;
    }
  } else {
    await copyFile(new URL(name, source), new URL(name, target));
  }
}

if (!process.exitCode) console.log(check ? 'Wishlight CSS/JSON đã đồng bộ.' : 'Đã copy Wishlight CSS/JSON.');
