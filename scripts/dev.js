// Wrapper script to suppress HMR ping errors with Turbopack
process.on('unhandledRejection', (error) => {
  if (error && error.message && error.message.includes('unrecognized HMR message')) {
    // Silently ignore HMR ping errors - known Turbopack issue in Next.js 15
    return;
  }
  // Log other unhandled rejections
  console.error('Unhandled rejection:', error);
});

// Start Next.js dev server with Turbopack
const { spawn } = require('child_process');

const proc = spawn('npx', ['next', 'dev', '--turbopack'], {
  stdio: ['inherit', 'inherit', 'pipe'],
  shell: true,
});

// Filter out HMR ping errors from stderr
proc.stderr.on('data', (data) => {
  const output = data.toString();
  // Filter out HMR ping errors
  if (!output.includes('unrecognized HMR message')) {
    process.stderr.write(data);
  }
});

proc.on('close', (code) => {
  process.exit(code || 0);
});

// Forward SIGINT and SIGTERM to child process
process.on('SIGINT', () => proc.kill('SIGINT'));
process.on('SIGTERM', () => proc.kill('SIGTERM'));

