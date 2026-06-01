import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware.js';
import { authorizeRole } from '../../../middleware/authorizationMiddleware.js';
import { UserRole } from '../../../utils/rbac.js';
import { upload, uploadFile, exportData } from '../controller/fileManagementController.js';

const router = Router();

router.post('/upload', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), upload.single('file'), uploadFile);
router.get('/export', authMiddleware, authorizeRole(UserRole.ADMIN, UserRole.OWNER), exportData);

export default router;
