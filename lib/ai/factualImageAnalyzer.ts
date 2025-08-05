export interface ImageAnalysisResult {
  objectsDetected: string[];      // 识别到的物体
  peopleCount: number;            // 人物数量
  facialExpressions: string[];    // 可见的表情描述
  environmentDetails: string[];   // 环境细节
  textContent: string[];          // 图片中的文字
  anomalies: string[];           // 异常或矛盾点
  colorAnalysis: {
    dominantColors: string[];
    lighting: string;
    contrast: string;
  };
  composition: {
    focus: string;
    perspective: string;
    arrangement: string;
  };
}

export class FactualImageAnalyzer {
  // 分析图片，提取客观事实
  async analyzeImage(imageBase64: string): Promise<ImageAnalysisResult> {
    // 模拟图片分析延迟
    await this.delay(800 + Math.random() * 400);
    
    // 这是模拟的分析结果
    // 在实际应用中，这里应该调用真实的图像识别API
    return this.generateMockAnalysis();
  }
  
  // 识别图片中的异常点
  async identifyAnomalies(imageBase64: string): Promise<string[]> {
    await this.delay(600);
    
    const anomalies: string[] = [];
    
    // 模拟异常检测
    const mockAnomalies = [
      '左侧窗户的光线方向与其他光源不一致',
      '桌面物品的影子方向存在差异',
      '背景中有一个人物部分被遮挡',
      '时钟显示的时间与窗外光线不符',
      '镜子中的倒影缺少某些物体',
      '两个相似物体的大小比例异常'
    ];
    
    // 随机选择1-3个异常
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * mockAnomalies.length);
      if (!anomalies.includes(mockAnomalies[index])) {
        anomalies.push(mockAnomalies[index]);
      }
    }
    
    return anomalies;
  }
  
  // 比较用户描述与图片内容
  compareWithDescription(imageAnalysis: ImageAnalysisResult, userDescription: string): {
    matches: string[];
    discrepancies: string[];
    unmentioned: string[];
  } {
    const matches: string[] = [];
    const discrepancies: string[] = [];
    const unmentioned: string[] = [];
    
    // 检查用户描述中提到的元素
    const descriptionLower = userDescription.toLowerCase();
    
    // 检查物体
    imageAnalysis.objectsDetected.forEach(obj => {
      if (descriptionLower.includes(obj.toLowerCase())) {
        matches.push(`提到了图中的${obj}`);
      } else {
        unmentioned.push(`图中的${obj}未被提及`);
      }
    });
    
    // 检查人数
    if (descriptionLower.includes('人') || descriptionLower.includes('个人')) {
      const mentionedCount = this.extractNumberFromText(userDescription);
      if (mentionedCount !== null && mentionedCount !== imageAnalysis.peopleCount) {
        discrepancies.push(`描述中提到${mentionedCount}个人，但图中有${imageAnalysis.peopleCount}个人`);
      }
    }
    
    // 检查环境描述
    const hasEnvironmentDescription = imageAnalysis.environmentDetails.some(
      detail => descriptionLower.includes(detail.toLowerCase())
    );
    if (!hasEnvironmentDescription && imageAnalysis.environmentDetails.length > 0) {
      unmentioned.push('未描述环境细节');
    }
    
    return { matches, discrepancies, unmentioned };
  }
  
  // 生成引导问题
  generateGuidingQuestions(analysis: ImageAnalysisResult): string[] {
    const questions: string[] = [];
    
    if (analysis.peopleCount > 0) {
      questions.push('图中每个人的表情和姿态是怎样的？');
      questions.push('这些人之间的空间关系如何？');
    }
    
    if (analysis.textContent.length > 0) {
      questions.push('图中的文字内容传达了什么信息？');
    }
    
    if (analysis.anomalies.length > 0) {
      questions.push('你注意到图中有什么不寻常的地方吗？');
    }
    
    questions.push('这张图片是在什么时间拍摄的？有什么线索吗？');
    questions.push('图片的拍摄角度说明了什么？');
    
    return questions.slice(0, 3); // 返回最多3个问题
  }
  
  private generateMockAnalysis(): ImageAnalysisResult {
    // 模拟的分析结果生成器
    const objects = ['桌子', '椅子', '电脑', '文件', '咖啡杯', '植物', '窗户', '门'];
    const expressions = ['微笑', '严肃', '专注', '疲倦', '思考'];
    const environments = ['办公室环境', '会议室', '开放办公区', '休息区'];
    const texts = ['工作报告', '时间表', '便签内容'];
    
    // 随机选择一些元素
    const selectedObjects = this.randomSelect(objects, 3, 5);
    const peopleCount = Math.floor(Math.random() * 4);
    const selectedExpressions = peopleCount > 0 ? this.randomSelect(expressions, 1, peopleCount) : [];
    const selectedEnvironment = this.randomSelect(environments, 1, 2);
    const selectedTexts = Math.random() > 0.5 ? this.randomSelect(texts, 1, 2) : [];
    
    return {
      objectsDetected: selectedObjects,
      peopleCount,
      facialExpressions: selectedExpressions,
      environmentDetails: selectedEnvironment,
      textContent: selectedTexts,
      anomalies: [], // 将通过专门的方法生成
      colorAnalysis: {
        dominantColors: ['灰色', '白色', '蓝色'],
        lighting: '自然光从左侧窗户照入',
        contrast: '中等对比度'
      },
      composition: {
        focus: '画面中心偏左',
        perspective: '平视角度',
        arrangement: '对称布局'
      }
    };
  }
  
  private randomSelect<T>(array: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  private extractNumberFromText(text: string): number | null {
    const matches = text.match(/\d+/);
    return matches ? parseInt(matches[0]) : null;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 将图片分析转换为事实陈述
  imageAnalysisToFacts(analysis: ImageAnalysisResult): string[] {
    const facts: string[] = [];
    
    // 物体事实
    if (analysis.objectsDetected.length > 0) {
      facts.push(`图中可见：${analysis.objectsDetected.join('、')}`);
    }
    
    // 人物事实
    if (analysis.peopleCount > 0) {
      facts.push(`图中有${analysis.peopleCount}个人`);
      if (analysis.facialExpressions.length > 0) {
        facts.push(`可观察到的表情：${analysis.facialExpressions.join('、')}`);
      }
    }
    
    // 环境事实
    if (analysis.environmentDetails.length > 0) {
      facts.push(`场景：${analysis.environmentDetails.join('，')}`);
    }
    
    // 文字内容
    if (analysis.textContent.length > 0) {
      facts.push(`可见文字：${analysis.textContent.join('、')}`);
    }
    
    // 光线和构图
    facts.push(analysis.colorAnalysis.lighting);
    facts.push(`构图：${analysis.composition.arrangement}，焦点在${analysis.composition.focus}`);
    
    return facts;
  }
}

export const factualImageAnalyzer = new FactualImageAnalyzer();
export default factualImageAnalyzer;