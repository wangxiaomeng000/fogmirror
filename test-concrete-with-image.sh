#!/bin/bash

echo "=== 测试具体化AI系统（含图片分析）==="
echo

# 创建一个测试图片（模拟展览照片）
echo "创建测试图片..."
convert -size 400x300 xc:gray \
  -fill black -draw "rectangle 50,50 150,150" \
  -fill darkgray -draw "rectangle 200,50 300,150" \
  -fill white -pointsize 20 -annotate +50+250 "Exhibition Photo" \
  /tmp/test-exhibition.jpg 2>/dev/null || \
  echo -n "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ooooA" | base64 -d > /tmp/test-exhibition.jpg

# 测试1: 发送图片和文字
echo "测试1: 发送展览照片和感受..."
echo

# 使用curl发送multipart请求
curl -s -X POST http://localhost:3001/api/chat/message \
  -F "content=我在这个关于环境破坏的展览上拍了这张照片，看到这些画面让我想起小时候的河流" \
  -F "image=@/tmp/test-exhibition.jpg" \
  -F "sessionId=test-concrete-001" | jq -r '.aiMessage.content'

echo
echo
echo "测试2: 继续对话（无图片）..."
echo

curl -s -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "content": "是的，小时候那条河很清澈，我们经常去游泳，现在已经完全干涸了",
    "sessionId": "test-concrete-001"
  }' | jq -r '.aiMessage.content'

echo
echo
echo "测试3: 检查图片分析结果..."
echo

curl -s http://localhost:3001/api/sessions/test-concrete-001 | jq '.session.messages[] | select(.role=="ai") | {content: .content, imageAnalysis: .imageAnalysis}'

echo
echo "=== 测试完成 ==="