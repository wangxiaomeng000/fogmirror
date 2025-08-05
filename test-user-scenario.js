/**
 * 用户场景：张明的职场困境认知重构
 * 
 * 背景：28岁的程序员张明，在一家互联网公司工作3年后被裁员。
 * 他对此事件有强烈的情绪反应，需要通过认知考古重新理解这段经历。
 */

const userScenario = {
  user: {
    name: "张明",
    age: 28,
    background: "程序员，工作3年后被裁员"
  },
  
  conversations: [
    {
      round: 1,
      user: "我被公司裁员了，明明我一直很努力工作，经常加班到深夜",
      expectedAI: "被告知裁员是在什么具体场景下？谁告诉你的，当时说了什么？",
      cognitiveNodes: [
        { type: "fact", content: "被公司裁员" },
        { type: "fact", content: "经常加班到深夜" },
        { type: "insight", content: "用户认为努力工作不应该被裁员" },
        { type: "tension", content: "努力工作但被裁员的矛盾" }
      ]
    },
    
    {
      round: 2,
      user: "上周五下午，HR把我叫到会议室，说公司业务调整，我们整个部门都要裁撤",
      expectedAI: "HR具体是怎么说的？除了业务调整，还提到其他原因吗？会议室里还有谁？",
      cognitiveNodes: [
        { type: "fact", content: "上周五下午在会议室" },
        { type: "fact", content: "HR通知裁员" },
        { type: "fact", content: "整个部门裁撤" },
        { type: "insight", content: "不是个人原因而是部门整体裁撤" }
      ]
    },
    
    {
      round: 3,
      user: "只有HR和我，她说这不是我的问题，是公司战略调整。但我还是觉得如果我更优秀就不会被裁",
      image: "/Users/mac/Desktop/workspace.jpg", // 工作环境照片
      expectedAI: "你说'如果我更优秀就不会被裁'，这个想法是什么时候产生的？HR说'不是你的问题'时，你当时的感受是什么？",
      cognitiveNodes: [
        { type: "fact", content: "HR明确说不是个人问题" },
        { type: "belief", content: "更优秀就不会被裁" },
        { type: "tension", content: "HR说不是个人问题 vs 自我归因的矛盾" },
        { type: "insight", content: "从图片看到整洁的工位，体现工作认真" }
      ]
    },
    
    {
      round: 4,
      user: "当时我其实松了一口气，但回家后越想越觉得是自己不够好。看到前同事还在公司，我就在想是不是我哪里做得不够",
      expectedAI: "哪些前同事还在公司？他们和你在同一个部门吗？'松了一口气'和'觉得自己不够好'，这两种感受是怎么转变的？",
      cognitiveNodes: [
        { type: "fact", content: "当时松了一口气" },
        { type: "fact", content: "看到前同事还在公司" },
        { type: "insight", content: "情绪从释然转为自责" },
        { type: "tension", content: "部门裁撤但有同事留下的认知冲突" }
      ]
    },
    
    {
      round: 5,
      user: "他们调到其他部门了。我现在想想，可能是因为他们平时跟领导关系更好吧",
      expectedAI: "你观察到他们跟领导互动的具体场景是什么？什么让你觉得是'关系'而不是其他原因？",
      cognitiveNodes: [
        { type: "fact", content: "前同事调到其他部门" },
        { type: "belief", content: "关系好才能留下" },
        { type: "insight", content: "开始寻找外部归因" },
        { type: "tension", content: "能力vs关系的归因冲突" }
      ]
    }
  ],
  
  expectedOutcomes: {
    cognitiveMapFeatures: [
      "三层节点清晰展示（事实、洞见、信念）",
      "张力点以脉动效果突出显示",
      "节点之间的关联线条表示认知联系",
      "时间轴展示认知演变过程"
    ],
    insights: [
      "区分了客观事实（部门裁撤）和主观解释（个人能力不足）",
      "识别了情绪转变的关键节点",
      "发现了多重归因模式（个人能力、人际关系、公司战略）",
      "揭示了自我价值感与外部事件的纠缠"
    ]
  }
};

module.exports = userScenario;