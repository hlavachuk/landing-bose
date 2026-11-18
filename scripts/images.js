import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const originals = new URL('../src/assets/images/', import.meta.url);
const output = new URL('../public/images/', import.meta.url);
await mkdir(output, { recursive: true });
for (const file of await readdir(originals)) {
  if (!/\.(png|jpg)$/i.test(file)) continue;
  const name = path.parse(file).name;
  const input = new URL(file, originals).pathname;
  const metadata = await sharp(input).metadata();
  const widths =
    name.startsWith('hero') || name === 'banner'
      ? [640, 1280, 1920, 2520]
      : [260, 400, 648, 1344];
  for (const width of widths.filter((width) => width <= metadata.width)) {
    const image = sharp(input).resize({ width });
    const prefix = new URL(`${name}-${width}`, output).pathname;
    await Promise.all([
      image.clone().avif({ quality: 55 }).toFile(`${prefix}.avif`),
      image.clone().webp({ quality: 82 }).toFile(`${prefix}.webp`),
      image.clone().jpeg({ quality: 88 }).toFile(`${prefix}.jpg`),
    ]);
  }
}
