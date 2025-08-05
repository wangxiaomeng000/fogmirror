import mongoose, { Document, Schema } from 'mongoose';
import { Message, LayerData } from '../types';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: Message[];
  layerData: LayerData[];
  createdAt: Date;
  updatedAt: Date;
}

const emotionalToneSchema = new Schema({
  primary: String,
  intensity: Number,
  confidence: Number
}, { _id: false });

const analysisResultSchema = new Schema({
  facts: [String],
  insights: [String],
  concepts: [String],
  emotionalTone: emotionalToneSchema,
  suggestions: [String]
}, { _id: false });

const messageSchema = new Schema({
  id: String,
  content: String,
  role: {
    type: String,
    enum: ['user', 'ai']
  },
  timestamp: Number,
  image: String,
  analysis: analysisResultSchema
}, { _id: false });

const layerDataSchema = new Schema({
  id: String,
  type: {
    type: String,
    enum: ['facts', 'insights', 'concepts']
  },
  content: String,
  position: [Number],
  color: String,
  intensity: Number,
  relatedMessageId: String
}, { _id: false });

const sessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  title: {
    type: String,
    default: '新对话'
  },
  messages: [messageSchema],
  layerData: [layerDataSchema]
}, {
  timestamps: true
});

export default mongoose.model<ISession>('Session', sessionSchema);