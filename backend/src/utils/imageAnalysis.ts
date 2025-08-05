import sharp from 'sharp';

export interface ImageAnalysisResult {
  description: string;
  scene: string;
  mainElement: string;
  atmosphere: string;
  type: string;
}

export async function analyzeImageContent(imageBase64: string): Promise<ImageAnalysisResult> {
  try {
    // 将base64转换为buffer
    const buffer = Buffer.from(imageBase64, 'base64');
    
    // 获取图片元数据
    const metadata = await sharp(buffer).metadata();
    
    // 获取主要颜色
    const stats = await sharp(buffer).stats();
    const dominantChannel = stats.channels.reduce((prev, curr) => 
      curr.mean > prev.mean ? curr : prev
    );
    
    // 基于图片特征生成描述
    let scene = '室内场景';
    let mainElement = '展览展示';
    let atmosphere = '专业正式';
    let type = '活动照片';
    
    // 根据颜色判断场景
    if (dominantChannel.mean > 200) {
      scene = '明亮的室内空间';
      atmosphere = '开放明亮';
    } else if (dominantChannel.mean < 100) {
      scene = '较暗的环境';
      atmosphere = '私密安静';
    }
    
    // 根据尺寸判断类型
    if (metadata.width && metadata.height) {
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio > 1.5) {
        type = '全景照片';
        mainElement = '整体环境';
      } else if (aspectRatio < 0.7) {
        type = '竖版照片';
        mainElement = '特定展品或人物';
      }
    }
    
    const description = `${scene}的${type}，展现了${atmosphere}的氛围`;
    
    return {
      description,
      scene,
      mainElement,
      atmosphere,
      type
    };
    
  } catch (error) {
    console.error('图片分析错误:', error);
    // 返回默认分析结果
    return {
      description: '展会相关的照片',
      scene: '展会现场',
      mainElement: '展览内容',
      atmosphere: '专业',
      type: '照片'
    };
  }
}