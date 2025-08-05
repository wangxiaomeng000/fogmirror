#!/bin/bash

echo "🚀 开始部署 AI 情感支持与认知考古系统"

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm i -g vercel
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建是否成功
if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建成功！"

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
echo "请按照提示操作："
echo "1. 选择部署范围（建议选择你的个人账号）"
echo "2. 链接到现有项目或创建新项目"
echo "3. 确认项目设置"

vercel --prod

echo "🎉 部署脚本执行完成！"
echo "📝 记得在 Vercel 控制台设置环境变量："
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - SILICONFLOW_API_KEY"
echo "   - AI_SERVICE_TYPE=siliconflow"