// Compression d'image dans le navigateur avant envoi : une photo de téléphone
// (3-10 Mo) devient ~200-400 Ko en WebP 1600 px — l'upload est 20-30× plus léger.
// Le rendu final est identique : le serveur réduit déjà à 1800 px côté stockage.
// Uniquement importé depuis des composants « use client ».

const MAX_DIM = 1600;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return file;
    }
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", QUALITY));
    // Déjà plus légère que l'encodage produit (petit PNG, icône) → on garde le brut
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp", { type: "image/webp" });
  } catch {
    // Non décodable par le navigateur (HEIC, fichier corrompu…) : le serveur tranchera
    return file;
  }
}

export function compressImages(files: FileList | File[]): Promise<File[]> {
  return Promise.all([...files].map(compressImage));
}
