/** Seed fotoğraflar public'te, içerik özetli yüklemeler kalıcı disktedir. */
export const imageSrc = (key: string, width: 320 | 720 | 1280): string =>
  `${key.startsWith("urun-") || key.startsWith("ornek-") ? "/qr/img" : "/qr/foto"}/${key}-${width}.webp`;

export const imageSrcSet = (key: string): string => `${imageSrc(key, 720)} 720w, ${imageSrc(key, 1280)} 1280w`;
