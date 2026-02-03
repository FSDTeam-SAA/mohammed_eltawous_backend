import express from 'express';
import { validateRequest } from '../../core/middlewares/validateRequest.js';
import { guestController } from './guest.controller.js';
import { guestValidation } from './guest.validation.js';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', validateRequest(guestValidation.guestSubscribeSchema), guestController.guestSubscriber);
router.get('/get-all-emails', verifyToken, adminMiddleware, guestController.getAllGuests);
router.delete('/delete/:id', verifyToken, adminMiddleware, guestController.deleteGuest);


const guestRouter = router;
export default guestRouter;