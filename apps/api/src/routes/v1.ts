import { Router } from 'express';
import { ingestEvents } from '../controllers/event.controller';
import { getSessions, getSessionTimeline, getHeatmap } from '../controllers/session.controller';

const router = Router();

router.post('/events', ingestEvents);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId', getSessionTimeline);
router.get('/heatmap', getHeatmap);

export default router;
