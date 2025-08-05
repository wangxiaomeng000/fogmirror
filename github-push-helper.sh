#!/bin/bash

echo "🔧 GitHub推送助手"
echo "=================="
echo "邮箱: 2436457557w@gmail.com"
echo "用户: liweisu59"
echo ""

# 检查是否有GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  未检测到GitHub Token"
    echo ""
    echo "请按照以下步骤操作："
    echo ""
    echo "1. 访问 https://github.com/settings/tokens/new"
    echo "2. 创建一个新的Personal Access Token"
    echo "3. 勾选 'repo' 权限"
    echo "4. 复制生成的token"
    echo "5. 运行以下命令（替换YOUR_TOKEN）："
    echo ""
    echo "   export GITHUB_TOKEN=YOUR_TOKEN"
    echo "   ./github-push-helper.sh"
    echo ""
    echo "或者直接使用："
    echo "   git push https://YOUR_TOKEN@github.com/liweisu59/ai-emotional-support-chat.git main"
    exit 1
fi

# 使用token推送
echo "🚀 使用token推送..."
git push https://${GITHUB_TOKEN}@github.com/liweisu59/ai-emotional-support-chat.git main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    echo "🎉 项目已更新到: https://github.com/liweisu59/ai-emotional-support-chat"
else
    echo "❌ 推送失败"
fi