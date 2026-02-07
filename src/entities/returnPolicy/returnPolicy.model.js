import mongoose from "mongoose";

const returnPolicySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true }, // Simple string storage
    },
    { timestamps: true }
);

export const ReturnPolicy = mongoose.model("ReturnPolicy", returnPolicySchema);