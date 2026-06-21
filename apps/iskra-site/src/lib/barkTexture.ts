import * as THREE from 'three';

export function createBarkTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  // Base warm dark tone.
  ctx.fillStyle = '#1a110d';
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const verticalStripe = Math.sin(y * 0.12) * 0.5 + 0.5;
      const fineNoise = Math.random();
      const microGroove = Math.sin(x * 0.4) * 0.15 + 0.15;
      const value = verticalStripe * 0.55 + fineNoise * 0.35 + microGroove * 0.1;
      const intensity = Math.floor(value * 180 + 25);
      data[i] = Math.min(255, intensity + 30);
      data[i + 1] = Math.min(255, intensity);
      data[i + 2] = Math.min(255, intensity - 20);
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 1);
  // Used as roughness/bump/displacement map — keep linear color space.
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  return texture;
}
