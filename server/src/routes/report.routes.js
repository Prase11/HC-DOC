import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getCompletenessReport, getMissingDocuments, getStatistics, getDocumentExport } from '../controllers/report.controller.js';

const router = express.Router();

router.use(protect);

router.get('/completeness', getCompletenessReport);
router.get('/missing', getMissingDocuments);
router.get('/statistics', getStatistics);
router.get('/export', getDocumentExport);

export default router;
