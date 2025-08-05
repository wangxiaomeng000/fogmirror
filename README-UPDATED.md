# AI 认知映射系统

基于事实导向的认知分析与可视化系统，通过三层认知模型帮助用户理解复杂问题的本质。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
```

### 2. 启动服务

打开两个终端窗口：

**终端1 - 启动后端服务：**
```bash
cd backend
npm run dev
```

**终端2 - 启动前端服务：**
```bash
npm run dev
```

### 3. 访问系统

- 主应用：http://localhost:3000
- 测试页面：
  - 基础测试：http://localhost:3001/full-test.html
  - 事实导向测试：直接打开 `factual-test.html`

## 🧬 核心功能

### 1. 事实导向对话
- 自动提取时间、地点、人物等事实信息
- 识别并提醒认知偏见
- 引导用户提供具体细节

### 2. 三层认知可视化
- **事实层（蓝色）**：客观可验证的信息
- **洞见层（金色）**：发现的模式和关联
- **观念层（红色）**：深层信念和世界观

### 3. 动态生物体模型
- 将认知状态可视化为有机生命体
- 实时展示认知的健康度、成熟度和复杂度
- 支持层级视图和生物体视图切换

### 4. 智能图片分析
- 识别图片中的客观元素
- 发现异常和矛盾点
- 对比用户描述与实际内容

## 📁 项目结构

```
├── components/           # React组件
│   ├── chat/            # 对话相关组件
│   ├── 3d-visualization/# 3D可视化组件
│   └── layout/          # 布局组件
├── lib/                 # 核心库
│   ├── ai/             # AI引擎
│   │   ├── factExtractionEngine.ts      # 事实提取
│   │   ├── cognitiveAnalysisEngine.ts   # 认知分析
│   │   └── factualImageAnalyzer.ts      # 图片分析
│   └── 3d/             # 3D引擎
│       └── organismEngine.ts             # 生物体模型
├── backend/            # 后端服务
│   └── src/
│       └── services/
│           └── ai/     # AI服务实现
└── docs/               # 文档
    ├── new-architecture-design.md  # 架构设计
    ├── test-plan.md               # 测试方案
    └── implementation-summary.md   # 实施总结
```

## 🧪 测试

### 自动化测试
打开 `factual-test.html`，点击"运行所有测试"进行自动化测试。

### 手动测试场景

1. **事实提取测试**
   ```
   输入："昨天下午3点，我在会议室见了李经理"
   预期：正确提取时间、地点、人物信息
   ```

2. **认知偏见检测**
   ```
   输入："他们总是忽视我的建议"
   预期：检测到过度概括偏见
   ```

3. **图片分析测试**
   - 上传任意图片
   - 系统应返回客观描述和异常点

## ⚙️ 配置

### 环境变量（backend/.env）
```env
# 服务器配置
PORT=3001

# AI服务配置
AI_SERVICE_TYPE=factual-mock  # 使用事实导向模拟服务

# 数据库配置（可选）
MONGODB_URI=mongodb://localhost:27017/ai-chat
```

## 🎯 使用指南

### 对话技巧
1. **提供具体信息**：包括时间、地点、人物
2. **使用客观描述**：避免"我觉得"、"可能"等主观词汇
3. **回应引导问题**：AI会逐步引导您提供更多细节

### 视图切换
- 点击右下角按钮切换"层级视图"和"生物体视图"
- 使用左侧面板选择查看特定认知层

## 🐛 已知问题

1. **API限制**：当前使用模拟AI服务，未接入真实API
2. **数据存储**：使用内存存储，重启后数据丢失
3. **图片分析**：使用模拟数据，未接入真实视觉AI

## 📚 相关文档

- [架构设计文档](docs/new-architecture-design.md)
- [测试方案](docs/test-plan.md)  
- [实施总结](docs/implementation-summary.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License