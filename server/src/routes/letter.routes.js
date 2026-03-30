import { Router } from 'express';
import { uploadLetterVersion, getLetterVersions, deleteLetterVersion } from '../controllers/letter.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Endpoint specifically to upload a file handling the versions.
// Using 'file' field for upload. Requires category in body to resolve the destination dynamically.
router.post('/version', protect, authorize('superadmin', 'hrstaff'), upload.single('file'), uploadLetterVersion);

// Endpoint to fetch versions
router.get('/:document_id', protect, getLetterVersions);

// Endpoint to delete a specific version
router.delete('/version/:id', protect, authorize('superadmin', 'hrstaff'), deleteLetterVersion);

export default router;
