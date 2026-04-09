#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const inputPath = path.resolve(process.argv[2] || 'wedding.html');
const outputPath = path.resolve(process.argv[3] || inputPath.replace(/\.html?$/i, '.inline.html'));

if (!fs.existsSync(inputPath)) {
  console.error(`Input HTML not found: ${inputPath}`);
  process.exit(1);
}

const htmlDir = path.dirname(inputPath);
const html = fs.readFileSync(inputPath, 'utf8');

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
};

function shouldInline(value) {
  if (!value) return false;
  return !/^(data:|https?:|\/\/|#)/i.test(value);
}

function toDataUrl(assetPath) {
  const absolutePath = path.resolve(htmlDir, decodeURI(assetPath));

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Asset not found: ${assetPath}`);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  const data = fs.readFileSync(absolutePath).toString('base64');
  return `data:${mimeType};base64,${data}`;
}

function inlineSrcAttributes(content) {
  return content.replace(/\b(src)=(["'])([^"']+)\2/gi, (match, attr, quote, value) => {
    if (!shouldInline(value)) return match;
    return `${attr}=${quote}${toDataUrl(value)}${quote}`;
  });
}

function inlineCssUrls(content) {
  return content.replace(/url\((['"]?)([^)'"\s]+)\1\)/gi, (match, quote, value) => {
    if (!shouldInline(value)) return match;
    return `url(${quote}${toDataUrl(value)}${quote})`;
  });
}

const bundledHtml = inlineCssUrls(inlineSrcAttributes(html));
fs.writeFileSync(outputPath, bundledHtml, 'utf8');

console.log(`Bundled HTML written to ${outputPath}`);
