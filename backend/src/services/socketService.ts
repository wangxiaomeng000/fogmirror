import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private io: Server;
  
  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    
    this.setupListeners();
  }
  
  private setupListeners() {
    this.io.on('connection', (socket) => {
      console.log('用户连接:', socket.id);
      
      socket.on('join-session', (sessionId: string) => {
        socket.join(sessionId);
        console.log(`用户 ${socket.id} 加入会话 ${sessionId}`);
      });
      
      socket.on('disconnect', () => {
        console.log('用户断开:', socket.id);
      });
    });
  }
  
  // 广播新节点到会话中的所有用户
  broadcastNode(sessionId: string, node: any) {
    this.io.to(sessionId).emit('node-added', node);
  }
  
  // 广播新连接
  broadcastConnection(sessionId: string, connection: any) {
    this.io.to(sessionId).emit('connection-added', connection);
  }
  
  // 广播张力点更新
  broadcastTensionPoint(sessionId: string, nodeId: string, tension: number) {
    this.io.to(sessionId).emit('tension-updated', { nodeId, tension });
  }
}

export default SocketService;