import * as esbuild from 'esbuild';
import copy from './settings/esbuild-copy';
import { rmSync } from 'fs';

const isDev = process.argv.includes('--dev');

const outdir = 'dist';

if (!isDev) {
  try {
    rmSync(outdir, { recursive: true, force: true });
    console.log(`✅ folder "${outdir}" cleaned successfully.`);
  } catch (err) {
    console.warn(`⚠️ Failed to clean folder "${outdir}":`, err);
  }
}

const esbuildConfig: esbuild.BuildOptions = {
  entryPoints: ['src/index.ts'],
  minify: !isDev,
  sourcemap: true,
  bundle: true,
  platform: 'node',
  target: 'node23',
  outfile: `${outdir}/index.js`,
  external: ['node:*', 'fastify', '@fastify/*', 'dotenv/config'],
  plugins: [
    copy({
      source: ['public'],
      target: [`${outdir}/public`],
      copyWithFolder: false,
      watch: isDev,
    }),
  ],
  loader: { '.json': 'json' },
  metafile: !isDev,
};

const start = async () => {
  if (isDev) {
    const context = await esbuild.context(esbuildConfig);

    process.on('SIGINT', async () => {
      await context.dispose();
      console.log('Build context disposed.');
      process.exit(0);
    });

    console.log('Building initial bundle...');
    await context.rebuild();
    console.log('Initial build complete. Watching for changes...');
    await context.watch();
  } else {
    console.log('Building...');
    const result = await esbuild.build(esbuildConfig);
    if (result.metafile) {
      console.log(await esbuild.analyzeMetafile(result.metafile));
    }
    console.log('Build finished.');
    process.exit(0);
  }
};

start().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
