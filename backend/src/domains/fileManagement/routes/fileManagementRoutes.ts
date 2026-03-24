import { Router } from 'express';
import { upload, uploadFile, exportData } from '../controller/fileManagementController.js';

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/export', exportData);

export default router;
