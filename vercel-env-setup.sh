#!/bin/bash

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
echo "3. 粘贴以下内容："
echo ""
cat << 'EOF'
MONGODB_URI=mongodb+srv://nbutwxm:DzpisvVpDp9Xi7Xu@cluster0.tumyjeh.mongodb.net/fogmirror?retryWrites=true&w=majority
JWT_SECRET=bd1b1bcc8ae1385e891bee129320b5b0861a9a2439b49816bac23083e17de705
SILICONFLOW_API_KEY=sk-wxbgtaaggkaoghcwaklmdfviedodujilineebqdinriymqvm
AI_SERVICE_TYPE=siliconflow
EOF
echo ""
echo "4. 点击 'Save'"
echo ""
echo "5. 重新部署："
echo "   - 回到项目主页"
echo "   - 点击右上角 '...' → 'Redeploy'"
echo "   - 选择最新的 commit"
echo ""
echo "🚀 完成后你的网站就可以正常使用了！"