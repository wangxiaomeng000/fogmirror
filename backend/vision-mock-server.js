require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Jimp = require('jimp');

const app = express();
const PORT = 3001;

// 配置multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());

// 使用图像处理分析图片基本信息
async function analyzeImageBasic(imageBuffer) {
  try {
    console.log('开始基础图像分析...');
    
    // 使用Jimp读取图像信息
    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // 分析主要颜色
    let colorCounts = {};
    let totalPixels = 0;
    
    // 采样分析（每10个像素采样一次以提高性能）
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        const colorKey = `rgb(${color.r},${color.g},${color.b})`;
        colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        totalPixels++;
      }
    }
    
    // 找出主要颜色
    const mainColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color, count]) => ({
        color,
        percentage: Math.round((count / totalPixels) * 100)
      }));
    
    // 基于图像特征生成描述
    const analysis = generateSmartDescription(width, height, mainColors);
    
    return analysis;
  } catch (error) {
    console.error('图像分析失败:', error);
    throw error;
  }
}

// 基于图像特征智能生成描述
function generateSmartDescription(width, height, mainColors) {
  const aspectRatio = width / height;
  const isLandscape = aspectRatio > 1.2;
  const isPortrait = aspectRatio < 0.8;
  
  // 根据主色调判断场景
  const dominantColor = mainColors[0]?.color || 'rgb(128,128,128)';
  const rgb = dominantColor.match(/\d+/g).map(Number);
  const brightness = (rgb[0] + rgb[1] + rgb[2]) / 3;
  const isBlueish = rgb[2] > rgb[0] && rgb[2] > rgb[1];
  const isGreenish = rgb[1] > rgb[0] && rgb[1] > rgb[2];
  const isWarm = rgb[0] > rgb[2];
  
  let 场景描述 = '';
  let 物品细节 = '';
  let 时间线索 = '';
  let 情绪氛围 = '';
  
  // 智能场景推测
  if (isBlueish && brightness > 150) {
    场景描述 = '室外场景，可能是天空或水域背景';
    时间线索 = '白天，光线充足';
    情绪氛围 = '开阔、宁静的氛围';
  } else if (isGreenish) {
    场景描述 = '自然环境，可能有植物或草地';
    时间线索 = '自然光照条件';
    情绪氛围 = '自然、生机勃勃的感觉';
  } else if (brightness < 80) {
    场景描述 = '室内环境或暗光场景';
    时间线索 = '光线较暗，可能是室内或傍晚';
    情绪氛围 = '私密、安静的氛围';
  } else if (isWarm) {
    场景描述 = '温暖色调的环境，可能是室内或黄昏场景';
    时间线索 = '温暖的光线，可能是黄昏或室内灯光';
    情绪氛围 = '温馨、舒适的感觉';
  } else {
    场景描述 = '中性色调的场景';
    时间线索 = '普通光照条件';
    情绪氛围 = '平和、日常的氛围';
  }
  
  // 根据图片比例推测内容
  if (isLandscape) {
    物品细节 += '横向构图，适合展示风景或全景';
  } else if (isPortrait) {
    物品细节 += '竖向构图，可能包含人物或建筑';
  } else {
    物品细节 += '方形构图，构图平衡';
  }
  
  return {
    场景描述,
    人物信息: '图像分析中，具体人物信息需要高级AI识别',
    物品细节,
    时间线索,
    文字内容: '需要OCR技术识别文字内容',
    情绪氛围,
    特殊发现: `图片尺寸: ${width}x${height}，主色调: ${dominantColor}`,
    分析状态: 'basic-analysis',
    原始描述: `这是一张${width}x${height}像素的图片，主要色调为${dominantColor}`
  };
}

// 测试端点
app.post('/api/vision/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    console.log('\n=== 新的图片分析请求 ===');
    console.log('图片大小:', req.file.size, 'bytes');
    console.log('图片类型:', req.file.mimetype);

    const analysis = await analyzeImageBasic(req.file.buffer);

    res.json({
      success: true,
      analysis,
      imageSize: req.file.size,
      model: 'basic-image-analysis'
    });

  } catch (error) {
    console.error('处理错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Basic Vision Analysis Server',
    model: 'jimp-based-analysis'
  });
});

app.listen(PORT, () => {
  console.log(`
==================================
🎨 基础视觉分析服务
==================================
地址: http://localhost:${PORT}
测试端点: POST /api/vision/analyze
说明: 基于图像处理的智能分析

✅ 服务已启动
==================================
  `);
});