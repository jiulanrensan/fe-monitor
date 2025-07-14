import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 复制配置文件到构建目录
 */
function copyConfig() {
  const configDir = path.resolve(__dirname, '../config');
  const distDir = path.resolve(__dirname, '../dist');
  const distConfigDir = path.resolve(distDir, 'config');

  // console.log('Copying config files...');
  // console.log('Source:', configDir);
  // console.log('Destination:', distConfigDir);

  try {
    // 检查源目录是否存在
    if (!fs.existsSync(configDir)) {
      console.error('Config directory not found:', configDir);
      return;
    }

    // 创建目标目录
    if (!fs.existsSync(distConfigDir)) {
      fs.mkdirSync(distConfigDir, { recursive: true });
    }

    // 复制所有配置文件
    const files = fs.readdirSync(configDir);
    files.forEach(file => {
      const sourcePath = path.join(configDir, file);
      const destPath = path.join(distConfigDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied: ${file}`);
      }
    });

    console.log('Config files copied successfully!');
  } catch (error) {
    console.error('Error copying config files:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
copyConfig();