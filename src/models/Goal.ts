import mongoose, { Document, Model } from 'mongoose';

export interface IGoal extends Document {
  title: string;
  target: number;
  current: number;
  deadline: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GoalSchema = new mongoose.Schema<IGoal>({
  title: {
    type: String,
    required: [true, 'Please add a goal title'],
    trim: true,
  },
  target: {
    type: Number,
    required: [true, 'Please add a target amount'],
  },
  current: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: String,
    required: [true, 'Please add a deadline'],
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

const Goal: Model<IGoal> = mongoose.model<IGoal>('Goal', GoalSchema);

export default Goal;

