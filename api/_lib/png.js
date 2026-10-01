// Minimal PNG encoder (grayscale) and QR → PNG, for email clients that can't render SVG.
import zlib from "node:zlib";
import qrcode from "./qrcode.cjs";

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
export function grayPng(w, h, pixel) {
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w + 1)] = 0; for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = pixel(x, y); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}
export function qrPng(text, scale = 8, quiet = 3) {
  const q = qrcode(0, "M"); q.addData(text); q.make();
  const n = q.getModuleCount(), size = (n + quiet * 2) * scale;
  return grayPng(size, size, (x, y) => {
    const c = Math.floor(x / scale) - quiet, r = Math.floor(y / scale) - quiet;
    return c >= 0 && r >= 0 && c < n && r < n && q.isDark(r, c) ? 17 : 247;
  });
}
