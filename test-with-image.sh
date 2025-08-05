#!/bin/bash

echo "测试图片上传功能..."

# 创建一个测试图片（1x1像素的红色图片）
echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" > /tmp/test-image.base64

# 使用FormData格式发送请求
curl -X POST http://localhost:3001/api/chat/message \
  -F "content=这是我今天拍的照片，感觉有些压抑" \
  -F "image=@<(base64 -d /tmp/test-image.base64)" \
  -F "sessionId=test-session-001" \
  | jq '.aiMessage.content'

echo ""
echo "检查后端日志..."
tail -5 /tmp/enhanced-backend.log | grep -E "收到|包含|响应"