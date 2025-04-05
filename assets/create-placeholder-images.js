const fs = require('fs');
const path = require('path');

// Basit tek renk PNG ikonu oluşturan fonksiyon
// Bu sadece geliştirme amacıyla kullanılacak basit bir çözüm
function createColoredBox(width, height, color, filePath) {
  // Bu çok basit bir 1x1 PNG. Gerçek uygulamada daha iyi bir görsel kullanın
  const simplePNG = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0x3f,
    0x00, 0x05, 0xfe, 0x02, 0xfe, 0xdc, 0xcc, 0x59, 0xe7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82
  ]);

  try {
    fs.writeFileSync(filePath, simplePNG);
    console.log(`Created placeholder image at ${filePath}`);
  } catch (error) {
    console.error(`Error creating image at ${filePath}:`, error);
  }
}

// İkonları oluştur
const assetsDir = __dirname;

// icon.png
createColoredBox(1024, 1024, '#4F46E5', path.join(assetsDir, 'icon.png'));

// splash.png
createColoredBox(1242, 2436, '#4F46E5', path.join(assetsDir, 'splash.png'));

// adaptive-icon.png
createColoredBox(1024, 1024, '#4F46E5', path.join(assetsDir, 'adaptive-icon.png'));

// favicon.png
createColoredBox(48, 48, '#4F46E5', path.join(assetsDir, 'favicon.png'));

console.log('All placeholder images created successfully!'); 