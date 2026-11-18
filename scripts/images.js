import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const originals = new URL('../src/assets/images/', import.meta.url);
const output = new URL('../public/images/', import.meta.url);
const widePhotos = ['headphones-1', 'speakers-1', 'sunglasses-2'];
await mkdir(output, { recursive: true });

async function render(input, name, widths, ratio) {
  for (const width of widths) {
    const image = sharp(input).resize({
      width,
      ...(ratio ? { height: Math.round(width / ratio), fit: 'cover' } : {}),
    });
    const prefix = new URL(`${name}-${width}`, output).pathname;
    await Promise.all([
      image.clone().avif({ quality: 55 }).toFile(`${prefix}.avif`),
      image.clone().webp({ quality: 82 }).toFile(`${prefix}.webp`),
      image.clone().jpeg({ quality: 88 }).toFile(`${prefix}.jpg`),
    ]);
  }
}

for (const file of await readdir(originals)) {
  if (!/\.(png|jpg)$/i.test(file)) continue;
  const name = path.parse(file).name;
  const input = new URL(file, originals).pathname;
  if (name.endsWith('-mobile') || name.endsWith('-tablet')) {
    const { width } = await sharp(input).metadata();
    await render(
      input,
      name,
      [260, 400, 640, 648, 784, 1280].filter(
        (size) => size <= Math.max(width, 648),
      ),
    );
  } else if (name.startsWith('hero') || name === 'banner') {
    const { width } = await sharp(input).metadata();
    await render(
      input,
      name,
      [640, 1280, 1920, 2520].filter((size) => size <= width),
    );
  } else if (widePhotos.includes(name)) {
    await render(input, name, [260, 400, 648, 1344], 672 / 324);
  } else {
    await render(input, name, [260, 400, 648], 1);
  }
}
