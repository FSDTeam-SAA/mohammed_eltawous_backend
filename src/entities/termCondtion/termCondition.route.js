import express from "express";
import { termConditionController } from "./termCondition.controller.js";
import { verifyToken, adminMiddleware } from "../../core/middlewares/authMiddleware.js";

const router = express.Router();

// Create
router.post(
    "/create-term-condition",
    verifyToken,
    adminMiddleware,
    termConditionController.createTermCondition
);

// Public fetch (no auth) OR keep it public 
router.get("/get-term-condition", termConditionController.getTermCondition);

// Update
router.patch(
    "/update-term-condition/:id",
    verifyToken,
    adminMiddleware,
    termConditionController.updateTermCondition
);

// Delete
router.delete(
    "/delete-term-condition/:id",
    verifyToken,
    adminMiddleware,
    termConditionController.deleteTermCondition
);

export const termConditionRoutes = router;
