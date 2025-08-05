#!/bin/bash

echo "🌫️ FogMirror 雾镜 - GitHub 设置向导"
echo "=================================="
echo ""

# 询问 GitHub 用户名
read -p "请输入你的 GitHub 用户名: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ 用户名不能为空"
    exit 1
fi

# 设置远程仓库
echo ""
echo "📡 设置远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/${GITHUB_USERNAME}/fogmirror.git"

echo "✅ 远程仓库已设置为: https://github.com/${GITHUB_USERNAME}/fogmirror.git"

# 提示创建仓库
echo ""
echo "⚠️  请确保你已经在 GitHub 上创建了 'fogmirror' 仓库"
echo "   如果还没有，请访问: https://github.com/new"
echo "   仓库名称必须是: fogmirror"
echo ""
read -p "已创建仓库？(y/n): " REPO_CREATED

if [ "$REPO_CREATED" != "y" ]; then
    echo ""
    echo "请先创建仓库，然后重新运行此脚本"
    echo "访问: https://github.com/new"
    exit 0
fi

# 推送代码
echo ""
echo "🚀 推送代码到 GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo ""
    echo "📋 下一步："
    echo "1. 访问 Vercel: https://vercel.com"
    echo "2. 点击 'New Project'"
    echo "3. 导入仓库: https://github.com/${GITHUB_USERNAME}/fogmirror"
    echo "4. 配置环境变量（见 DEPLOY_FOGMIRROR.md）"
    echo "5. 点击 Deploy"
    echo ""
    echo "🎉 祝贺！你的雾镜项目即将上线！"
else
    echo ""
    echo "❌ 推送失败，可能的原因："
    echo "1. GitHub 仓库还未创建"
    echo "2. 网络连接问题"
    echo "3. 认证问题（需要输入 GitHub 用户名和密码/token）"
    echo ""
    echo "💡 提示：GitHub 现在需要使用 Personal Access Token 而不是密码"
    echo "   创建 Token: https://github.com/settings/tokens/new"
fi