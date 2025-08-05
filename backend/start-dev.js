const { spawn } = require('child_process');
const path = require('path');

// 设置环境变量
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
process.env.TS_NODE_LOG_ERROR = 'true';

// 启动服务
const server = spawn('npx', ['ts-node', '--transpile-only', 'src/server.ts'], {
  cwd: __dirname,
  env: { ...process.env },
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code || 0);
});