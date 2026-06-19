import * as THREE from 'three';

export function createBarkTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  // Base warm dark tone.
  ctx.fillStyle = '#2a1a12';
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const verticalStripe = Math.sin(y * 0.08) * 0.5 + 0.5;
      const fineNoise = Math.random();
      const value = verticalStripe * 0.6 + fineNoise * 0.4;
      const intensity = Math.floor(value * 120 + 30);
      data[i] = intensity + 20;
      data[i + 1] = intensity;
      data[i + 2] = intensity - 10;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}
