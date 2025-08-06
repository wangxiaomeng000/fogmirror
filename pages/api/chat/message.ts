import { NextApiRequest, NextApiResponse } from 'next';

// 简单的聊天 API
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, sessionId } = req.body;
    
    // 简单的回复逻辑
    const response = {
      success: true,
      message: {
        role: 'assistant',
        content: `我收到了你的消息："${content}"。雾镜系统正在为你服务。`,
        timestamp: new Date().toISOString()
      },
      sessionId: sessionId || 'demo-session'
    };
    
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}