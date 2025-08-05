# AI 认知映射系统 - 新架构设计

## 核心理念
基于产品哲学文档，系统的核心目标是帮助用户通过三层认知模型（事实-洞见-观念）来理解复杂情况，突破偏见，看到全貌。

## 系统架构变更

### 1. AI对话策略调整

#### 当前状态
- 以情感支持为主，关注用户感受
- 使用模板化的安慰性回复
- 专注于情绪识别和回应

#### 目标状态
- 以事实挖掘为主，引导用户描述具体细节
- 通过苏格拉底式提问法引导用户思考
- 识别用户描述中的偏见和盲点
- 强制用户直视现实，理解事物的生态系统特性

#### 具体改动
```typescript
// 新的对话策略
interface FactExtractionStrategy {
  // 识别用户描述中的主观判断
  identifySubjectiveStatements(message: string): string[];
  
  // 生成引导具体化的问题
  generateFactualQuestions(context: ConversationContext): string[];
  
  // 识别认知偏见
  detectCognitiveBiases(messages: Message[]): BiasReport;
  
  // 生成洞见提示
  generateInsightPrompts(facts: string[]): string[];
}
```

### 2. 三层认知模型实现

#### 事实层（Facts - 蓝色）
- 客观、具体、可验证的信息
- 时间、地点、人物、事件、数据
- 直接引用、观察到的行为

#### 洞见层（Insights - 金色）
- 从事实中提炼的模式和关联
- 因果关系、趋势、矛盾点
- 隐含的假设和前提

#### 观念层（Concepts - 红色）
- 抽象的信念、价值观、世界观
- 潜在的心智模型
- 影响判断的深层框架

### 3. 动态生物体可视化

#### 设计理念
- 不再是散点图，而是一个有机的、会生长的生物体
- 三层结构形成生物体的不同部分：
  - 事实层：细胞核心（最内层）
  - 洞见层：细胞质（中间层）
  - 观念层：细胞膜（外层）
- 随着对话深入，生物体会演化、分裂、融合

#### 技术实现
```typescript
interface OrganismModel {
  // 核心结构
  nucleus: FactCluster[];      // 事实核心
  cytoplasm: InsightNetwork[]; // 洞见网络
  membrane: ConceptBoundary[];  // 观念边界
  
  // 动态行为
  grow(newData: LayerData): void;
  divide(threshold: number): OrganismModel[];
  merge(other: OrganismModel): OrganismModel;
  evolve(time: number): void;
}
```

### 4. 功能模块重构

#### 4.1 对话引擎重构
```typescript
// lib/ai/factExtractionEngine.ts
class FactExtractionEngine {
  // 分析消息，提取事实性内容
  extractFacts(message: string): ExtractedFacts {
    // 识别时间、地点、人物
    // 提取具体数据和引用
    // 标记主观判断
  }
  
  // 生成追问，引导用户提供具体信息
  generateFactualFollowUp(context: ConversationContext): string {
    // 基于缺失的具体信息生成问题
    // 引导用户从概括到具体
    // 挑战模糊表述
  }
}
```

#### 4.2 分析引擎升级
```typescript
// lib/ai/cognitiveAnalysisEngine.ts
class CognitiveAnalysisEngine {
  // 构建认知图谱
  buildCognitiveMap(messages: Message[]): CognitiveMap {
    // 提取事实、洞见、观念
    // 识别它们之间的关联
    // 检测认知偏见和盲点
  }
  
  // 生成洞见
  generateInsights(facts: Fact[]): Insight[] {
    // 寻找模式和关联
    // 识别因果关系
    // 发现矛盾和冲突
  }
}
```

#### 4.3 可视化引擎
```typescript
// lib/3d/organismEngine.ts
class OrganismVisualizationEngine {
  // 生成生物体模型
  generateOrganism(cognitiveMap: CognitiveMap): OrganismModel {
    // 将认知层级映射到生物结构
    // 计算有机形态
    // 应用物理模拟
  }
  
  // 动画演化
  animateEvolution(from: OrganismModel, to: OrganismModel): Animation {
    // 平滑过渡
    // 生长动画
    // 分裂/融合效果
  }
}
```

### 5. 用户交互优化

#### 5.1 引导式对话
- 不再被动回应，而是主动引导
- 使用进度条显示信息完整度
- 高亮标记主观判断，提示需要具体化

#### 5.2 认知偏见提示
- 实时检测并提示可能的认知偏见
- 提供多角度思考的引导
- 显示信息缺失的区域

#### 5.3 图片分析增强
- 识别图片中的异常和矛盾
- 引导用户注意被忽略的细节
- 对比用户描述与图片实际内容

### 6. 测试策略

#### 6.1 单元测试
- 事实提取准确性测试
- 洞见生成逻辑测试
- 生物体模型计算测试

#### 6.2 集成测试
- 完整对话流程测试
- 可视化更新同步测试
- 多轮对话连贯性测试

#### 6.3 用户体验测试
- 引导效果评估
- 认知偏见识别准确率
- 可视化直观性测试

## 实施计划

### 第一阶段：核心引擎开发
1. 实现事实提取引擎
2. 开发认知分析引擎
3. 创建基础生物体模型

### 第二阶段：界面和交互
1. 重构对话界面
2. 实现3D生物体可视化
3. 添加认知偏见提示

### 第三阶段：优化和测试
1. 性能优化
2. 完整测试套件
3. 用户反馈迭代

## 关键技术点

### Three.js 生物体实现
- 使用 Geometry Shader 实现有机形态
- Marching Cubes 算法生成平滑表面
- 物理模拟实现自然动画

### NLP 技术应用
- 依存句法分析提取事实
- 主题建模发现洞见
- 情感极性检测识别偏见

### 实时数据处理
- WebSocket 实时更新
- 增量式认知图谱构建
- 流式生物体演化

## 预期效果

1. **更深入的自我认知**：用户能够看到自己的思维模式和偏见
2. **更全面的问题理解**：通过多层次分析理解问题的复杂性
3. **更直观的认知呈现**：生物体模型直观展示认知状态的演化
4. **更有效的思维引导**：AI主动引导用户探索未知领域