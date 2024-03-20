import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';

const toTiles = (expression: string): string[] => {
  return [...expression.match(/([MPS][1-9]R?|D[RGW]|W[NEWS])/g) || []];
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const handExpression = String(req.query.id);
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  const characterImagePath = path.resolve('./public', 'ogpbase.png');
  const characterImage = await loadImage(characterImagePath);
  context.drawImage(characterImage, 0, 0, characterImage.width, characterImage.height);

  const tileWidth = 80;
  const tileHeight = 130;
  const marginWidth = 10;
  if(handExpression){
    const chunks = handExpression.split('-').map(chunk => toTiles(chunk));
    const totalWidth = 14*tileWidth + (chunks.length - 1)*marginWidth;
    let xOffset = (width - totalWidth)/2;
    const yOffset = 610 - tileHeight;
    for (const chunk of chunks) {
      for(const tile of chunk){
        const imagePath = path.resolve('./public', 'tiles', `${tile}.jpg`);
        const image = await loadImage(imagePath);
        context.drawImage(image, 0, 0, image.width, image.height*0.77, xOffset, yOffset, tileWidth, tileHeight - 20);
        xOffset += tileWidth;
      }
      xOffset += marginWidth;
    }
  }
  // context.font = '72px Roboto medium';
  // context.fillStyle = '#000';
  // context.fillText(`この手は何点？`, 40, 150, width - 40);

  const buffer = canvas.toBuffer('image/png');
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
};
