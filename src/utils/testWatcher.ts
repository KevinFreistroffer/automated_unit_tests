import * as chokidar from 'chokidar';
import * as path from 'path';
import { generateTest } from './testGenerator';

const WATCHED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

export class TestWatcher {
  private watcher: chokidar.FSWatcher;

  constructor(watchPath: string) {
    this.watcher = chokidar.watch(watchPath, {
      ignored: [
        /(^|[\/\\])\../, // ignore dotfiles
        /.*\.test\.(js|ts|jsx|tsx)$/, // ignore test files
        /node_modules/,
      ],
      persistent: true
    });

    this.initializeWatcher();
  }

  private initializeWatcher() {
    this.watcher.on('change', async (filePath: string) => {
      const ext = path.extname(filePath);
      
      if (WATCHED_EXTENSIONS.includes(ext)) {
        try {
          await generateTest(filePath);
        } catch (error) {
          console.error(`Error generating test for ${filePath}:`, error);
        }
      }
    });
  }

  public close() {
    this.watcher.close();
  }
} 