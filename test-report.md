# AI Emotional Support Chat System - Test Report

## Test Summary
- **Date**: 2025-08-04T17:43:38.518Z
- **Environment**: mock AI Service
- **API URL**: http://localhost:3001/api
- **Total Tests**: 35
- **Passed**: 30
- **Failed**: 5

## Test Results

### Core Functionality
- ✅ Health Check
- ✅ Chat Message: "Hello, I need help with my anxiety..."
- ✅ Chat Message: "昨天下午3点，我在会议室见了李经理..."
- ✅ Chat Message: "我觉得他总是针对我，昨天又批评了我的方案..."
- ✅ Chat Message: "他们总是忽视我的建议..."
- ✅ Chat Message: "她肯定认为我不够好..."
- ✅ Chat Message: "要么成功要么失败..."
- ✅ Chat Message: "最近工作压力很大..."
- ✅ Chat Message: "上周五，项目经理说我的方案不行..."
- ✅ Chat Message: "他直接说：'这个方案完全没有考虑成本'..."
- ✅ Chat Message: "会议记录显示预算超支30%..."
- ❌ Session Management
- ✅ Chat Message: "简单消息..."
- ✅ Chat Message: "我最近工作压力很大，经常失眠。昨天老板又批评了我，我觉得自己什么都做不好。..."
- ✅ Chat Message: "分析我的认知偏见..."
- ✅ Chat Message: "最近工作压力很大..."
- ✅ Chat Message: "上周五，项目经理说我的方案不行..."
- ✅ Chat Message: "他直接说：'这个方案完全没有考虑成本'..."
- ✅ Chat Message: "会议记录显示预算超支30%..."
- ✅ Chat Message: "我和同事相处有些问题..."
- ✅ Chat Message: "昨天午餐时，三个同事都没叫我..."
- ✅ Chat Message: "我看到他们一起去了楼下餐厅..."
- ✅ Chat Message: "之前我拒绝了他们的聚餐邀请..."
- ✅ Chat Message: "我在考虑是否换工作..."
- ✅ Chat Message: "现在月薪15K，新公司offer 20K..."
- ✅ Chat Message: "通勤时间会从30分钟增加到1小时..."
- ✅ Chat Message: "家人建议我留在现在的公司..."

### Analysis Features
- ✅ Fact Extraction: 昨天下午3点，我在会议室见了李经理...
- ✅ Fact Extraction: 我觉得他总是针对我，昨天又批评了我的方案...
- ❌ Cognitive Bias Detection: 过度概括
- ❌ Cognitive Bias Detection: 读心术
- ❌ Cognitive Bias Detection: 二元思维
- ✅ 3D Visualization Data Generation

### Performance
- ✅ Performance Test

## Detailed Results
```json
{
  "timestamp": "2025-08-04T17:43:27.294Z",
  "environment": {
    "apiUrl": "http://localhost:3001/api",
    "aiService": "mock",
    "frontendUrl": "http://localhost:3000"
  },
  "tests": [
    {
      "name": "Health Check",
      "success": true,
      "timestamp": "2025-08-04T17:43:27.311Z",
      "status": "ok",
      "responseTime": "16ms"
    },
    {
      "name": "Chat Message: \"Hello, I need help with my anxiety...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:27.700Z",
      "responseTime": "389ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"昨天下午3点，我在会议室见了李经理...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:27.965Z",
      "responseTime": "265ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Fact Extraction: 昨天下午3点，我在会议室见了李经理...",
      "success": true,
      "timestamp": "2025-08-04T17:43:27.966Z",
      "extractedFacts": 4,
      "expectedTypes": [
        "时间",
        "地点",
        "人物"
      ]
    },
    {
      "name": "Chat Message: \"我觉得他总是针对我，昨天又批评了我的方案...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:28.275Z",
      "responseTime": "309ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Fact Extraction: 我觉得他总是针对我，昨天又批评了我的方案...",
      "success": true,
      "timestamp": "2025-08-04T17:43:28.275Z",
      "extractedFacts": 4,
      "expectedTypes": [
        "主观判断",
        "事实"
      ]
    },
    {
      "name": "Chat Message: \"他们总是忽视我的建议...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:28.613Z",
      "responseTime": "338ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": false
    },
    {
      "name": "Cognitive Bias Detection: 过度概括",
      "success": false,
      "timestamp": "2025-08-04T17:43:28.614Z",
      "detectedBiases": [],
      "expectedBias": "过度概括"
    },
    {
      "name": "Chat Message: \"她肯定认为我不够好...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:29.013Z",
      "responseTime": "399ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": false
    },
    {
      "name": "Cognitive Bias Detection: 读心术",
      "success": false,
      "timestamp": "2025-08-04T17:43:29.013Z",
      "detectedBiases": [],
      "expectedBias": "读心术"
    },
    {
      "name": "Chat Message: \"要么成功要么失败...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:29.414Z",
      "responseTime": "401ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": false
    },
    {
      "name": "Cognitive Bias Detection: 二元思维",
      "success": false,
      "timestamp": "2025-08-04T17:43:29.414Z",
      "detectedBiases": [],
      "expectedBias": "二元思维"
    },
    {
      "name": "Image Upload",
      "success": false,
      "timestamp": "2025-08-04T17:43:29.421Z",
      "error": "Mock service does not support image upload",
      "expected": true
    },
    {
      "name": "Chat Message: \"最近工作压力很大...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:29.689Z",
      "responseTime": "268ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"上周五，项目经理说我的方案不行...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:30.600Z",
      "responseTime": "410ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"他直接说：'这个方案完全没有考虑成本'...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:31.446Z",
      "responseTime": "344ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"会议记录显示预算超支30%...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:32.435Z",
      "responseTime": "488ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "3D Visualization Data Generation",
      "success": true,
      "timestamp": "2025-08-04T17:43:32.936Z",
      "hasDynamicModel": true,
      "hasCognitiveMap": true,
      "nodeCount": 49
    },
    {
      "name": "Session Management",
      "success": false,
      "timestamp": "2025-08-04T17:43:32.962Z",
      "error": "Cannot read properties of undefined (reading 'length')"
    },
    {
      "name": "Chat Message: \"简单消息...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:33.203Z",
      "responseTime": "241ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"我最近工作压力很大，经常失眠。昨天老板又批评了我，我觉得自己什么都做不好。...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:33.643Z",
      "responseTime": "439ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"分析我的认知偏见...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:34.120Z",
      "responseTime": "477ms",
      "sessionId": "6890f13f6b9f689ee62be11d",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Performance Test",
      "success": true,
      "timestamp": "2025-08-04T17:43:34.120Z",
      "tests": [
        {
          "type": "simple",
          "duration": "242ms",
          "acceptable": true
        },
        {
          "type": "complex",
          "duration": "439ms",
          "acceptable": true
        },
        {
          "type": "analysis",
          "duration": "477ms",
          "acceptable": true
        }
      ]
    },
    {
      "name": "Chat Message: \"最近工作压力很大...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:34.518Z",
      "responseTime": "398ms",
      "sessionId": "6890f1466b9f689ee62be13a",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"上周五，项目经理说我的方案不行...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:34.830Z",
      "responseTime": "312ms",
      "sessionId": "6890f1466b9f689ee62be13a",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"他直接说：'这个方案完全没有考虑成本'...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:35.143Z",
      "responseTime": "313ms",
      "sessionId": "6890f1466b9f689ee62be13a",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"会议记录显示预算超支30%...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:35.639Z",
      "responseTime": "496ms",
      "sessionId": "6890f1466b9f689ee62be13a",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"我和同事相处有些问题...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:35.958Z",
      "responseTime": "318ms",
      "sessionId": "6890f1476b9f689ee62be143",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"昨天午餐时，三个同事都没叫我...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:36.451Z",
      "responseTime": "493ms",
      "sessionId": "6890f1476b9f689ee62be143",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"我看到他们一起去了楼下餐厅...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:36.897Z",
      "responseTime": "446ms",
      "sessionId": "6890f1476b9f689ee62be143",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"之前我拒绝了他们的聚餐邀请...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:37.406Z",
      "responseTime": "509ms",
      "sessionId": "6890f1476b9f689ee62be143",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"我在考虑是否换工作...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:37.641Z",
      "responseTime": "235ms",
      "sessionId": "6890f1496b9f689ee62be14c",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"现在月薪15K，新公司offer 20K...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:37.940Z",
      "responseTime": "299ms",
      "sessionId": "6890f1496b9f689ee62be14c",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"通勤时间会从30分钟增加到1小时...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:38.243Z",
      "responseTime": "303ms",
      "sessionId": "6890f1496b9f689ee62be14c",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    },
    {
      "name": "Chat Message: \"家人建议我留在现在的公司...\"",
      "success": true,
      "timestamp": "2025-08-04T17:43:38.517Z",
      "responseTime": "274ms",
      "sessionId": "6890f1496b9f689ee62be14c",
      "hasAnalysis": true,
      "emotionalTone": {
        "primary": "探索",
        "intensity": 0.5,
        "confidence": 0.8
      },
      "hasExpectedFeatures": true
    }
  ]
}
```

## Recommendations
- Fix failing tests before deployment
- Consider implementing real AI service for production
- Add more comprehensive error handling
- Implement user authentication for production

## Next Steps
1. Visit http://localhost:3000 to test the UI
2. Run performance benchmarks under load
3. Test with real AI service (OpenRouter/OpenAI)
