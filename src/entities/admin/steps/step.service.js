import { AppError } from "../../../utility/AppError.js";
import { Step } from "./step.model.js";

const createStepIntoDb = async (stepData) => {
    const stepNumber = stepData?.stepNumber;

    if (!stepNumber) {
        throw new AppError("stepNumber is required", 400, [
            { field: "stepNumber", message: "stepNumber is required" },
        ]);
    }

    const existingStep = await Step.findOne({ stepNumber });
    if (existingStep) {
        throw new AppError("Step already exists", 409, [
            { field: "stepNumber", message: `Step '${stepNumber}' already exists` },
        ]);
    }

    try {
        const createdStep = await Step.create(stepData);
        return createdStep;
    } catch (err) {
        // Safety net: if race condition happens, still return 409
        if (err?.code === 11000) {
            throw new AppError("Step already exists", 409, [
                { field: "stepNumber", message: `Step '${stepNumber}' already exists` },
            ]);
        }
        throw err;
    }
};

const getAllStepsFromDb = async () => {
    const steps = await Step.find({}).lean();
    return steps;
};

const updateStepIntoDb = async (id, stepData) => {
    const step = await Step.findById(id);
    if (!step) {
        throw new AppError("Step not found", 404);
    }

    const alreaduUpdate = step.stepNumber === stepData.stepNumber;
    if (alreaduUpdate) {
        throw new AppError("Step already updates", 409);
    }

    await step.updateOne(stepData);
    return step;
};


const deleteStepFromDb = async (stepId) => {
    const deletedStep = await Step.findByIdAndDelete(stepId).lean();

    if (!deletedStep) {
        throw new AppError('Step not found', 404);
    }

    return deletedStep;
};

export const stepService = {
    createStepIntoDb,
    getAllStepsFromDb,
    updateStepIntoDb,
    deleteStepFromDb
};