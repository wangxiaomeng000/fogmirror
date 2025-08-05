#!/bin/bash

echo "🚀 启动AI情感支持聊天系统..."

# 检查是否安装了必要的工具
command -v node >/dev/null 2>&1 || { echo "❌ 需要安装Node.js"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ 需要安装npm"; exit 1; }

# 检查MongoDB
if ! command -v mongod >/dev/null 2>&1 && ! docker ps | grep -q mongodb; then
    echo "⚠️  未检测到MongoDB，尝试使用Docker启动..."
    docker run -d -p 27017:27017 --name mongodb mongo:7
fi

# 安装依赖
echo "📦 安装前端依赖..."
npm install

echo "📦 安装后端依赖..."
cd backend && npm install && cd ..

# 检查环境变量
if [ ! -f "backend/.env" ]; then
    echo "⚠️  后端环境文件不存在，复制示例文件..."
    cp backend/.env.example backend/.env
    echo "✅ 使用默认配置（Mock AI模式），无需API密钥即可使用！"
fi

if [ ! -f ".env.local" ]; then
    echo "⚠️  前端环境文件不存在，创建默认配置..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
    echo "NEXT_PUBLIC_USE_MOCK_API=false" >> .env.local
fi

# 启动服务
echo "🌟 启动后端服务..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "🌟 启动前端服务..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo "✅ 系统启动完成！"
echo "📍 前端地址: http://localhost:3000"
echo "📍 后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务..."

# 等待中断信号
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait