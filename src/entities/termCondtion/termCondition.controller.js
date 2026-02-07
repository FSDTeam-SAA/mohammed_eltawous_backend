import { catchAsync } from "../../utility/catchAsync.js";
import { sendResponse } from "../../utility/sendResponse.js";
import { termConditionService } from "./termCondition.service.js";

const createTermCondition = catchAsync(async (req, res) => {
    const created = await termConditionService.createTermConditionIntoDb(req.body);

    return sendResponse(res, {
        statusCode: 201,
        message: "Term & Condition created successfully",
        data: created,
    });
});

const getTermCondition = catchAsync(async (req, res) => {
    const terms = await termConditionService.getTermConditionFromDb();

    return sendResponse(res, {
        statusCode: 200,
        message: "Term & Condition fetched successfully",
        data: terms,
    });
});

const updateTermCondition = catchAsync(async (req, res) => {
    const updated = await termConditionService.updateTermConditionFromDb(
        req.params.id,
        req.body
    );

    return sendResponse(res, {
        statusCode: 200,
        message: "Term & Condition updated successfully",
        data: updated,
    });
});

const deleteTermCondition = catchAsync(async (req, res) => {
    const deleted = await termConditionService.deleteTermConditionFromDb(req.params.id);

    return sendResponse(res, {
        statusCode: 200,
        message: "Term & Condition deleted successfully",
        data: deleted,
    });
});

export const termConditionController = {
    createTermCondition,
    getTermCondition,
    updateTermCondition,
    deleteTermCondition,
};
