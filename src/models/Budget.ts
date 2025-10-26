import mongoose, { Document, Model } from 'mongoose';

export interface IBudget extends Document {
  category: string;
  spent: number;
  budget: number;
  color: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BudgetSchema = new mongoose.Schema<IBudget>({
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
  },
  spent: {
    type: Number,
    default: 0,
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget amount'],
  },
  color: {
    type: String,
    default: '#4ECDC4',
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

const Budget: Model<IBudget> = mongoose.model<IBudget>('Budget', BudgetSchema);

export default Budget;

