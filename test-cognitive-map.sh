#!/bin/bash

echo "=== 测试认知地图系统 ==="
echo

# 测试1：基础对话
echo "测试1：用户描述河流污染"
curl -s -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "content": "我记得小时候家乡的河水很清澈，现在已经变黑了",
    "sessionId": "test-cognitive-1"
  }' | jq '.message'

echo
echo "---"
echo

# 测试2：具体时间追问
echo "测试2：回答具体时间"
curl -s -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "content": "最后一次去是2019年春节回家的时候",
    "sessionId": "test-cognitive-1"
  }' | jq '.message'

echo
echo "---"
echo

# 测试3：获取认知地图
echo "测试3：查看认知地图"
curl -s http://localhost:3001/api/cognitive-map/test-cognitive-1 | jq '.cognitiveMap.nodes[] | {text, type}'

echo
echo "=== 测试完成 ==="