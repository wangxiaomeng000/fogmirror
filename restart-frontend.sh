#!/bin/bash

echo "🔄 重启前端服务..."

# 杀死现有的前端进程
echo "停止现有进程..."
pkill -f "next dev"

# 清理缓存
echo "清理 Next.js 缓存..."
rm -rf .next

# 重新启动
echo "启动前端服务..."
cd /Users/mac/Documents/GitHub/ai-emotional-support-chat
npm run dev

echo "✅ 前端服务已重启"
echo "请访问: http://localhost:3000/cognitive-archaeology"