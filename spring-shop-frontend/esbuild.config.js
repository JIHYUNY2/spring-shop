// esbuild.config.js
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isServe = process.argv.includes('--serve');
const isProd = process.argv.includes('--prod');

const outdir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

// 백엔드 API 주소 주입 (없으면 빈 문자열 → MOCK 모드)
const API_BASE_URL = process.env.API_BASE_URL || '';

const common = {
  entryPoints: ['src/main.ts'],
  outdir,
  bundle: true,
  sourcemap: !isProd,
  minify: isProd,
  target: ['es2020'],
  loader: { '.css': 'css' },
  define: {
    'process.env.API_BASE_URL': JSON.stringify(API_BASE_URL)
  }
};

async function run() {
  if (isServe) {
    const ctx = await esbuild.context(common);
    const { host, port } = await ctx.serve({
      servedir: 'public',
      host: '0.0.0.0',
      port: 5173
    });
    console.log(`\nDev server running → http://${host}:${port}\n`);
  } else {
    await esbuild.build(common);
    console.log('Build complete.');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});