// Shrinks a phone photo to a small JPEG data URL (max 720 px, usually 60–150 KB),
// so it can be stored right on the listing without a separate file-storage service.
export async function resizePhoto(file, { max = 720, maxBytes = 300000 } = {}) {
  if (!file || !/^image\//.test(file.type)) throw new Error("NOT_IMAGE");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("DECODE"));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    let q = 0.78;
    let out = canvas.toDataURL("image/jpeg", q);
    while (out.length > maxBytes * 1.37 && q > 0.4) {
      q -= 0.12;
      out = canvas.toDataURL("image/jpeg", q);
    }
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
