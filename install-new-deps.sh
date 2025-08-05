#!/bin/bash

echo "📦 安装认知考古系统新依赖..."
echo "================================"

# 前端依赖
echo "📌 安装前端依赖..."
npm install zustand socket.io-client
npm install @types/three --save-dev

# 后端依赖
echo "📌 安装后端依赖..."
cd backend
npm install socket.io redis ioredis
npm install @types/socket.io --save-dev

echo "✅ 依赖安装完成！"
echo ""
echo "新增的包："
echo "- zustand: 轻量级状态管理"
echo "- socket.io: 实时通信"
echo "- redis/ioredis: 会话持久化"
echo ""
echo "下一步："
echo "1. 运行 ./start.sh 启动系统"
echo "2. 访问 http://localhost:3000/cognitive-archaeology"