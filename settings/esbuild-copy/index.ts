import type { Plugin } from 'esbuild';
import copy from './lib/copy';
import chokidar from 'chokidar';

export interface CopyPluginOptions {
  source: string | string[];
  target: string | string[];
  copyWithFolder?: boolean;
  watch?: boolean;
}

const copyPlugin = ({ source, target, copyWithFolder = false, watch = false }: CopyPluginOptions): Plugin => ({
  name: 'copy',
  setup(build) {
    const doCopy = () => {
      copy({
        source,
        target,
        copyWithFolder,
      });
    };

    build.onStart(() => {
      doCopy();
    });

    if (watch) {
      const paths = Array.isArray(source) ? source : [source];
      const watcher = chokidar.watch(paths, {
        ignoreInitial: true,
      });

      watcher.on('all', (event, filePath) => {
        console.log(`📂 [copyPlugin] Detected ${event} on ${filePath}`);
        doCopy();
      });

      build.onEnd(() => {
        // optional: you could do a last-minute copy after build
        doCopy();
      });
    }
  },
});

export default copyPlugin;
