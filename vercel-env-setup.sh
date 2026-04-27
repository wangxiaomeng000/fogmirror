#!/bin/bash
# ⚠️ 安全提示：不要把真实凭证提交到 git。原版本含明文 secret，已于 2026-04-28 撤销+轮换。

echo "🔧 FogMirror Vercel 环境变量配置脚本"
echo "===================================="
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 打开你的 Vercel 项目："
echo "   https://vercel.com/wangxiaomeng000s-projects/fogmirror0806/settings/environment-variables"
echo ""
echo "2. 点击 'Bulk Edit' 或 'Add Multiple'"
echo ""
echo "3. 粘贴以下内容（用真实值替换占位符）："
echo ""
cat << 'EOF'
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fogmirror?retryWrites=true&w=majority
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
SILICONFLOW_API_KEY=<your_siliconflow_key>
AI_SERVICE_TYPE=siliconflow
EOF
echo ""
echo "4. 点击 'Save'"
echo ""
echo "5. 重新部署：'...' → 'Redeploy'"
echo ""
echo "🚀 完成后你的网站就可以正常使用了！"
