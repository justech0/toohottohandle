import { imageSrc } from "@/lib/menu/image";

/** Satırdaki küçük kare fotoğraf. Ad yanında yazdığı için alt metni boştur. */
export function RowImage({ imageKey }: { imageKey: string }) {
  return <img className="row__img" src={imageSrc(imageKey, 320)} alt="" width={64} height={64} loading="lazy" decoding="async" />;
}
