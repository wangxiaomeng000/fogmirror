import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, image, sessionId, history } = req.body;
    
    // 认知考古回复
    const response = {
      success: true,
      response: image 
        ? `我看到了你分享的图片。${content ? `关于"${content}"，` : ''}这背后有什么故事吗？`
        : `关于"${content}"，还有什么具体的画面或对话吗？`,
      analysis: {
        facts: [content],
        insights: [],
        concepts: [],
        emotionalTone: {
          primary: '探索',
          intensity: 0.7,
          confidence: 0.8
        }
      },
      cognitiveNodes: [],
      sessionId: sessionId || `session-${Date.now()}`
    };
    
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}