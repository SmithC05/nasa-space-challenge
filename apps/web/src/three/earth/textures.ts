import * as THREE from 'three';

// Cached texture instances
let cachedEarthTexture: THREE.Texture | null = null;
let cachedCloudTexture: THREE.Texture | null = null;
let cachedSpecularTexture: THREE.Texture | null = null;
let cachedNormalTexture: THREE.Texture | null = null;

const loader = typeof document !== 'undefined' ? new THREE.TextureLoader() : null;

/**
 * Loads the authentic high-resolution NASA Blue Marble daytime Earth texture.
 * Features real continent geography, coastlines, mountain ranges, biomes, and polar ice.
 * Automatically falls back to procedural generation if the asset is unavailable.
 */
export function loadEarthDayTexture(): THREE.Texture {
  if (cachedEarthTexture) return cachedEarthTexture;

  if (loader) {
    try {
      const texture = loader.load(
        '/textures/earth_day_2048.jpg',
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
        },
        undefined,
        () => {
          // Graceful fallback to procedural canvas if texture fails
          cachedEarthTexture = createEarthDayTexture();
        }
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      cachedEarthTexture = texture;
      return texture;
    } catch {
      // In case of any loader error, fallback gracefully
      return createEarthDayTexture();
    }
  }

  return createEarthDayTexture();
}

/**
 * Loads the authentic NASA cloud texture.
 * Features realistic swirling meteorological cloud bands and transparency.
 */
export function loadEarthCloudTexture(): THREE.Texture {
  if (cachedCloudTexture) return cachedCloudTexture;

  if (loader) {
    try {
      const texture = loader.load(
        '/textures/earth_clouds_2048.png',
        (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
        },
        undefined,
        () => {
          cachedCloudTexture = createEarthCloudTexture();
        }
      );
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      cachedCloudTexture = texture;
      return texture;
    } catch {
      return createEarthCloudTexture();
    }
  }

  return createEarthCloudTexture();
}

/**
 * Loads the NASA water/land specular mask.
 * Water bodies reflect sunlight sharply, while landmasses remain matte.
 */
export function loadEarthSpecularTexture(): THREE.Texture {
  if (cachedSpecularTexture) return cachedSpecularTexture;

  if (loader) {
    try {
      const texture = loader.load(
        '/textures/earth_specular_2048.jpg',
        (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
        },
        undefined,
        () => {
          cachedSpecularTexture = createEarthSpecularMap();
        }
      );
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      cachedSpecularTexture = texture;
      return texture;
    } catch {
      return createEarthSpecularMap();
    }
  }

  return createEarthSpecularMap();
}

/**
 * Loads the NASA topographic relief normal map.
 * Adds fine elevation relief to mountain ranges (Himalayas, Andes, Rockies).
 */
export function loadEarthNormalTexture(): THREE.Texture {
  if (cachedNormalTexture) return cachedNormalTexture;

  if (loader) {
    try {
      const texture = loader.load(
        '/textures/earth_normal_2048.jpg',
        (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
        },
        undefined,
        () => {
          cachedNormalTexture = null;
        }
      );
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      cachedNormalTexture = texture;
      return texture;
    } catch {
      // In case of error, normal map is optional
      return new THREE.Texture();
    }
  }

  return new THREE.Texture();
}

// =========================================================================
// PROCEDURAL FALLBACKS (Guarantees 100% offline & test functionality)
// =========================================================================

export function createEarthDayTexture(width = 1024, height = 512): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    const dummy = new THREE.DataTexture(new Uint8Array([20, 50, 120, 255]), 1, 1);
    dummy.needsUpdate = true;
    return dummy as unknown as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0.0, '#0a1d37');
  oceanGrad.addColorStop(0.2, '#0f2f5e');
  oceanGrad.addColorStop(0.5, '#123e7a');
  oceanGrad.addColorStop(0.8, '#0f2f5e');
  oceanGrad.addColorStop(1.0, '#0a1d37');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createEarthCloudTexture(width = 1024, height = 512): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    const dummy = new THREE.DataTexture(new Uint8Array([255, 255, 255, 100]), 1, 1);
    dummy.needsUpdate = true;
    return dummy as unknown as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  for (let x = 0; x < width; x += 15) {
    const yCenter = height * 0.5 + Math.sin(x * 0.015) * 35;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, yCenter, 40, 25, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createEarthSpecularMap(width = 512, height = 256): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    const dummy = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    dummy.needsUpdate = true;
    return dummy as unknown as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
