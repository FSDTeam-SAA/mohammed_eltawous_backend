import { ReturnPolicy } from "./returnPolicy.model.js";
import { AppError } from "../../utility/appError.js";



const normalize = (value) => String(value || "").trim();

const createReturnPolicyIntoDb = async (data) => {
    const title = normalize(data?.title);
    const content = normalize(data?.content);

    if (!title || !content) {
        throw new AppError("Title and content are required fields.", 400);
    }

    const existingPolicy = await ReturnPolicy.findOne({ title, content });
    if (existingPolicy) {
        throw new AppError("Return policy already exists.", 409);
    }

    const returnPolicy = await ReturnPolicy.create({ title, content });
    return returnPolicy;
};

const getReturnPolicyFromDb = async () => {
    const policies = await ReturnPolicy.find({}).sort({ createdAt: -1 });
    return policies;
};

const updateReturnPolicyFromDb = async (id, data) => {
    if (!id) throw new AppError("Id is required.", 400);

    if (!data?.title || !data?.content) {
        throw new AppError("Title and content are required fields.", 400);
    }

    const returnPolicy = await ReturnPolicy.findById(id);
    if (!returnPolicy) {
        throw new AppError("Return policy not found.", 404);
    }

    // optional: prevent duplicates excluding the current doc
    const existingPolicy = await ReturnPolicy.findOne({
        _id: { $ne: id },
        title: data.title,
        content: data.content,
    });

    if (existingPolicy) {
        throw new AppError("Return policy already exists.", 409);
    }

    // optional: if no changes
    if (
        returnPolicy.title === data.title &&
        returnPolicy.content === data.content
    ) {
        throw new AppError("No changes detected.", 400);
    }

    const updated = await ReturnPolicy.findByIdAndUpdate(id, data, { new: true });
    return updated;
};

const deleteReturnPolicyFromDb = async (id) => {
    if (!id) {
        throw new AppError("Policy id is required.", 400);
    }

    const deleted = await ReturnPolicy.findByIdAndDelete(id);

    if (!deleted) {
        throw new AppError("Return policy not found.", 404);
    }

    return deleted;
};






export const returnPolicyService = {
    createReturnPolicyIntoDb,
    getReturnPolicyFromDb,
    updateReturnPolicyFromDb,
    deleteReturnPolicyFromDb
}