// 情感主题和关键词映射
export const emotionalKeywords = {
  anxiety: ['焦虑', '担心', '紧张', '害怕', '恐惧', '压力', '不安'],
  depression: ['抑郁', '悲伤', '难过', '消沉', '绝望', '无助', '疲惫', '无望'],
  anger: ['愤怒', '生气', '恼火', '不满', '怨恨', '冒犯', '愤慨'],
  grief: ['悲痛', '失落', '思念', '遗憾', '怀念', '缅怀', '伤心'],
  loneliness: ['孤独', '孤单', '寂寞', '疏远', '隔阂', '疏离', '隔离'],
  stress: ['压力', '负担', '紧张', '不堪重负', '喘不过气', '超负荷'],
  relationship: ['感情', '爱情', '婚姻', '分手', '离婚', '挽回', '背叛', '欺骗', '不忠', '怀疑'],
  family: ['家庭', '父母', '子女', '兄弟姐妹', '亲戚', '家人', '责任'],
  work: ['工作', '职场', '同事', '老板', '升职', '加薪', '失业', '跳槽', '转行'],
  health: ['健康', '疾病', '身体', '不适', '疼痛', '医院', '治疗', '康复'],
  confidence: ['自信', '自卑', '能力', '价值', '怀疑自己', '不如人', '比较'],
};

// AI响应模板
export const responseTemplates = {
  general: [
    "我能理解你的感受。{emotion}可能让人感到{feeling}。请告诉我更多，我希望能帮助你。",
    "听起来你正在经历{situation}。这确实是一个{difficulty}的情况，但我们可以一起找到解决方法。",
    "你的感受是完全有效的。面对{challenge}时，{emotion}是很自然的反应。",
    "谢谢你愿意分享这些。{emotion}是很复杂的情绪，让我们一起探索这背后的原因。",
    "这听起来对你来说是一段艰难的时期。{emotion}可能会让人感到无助，但我在这里支持你。"
  ],
  
  anxiety: [
    "我注意到你提到了一些可能引起焦虑的情况。当我们感到焦虑时，通常会认为最坏的情况会发生。你觉得是什么触发了这些想法？",
    "面对未知情况时，焦虑是一种保护机制。不如我们一起探索一下如何管理这些感受，让你重获掌控感。",
    "焦虑经常让我们过度关注潜在的威胁。尝试关注当下可能会有所帮助。你能告诉我此刻你感受到的身体感觉吗？"
  ],
  
  depression: [
    "抑郁的感受非常困难，就像被一层厚重的云层笼罩着。请记住，你并不孤单，也不需要独自承担这些。",
    "当我们感到低落时，往往会忽视自己的成就和积极方面。你今天做了什么，即使是小事，也让自己感到一点点满足或成就感？",
    "抑郁情绪有时会让我们对未来失去希望。但情绪状态是流动变化的，不会永远持续下去。你过去是如何度过困难时期的？"
  ],
  
  relationship: [
    "感情中的挫折确实令人痛苦。在任何关系中，明确表达需求和界限都是很重要的。你们之间的沟通是怎样的？",
    "爱情关系需要双方共同经营。你认为在这段关系中，双方各自的期待是什么？有没有不匹配的地方？",
    "分离和失去是人生中最困难的体验之一。给自己时间和空间去哀悼这段关系是很重要的。你现在如何照顾自己的感受？"
  ],
  
  work: [
    "工作压力可能来自多个方面：任务量、人际关系、个人期望等。你认为是哪方面给你带来最大的挑战？",
    "职场平衡是很多人面临的难题。设定界限很重要，但有时很难实施。你尝试过哪些方法来保护自己的时间和精力？",
    "职业发展常常不是一条直线。挫折和不确定性是过程的一部分。你对自己的职业有什么长期的愿景？"
  ]
};

// 分析模板
export const analysisTemplates = {
  facts: [
    "用户提到了{subject}问题",
    "用户表达了对{subject}的{emotion}",
    "用户正在经历{situation}",
    "用户与{person}的关系出现了{problem}",
    "用户在{area}方面面临{challenge}",
    "用户分享了关于{subject}的个人经历"
  ],
  
  insights: [
    "用户的{emotion}可能源于对{subject}的{perception}",
    "用户似乎将自我价值与{factor}紧密联系",
    "用户可能在{relationship}中设定了不切实际的期望",
    "用户的{behavior}模式可能强化了{negative_outcome}",
    "用户可能缺乏{resource}来有效处理{situation}",
    "对{subject}的不确定性可能加剧了用户的{emotion}",
    "用户可能将{external_event}内化为个人{failure}"
  ],
  
  concepts: [
    "自我认同与外部评价的分离",
    "完美主义与自我批判的循环",
    "接纳不确定性作为生活的一部分",
    "情绪不是定义我们的全部，而是暂时的体验",
    "人际界限与健康关系的建立",
    "失败是成长和自我发现的必要部分",
    "控制与接纳的平衡",
    "脆弱是力量的表现，而非弱点",
    "内在价值不依赖于外部成就",
    "自我同情是情感健康的基石"
  ]
};

// 情感基调分类
export const emotionalTones = [
  { label: '焦虑', intensity: 0.85, confidence: 0.9 },
  { label: '悲伤', intensity: 0.7, confidence: 0.85 },
  { label: '愤怒', intensity: 0.6, confidence: 0.8 },
  { label: '恐惧', intensity: 0.75, confidence: 0.85 },
  { label: '失望', intensity: 0.65, confidence: 0.75 },
  { label: '绝望', intensity: 0.9, confidence: 0.85 },
  { label: '内疚', intensity: 0.7, confidence: 0.8 },
  { label: '羞耻', intensity: 0.8, confidence: 0.75 },
  { label: '困惑', intensity: 0.5, confidence: 0.7 },
  { label: '孤独', intensity: 0.85, confidence: 0.9 },
  { label: '怀念', intensity: 0.6, confidence: 0.8 },
  { label: '纠结', intensity: 0.7, confidence: 0.75 },
  { label: '沮丧', intensity: 0.75, confidence: 0.85 },
  { label: '不安', intensity: 0.65, confidence: 0.8 },
  { label: '中性', intensity: 0.3, confidence: 0.6 },
  { label: '希望', intensity: 0.5, confidence: 0.7 }
];

// 建议模板
export const suggestionTemplates = [
  "尝试进行深呼吸练习来缓解{emotion}",
  "考虑与专业人士交流您的{subject}问题",
  "保持规律的作息可能有助于改善您的{condition}",
  "尝试写日记来整理关于{subject}的思绪",
  "与信任的朋友分享您对{subject}的感受",
  "设定小而可行的目标来解决{problem}",
  "练习自我关爱，特别是在面对{difficulty}时",
  "尝试转变对{subject}的视角",
  "给自己一些时间和空间来处理{emotion}",
  "学习有关{subject}的更多信息可能会有所帮助"
];