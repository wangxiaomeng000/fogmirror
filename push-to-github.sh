#!/bin/bash

echo "🚀 推送AI情感支持聊天系统到GitHub"
echo "=================================="

# 检查Git状态
echo "📋 检查Git状态..."
git status --short

# 确认远程仓库
echo -e "\n📍 远程仓库配置:"
git remote -v

# 尝试推送
echo -e "\n🔄 开始推送到GitHub..."

# 方法1: 标准推送
echo "尝试方法1: 标准HTTPS推送"
git push origin main

# 如果失败，尝试其他方法
if [ $? -ne 0 ]; then
    echo -e "\n尝试方法2: 使用HTTP/1.1"
    git -c http.version=HTTP/1.1 push origin main
fi

# 如果还是失败，提供SSH选项
if [ $? -ne 0 ]; then
    echo -e "\n❌ HTTPS推送失败"
    echo "您可以尝试以下方法："
    echo "1. 检查网络连接"
    echo "2. 配置SSH密钥并使用："
    echo "   git remote set-url origin git@github.com:liweisu59/ai-emotional-support-chat.git"
    echo "   git push origin main"
    echo "3. 使用GitHub Desktop或其他Git客户端"
    echo "4. 等待网络恢复后再次运行此脚本"
else
    echo -e "\n✅ 推送成功！"
    echo "🎉 项目已更新到: https://github.com/liweisu59/ai-emotional-support-chat"
fi