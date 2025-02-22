import { TestWatcher } from './utils/testWatcher';

const watcher = new TestWatcher('./src');

// Handle process termination
process.on('SIGINT', () => {
  watcher.close();
  process.exit(0);
}); 