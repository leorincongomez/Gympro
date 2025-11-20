// lib/models/Progress.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IProgress extends Document {
  clientId: mongoose.Types.ObjectId;
  date: Date;
  routineId?: mongoose.Types.ObjectId | null;
  notes?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>({
  clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  routineId: { type: Schema.Types.ObjectId, ref: "Routine", default: null },
  notes: { type: String, default: "" },
  completed: { type: Boolean, default: true },
}, { timestamps: true });

// índices para consultas rápidas
ProgressSchema.index({ clientId: 1, date: -1 });
ProgressSchema.index({ date: 1 });

const Progress = mongoose.models.Progress || mongoose.model<IProgress>("Progress", ProgressSchema);
export default Progress;

