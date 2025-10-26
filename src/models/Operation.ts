import mongoose, { Document, Model } from 'mongoose';

export interface IOperation extends Document {
  title: string;
  titleKey?: string;
  amount: number;
  category: string;
  categoryKey?: string;
  date: Date;
  timestamp?: number;
  type: 'income' | 'expense';
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const OperationSchema = new mongoose.Schema<IOperation>({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  titleKey: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
  },
  categoryKey: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  timestamp: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Operation: Model<IOperation> = mongoose.model<IOperation>('Operation', OperationSchema);

export default Operation;

