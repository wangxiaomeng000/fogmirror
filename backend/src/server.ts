import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

dotenv.config();

// 打印AI服务配置
console.log('\n=== AI服务配置 ===');
console.log('AI_SERVICE_TYPE:', process.env.AI_SERVICE_TYPE);
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '已设置' : '未设置');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '已设置' : '未设置');
console.log('当前工作目录:', process.cwd());
console.log('.env文件路径:', require('path').resolve('.env'));
console.log('==================\n');

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: '请求过于频繁，请稍后再试'
});

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

app.use('/api', routes);

app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start server after MongoDB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });