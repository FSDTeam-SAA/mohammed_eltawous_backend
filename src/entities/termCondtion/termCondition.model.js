import mongoose from "mongoose";

const termConditionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true }, // Simple string storage
    },
    { timestamps: true }
);

export const TermCondition = mongoose.model("TermCondition", termConditionSchema);