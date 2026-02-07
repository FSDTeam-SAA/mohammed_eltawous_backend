import { TermCondition } from "./termCondition.model.js";
import { AppError } from "../../utility/appError.js";

const normalize = (value) => String(value || "").trim();

const createTermConditionIntoDb = async (data) => {
    const title = normalize(data?.title);
    const content = normalize(data?.content);

    if (!title || !content) {
        throw new AppError("Title and content are required fields.", 400);
    }

    const existing = await TermCondition.findOne({ title, content });
    if (existing) {
        throw new AppError("Term & Condition already exists.", 409);
    }

    const created = await TermCondition.create({ title, content });
    return created;
};

const getTermConditionFromDb = async () => {
    // all records (latest first)
    return TermCondition.find({}).sort({ createdAt: -1 });
};

const updateTermConditionFromDb = async (id, data) => {
    if (!id) throw new AppError("TermCondition id is required.", 400);

    const title = normalize(data?.title);
    const content = normalize(data?.content);

    if (!title || !content) {
        throw new AppError("Title and content are required fields.", 400);
    }

    const existingDoc = await TermCondition.findById(id);
    if (!existingDoc) {
        throw new AppError("Term & Condition not found.", 404);
    }

    // Optional: prevent no-change update
    if (existingDoc.title === title && existingDoc.content === content) {
        throw new AppError("No changes detected.", 400);
    }

    // Duplicate check excluding this doc
    const duplicate = await TermCondition.findOne({
        _id: { $ne: id },
        title,
        content,
    });

    if (duplicate) {
        throw new AppError("Term & Condition already exists.", 409);
    }

    existingDoc.title = title;
    existingDoc.content = content;

    await existingDoc.save();
    return existingDoc;
};

const deleteTermConditionFromDb = async (id) => {
    if (!id) throw new AppError("TermCondition id is required.", 400);

    const deleted = await TermCondition.findByIdAndDelete(id);

    if (!deleted) {
        throw new AppError("Term & Condition not found.", 404);
    }

    return deleted;
};

export const termConditionService = {
    createTermConditionIntoDb,
    getTermConditionFromDb,
    updateTermConditionFromDb,
    deleteTermConditionFromDb,
};
