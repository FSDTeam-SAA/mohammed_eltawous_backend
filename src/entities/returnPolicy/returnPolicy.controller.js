import { catchAsync } from "../../utility/catchAsync.js";
import { returnPolicyService } from "./returnPolicy.service.js";
import { sendResponse } from "../../utility/sendResponse.js";

const createReturnPolicy = catchAsync(async (req, res) => {
    const created = await returnPolicyService.createReturnPolicyIntoDb(req.body);

    return sendResponse(res, {
        statusCode: 201,
        message: "Return policy created successfully",
        data: created,
    });
});

const getReturnPolicy = catchAsync(async (req, res) => {
    const policy = await returnPolicyService.getReturnPolicyFromDb();

    return sendResponse(res, {
        statusCode: 200,
        message: "Return policy fetched successfully",
        data: policy,
    });
});



const deleteReturnPolicy = catchAsync(async (req, res) => {
    const deleted = await returnPolicyService.deleteReturnPolicyFromDb(req.params.id);

    return sendResponse(res, {
        statusCode: 200,
        message: "Return policy deleted successfully",
        data: deleted,
    });
});



const updateReturnPolicy = catchAsync(async (req, res) => {
    const updated = await returnPolicyService.updateReturnPolicyFromDb(
        req.params.id,
        req.body
    );

    return sendResponse(res, {
        statusCode: 200,
        message: "Return policy updated successfully",
        data: updated,
    });
});





export const returnPolicyController = {
    createReturnPolicy,
    getReturnPolicy,
    updateReturnPolicy,
    deleteReturnPolicy
};
