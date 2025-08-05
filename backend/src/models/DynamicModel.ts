import mongoose, { Document, Schema } from 'mongoose';

export interface IDynamicModel extends Document {
  sessionId: mongoose.Types.ObjectId;
  modelType: 'organism' | 'ecosystem' | 'network';
  parameters: {
    complexity: number;
    coherence: number;
    evolution: number;
    patterns: string[];
  };
  visualData: any;
  createdAt: Date;
  updatedAt: Date;
}

const dynamicModelSchema = new Schema<IDynamicModel>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  modelType: {
    type: String,
    enum: ['organism', 'ecosystem', 'network'],
    default: 'organism'
  },
  parameters: {
    complexity: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    coherence: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    evolution: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    patterns: [String]
  },
  visualData: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

export default mongoose.model<IDynamicModel>('DynamicModel', dynamicModelSchema);