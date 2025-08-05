# 认知考古系统改造总结

## 项目转型概述

已将原有的"AI情感支持聊天系统"改造为"认知考古系统"，实现了从情感陪伴到认知重构的理念转变。

## 核心改造内容

### 1. 理念转变
- **原系统**：情感支持，温暖陪伴，提供建议
- **新系统**：认知考古，苏格拉底式提问，只问不答

### 2. 对话策略改造
创建了新的对话引擎 `cognitiveArchaeology.ts`：
- 苏格拉底式提问库
- 细节深挖策略（时间、空间、动作、情绪）
- 张力点识别算法
- 认知缺口发现

### 3. 可视化重构
从有机生物体改为3D认知地图 `CognitiveMap.tsx`：
- 三层节点结构：事实（蓝）、洞见（金）、观念（红）
- 节点间逻辑连接
- 张力点动态标记（脉动效果）
- 力导向布局算法

### 4. AI服务改造
创建了认知考古专用服务 `cognitiveArchaeologyService.ts`：
- 集成苏格拉底式对话
- 节点提取和分类
- 张力点计算
- 认知缺口识别

### 5. UI/UX更新
- 新主页：突出认知考古理念
- 专用对话界面：左侧地图，右侧对话
- 深色主题，专业感设计
- 移除情感支持相关元素

## 技术实现细节

### 文件结构
```
backend/src/
├── config/
│   └── cognitiveArchaeology.ts    # 核心配置和算法
├── services/ai/
│   └── cognitiveArchaeologyService.ts  # AI服务实现
components/
├── 3d-visualization/
│   └── CognitiveMap.tsx           # 3D认知地图
├── chat/
│   └── CognitiveArchaeologyChat.tsx    # 对话界面
app/
├── page.tsx                       # 新主页
├── cognitive-archaeology/         # 认知考古页面
└── emotional-support/            # 保留的情感支持页面
```

### 关键算法

1. **张力点识别**
   - 检测情绪词汇密度
   - 分析事实支撑度
   - 计算张力值（0-1）

2. **节点关联**
   - 基于关键词匹配
   - 时序关系推断
   - 因果链分析

3. **问题生成**
   - 优先探索张力点
   - 填补认知缺口
   - 深挖具体细节

## 保留功能

- 图片上传和分析（改为寻找认知缺口）
- 会话管理（用于认知地图演化）
- 多AI服务支持（OpenRouter、SiliconFlow等）

## 使用流程

1. 用户选择困扰的事件
2. 从具体场景开始描述
3. AI通过提问引导细节还原
4. 实时生成认知地图
5. 识别张力点和认知缺口
6. 形成新的理解和观念

## 与原需求对比

| 需求项 | 实现状态 |
|--------|----------|
| 苏格拉底式提问 | ✅ 完成 |
| 3D认知地图 | ✅ 完成 |
| 三层节点结构 | ✅ 完成 |
| 张力点识别 | ✅ 完成 |
| 图片分析 | ✅ 完成 |
| 不保存数据 | ✅ 仅会话期间 |
| PC端体验 | ✅ 完成 |
| 移动端适配 | ❌ 待实现 |
| 生物体模型 | ❌ 已移除 |

## 部署说明

1. 设置环境变量：
   ```bash
   AI_SERVICE_TYPE=cognitive-archaeology
   COGNITIVE_BASE_SERVICE=openrouter  # 或其他AI服务
   ```

2. 启动系统：
   ```bash
   ./start.sh
   ```

3. 访问地址：
   - 主页：http://localhost:3000
   - 认知考古：http://localhost:3000/cognitive-archaeology
   - 情感支持（保留）：http://localhost:3000/emotional-support

## 注意事项

- 系统不适用于严重心理问题
- 数据仅在会话期间保存
- 需要稳定的网络连接
- 建议使用Chrome/Edge浏览器