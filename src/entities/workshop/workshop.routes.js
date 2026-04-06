import express from 'express';
import * as workshopController from './workshop.controller.js';

const router = express.Router();

router.post('/classify', workshopController.classifyForces);
router.post('/axes', workshopController.selectAxes);
router.post('/scenarios', workshopController.buildScenarios);
router.post('/windtunnel', workshopController.runWindTunnel);
router.post('/report', workshopController.generateReport);
router.post('/report/download', workshopController.downloadPDF);

export default router;
