const fs = require('fs');
const { createCanvas } = require('canvas');

// 创建画布
const canvas = createCanvas(800, 600);
const ctx = canvas.getContext('2d');

// 背景 - 暗色展厅
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(0, 0, 800, 600);

// 墙面
ctx.fillStyle = '#2a2a2a';
ctx.fillRect(0, 0, 800, 400);

// 展览照片框架
ctx.strokeStyle = '#666';
ctx.lineWidth = 3;

// 第一张照片 - 污染的河流
ctx.fillStyle = '#3a3a3a';
ctx.fillRect(100, 100, 200, 150);
ctx.strokeRect(100, 100, 200, 150);
ctx.fillStyle = '#8B4513';
ctx.fillRect(110, 200, 180, 40);
ctx.fillStyle = '#ccc';
ctx.font = '14px Arial';
ctx.fillText('Polluted River', 150, 230);

// 第二张照片 - 工厂
ctx.fillStyle = '#3a3a3a';
ctx.fillRect(500, 100, 200, 150);
ctx.strokeRect(500, 100, 200, 150);
ctx.fillStyle = '#666';
ctx.fillRect(520, 120, 60, 100);
ctx.fillRect(580, 140, 40, 80);
ctx.fillRect(620, 130, 60, 90);
ctx.fillStyle = '#ccc';
ctx.fillText('Industrial Area', 550, 230);

// 展览标题
ctx.fillStyle = '#fff';
ctx.font = 'bold 32px Arial';
ctx.fillText('Environmental Crisis Exhibition', 200, 350);

// 日期
ctx.font = '20px Arial';
ctx.fillText('March 15, 2024 - Beijing', 280, 380);

// 地面反光效果
const gradient = ctx.createLinearGradient(0, 400, 0, 600);
gradient.addColorStop(0, '#2a2a2a');
gradient.addColorStop(1, '#1a1a1a');
ctx.fillStyle = gradient;
ctx.fillRect(0, 400, 800, 200);

// 保存为文件
const buffer = canvas.toBuffer('image/jpeg');
fs.writeFileSync('test-exhibition.jpg', buffer);
console.log('测试图片已创建');
