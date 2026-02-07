import express from "express";
import { returnPolicyController } from "./returnPolicy.controller.js";
import { adminMiddleware, verifyToken } from "../../core/middlewares/authMiddleware.js";

const router = express.Router();

router.post(
    "/create-return-policy",
    verifyToken, adminMiddleware,
    returnPolicyController.createReturnPolicy);


router.get(
    "/get-return-policy",
    returnPolicyController.getReturnPolicy);

router.patch(
    "/update-return-policy/:id",
    verifyToken, adminMiddleware,
    returnPolicyController.updateReturnPolicy);

router.delete(
    "/delete-return-policy/:id",
    verifyToken,
    adminMiddleware,
    returnPolicyController.deleteReturnPolicy
);



export const returnPolicyRoutes = router;