#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧹 Cleaning old processes on port 3000...');

try {
  // Убиваем ВСЕ процессы на порту 3000
  try {
    const pids = execSync('lsof -ti:3000', { encoding: 'utf8' }).trim();
    if (pids) {
      console.log(`⚠️  Killing process(es) on port 3000: ${pids}`);
      execSync(`kill -9 ${pids}`);
      console.log('✅ Cleanup complete!');
    } else {
      console.log('✅ Port is clean!');
    }
  } catch (e) {
    // Порт свободен или ошибка
    console.log('✅ Port is clean!');
  }
  
  // Ждем освобождения порта
  setTimeout(() => {
    process.exit(0);
  }, 300);
} catch (error) {
  console.error('Error during cleanup:', error.message);
  process.exit(1);
}

