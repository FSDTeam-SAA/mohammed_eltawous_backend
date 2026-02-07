import { catchAsync } from "../../../utility/catchAsync.js";
import { sendResponse } from "../../../utility/sendResponse.js";
import { stepService } from "./step.service.js";


const createStep = catchAsync(async (req, res) => {
    const created = await stepService.createStepIntoDb(req.body);

    return sendResponse(res, {
        statusCode: 201,
        message: "Step created successfully",
        data: created,
    });
});

const getAllSteps = catchAsync(async (req, res) => {
    const steps = await stepService.getAllStepsFromDb();

    return sendResponse(res, {
        statusCode: 200,
        message: "Steps fetched successfully",
        data: steps,
    });
});

const updateStep = catchAsync(async (req, res) => {
    const { id } = req.params;

    const updated = await stepService.updateStepIntoDb(id, req.body);

    return sendResponse(res, {
        statusCode: 200,
        message: "Step updated successfully",
        data: updated,
    });
});

const deleteStep = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deleted = await stepService.deleteStepFromDb(id);

    return sendResponse(res, {
        statusCode: 200,
        message: "Step deleted successfully",
        data: deleted,
    });
});

export const stepController = {
    createStep,
    getAllSteps,
    updateStep,
    deleteStep
};