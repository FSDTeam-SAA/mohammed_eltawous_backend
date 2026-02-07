import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema(
    {
        stepNumber: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
    },
    { timestamps: true }
);

export const Step = mongoose.model("Step", stepSchema);
