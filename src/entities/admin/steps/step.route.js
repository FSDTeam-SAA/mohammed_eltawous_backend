import express from 'express'
import { stepController } from './step.controller.js';
import { adminMiddleware, verifyToken } from '../../../core/middlewares/authMiddleware.js';


const router = express.Router();

router.post(
    '/create-step',
    verifyToken,
    adminMiddleware,
    stepController.createStep
)


router.get(
    '/get-all-steps',
    stepController.getAllSteps
)


router.patch(
    '/update-step/:id',
    verifyToken,
    adminMiddleware,
    stepController.updateStep
)


router.delete(
    '/delete-step/:id',
    verifyToken,
    adminMiddleware,
    stepController.deleteStep
)


export const stepRoutes = router