import fs from 'node:fs';
import zlib from 'node:zlib';

function createPng(width, height, colorR, colorG, colorB) {
  // A simple valid uncompressed or zlib-compressed RGBA PNG
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression method
  ihdrData.writeUInt8(0, 11); // filter method
  ihdrData.writeUInt8(0, 12); // interlace method

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw pixel data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0: None
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inner badge: emerald green (#059669 -> 5, 150, 105)
        // With an inner white heart / symbol or circle
        const innerDist = Math.sqrt(dx * dx + (dy + width * 0.05) * (dy + width * 0.05));
        if (innerDist < radius * 0.35) {
          // White symbol center
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
        } else {
          rawData[offset++] = colorR;
          rawData[offset++] = colorG;
          rawData[offset++] = colorB;
          rawData[offset++] = 255;
        }
      } else {
        // Transparent or soft background
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate files in /public
fs.writeFileSync('/app/applet/public/icon-192.png', createPng(192, 192, 5, 150, 105));
fs.writeFileSync('/app/applet/public/icon-512.png', createPng(512, 512, 5, 150, 105));
fs.writeFileSync('/app/applet/public/apple-touch-icon.png', createPng(180, 180, 5, 150, 105));
console.log('PWA PNG icons generated successfully!');
