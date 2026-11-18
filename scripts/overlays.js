import sharp from 'sharp';
for (const width of [320, 744, 1260]) {
  const reference = `docs/reference/figma-${width}.jpg`;
  const page = `docs/screenshots/page-${width}.jpg`;
  const { data, info } = await sharp(reference)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let index = 3; index < data.length; index += 4) data[index] = 128;
  const overlay = await sharp(data, { raw: info }).png().toBuffer();
  const base = await sharp(page)
    .resize({
      width,
      height: info.height,
      fit: 'contain',
      position: 'top',
      background: '#fff',
    })
    .toBuffer();
  await sharp(base)
    .composite([{ input: overlay }])
    .jpeg({ quality: 92 })
    .toFile(`docs/screenshots/overlay-${width}.jpg`);
}
