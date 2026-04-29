import { Router } from 'express';
import { getLatestVideos } from '../controller/youtubeController.js';

const router = Router();

router.get('/videos', getLatestVideos);

export default router;
