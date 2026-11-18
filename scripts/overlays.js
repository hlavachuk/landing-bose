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
  const pageInfo = await sharp(page).metadata();
  const base =
    pageInfo.height >= info.height
      ? await sharp(page)
          .extract({ left: 0, top: 0, width, height: info.height })
          .toBuffer()
      : await sharp(page)
          .extend({ bottom: info.height - pageInfo.height, background: '#fff' })
          .toBuffer();
  await sharp(base)
    .composite([{ input: overlay }])
    .jpeg({ quality: 92 })
    .toFile(`docs/screenshots/overlay-${width}.jpg`);
}
