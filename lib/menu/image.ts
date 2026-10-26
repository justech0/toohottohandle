/** Ürün fotoğrafı adresleri. A2'de depo adresi (Blob/R2) buraya gelir; anahtar aynı kalır. */
const BASE = "/qr/img";

export const imageSrc = (key: string, width: 320 | 720 | 1280): string => `${BASE}/${key}-${width}.webp`;

export const imageSrcSet = (key: string): string => `${imageSrc(key, 720)} 720w, ${imageSrc(key, 1280)} 1280w`;
