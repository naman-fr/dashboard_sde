import { Router, Request, Response, NextFunction } from 'express';
import { BatchEventsSchema } from '@analytics/shared-types';
import { EventModel } from '../models/Event';

const router = Router();

// ---------- POST /events ----------
router.post('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = BatchEventsSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten(),
      });
      return;
    }

    const docs = result.data.events.map((event) => ({
      sessionId: event.sessionId,
      eventType: event.eventType,
      pageUrl: event.pageUrl,
      timestamp: new Date(event.timestamp),
      metadata: event.metadata ?? {},
    }));

    const inserted = await EventModel.insertMany(docs);

    res.status(201).json({
      success: true,
      insertedCount: inserted.length,
    });
  } catch (error) {
    next(error);
  }
});

// ---------- GET /sessions ----------
router.get('/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [sessions, totalCountResult] = await Promise.all([
      EventModel.aggregate([
        {
          $group: {
            _id: '$sessionId',
            eventCount: { $sum: 1 },
            startTime: { $min: '$timestamp' },
            endTime: { $max: '$timestamp' },
            pagesVisited: { $addToSet: '$pageUrl' },
          },
        },
        {
          $project: {
            _id: 0,
            sessionId: '$_id',
            eventCount: 1,
            startTime: 1,
            endTime: 1,
            durationMs: { $subtract: ['$endTime', '$startTime'] },
            pagesVisited: { $size: '$pagesVisited' },
          },
        },
        { $sort: { startTime: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      EventModel.distinct('sessionId').then((ids) => ids.length),
    ]);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page,
        limit,
        totalCount: totalCountResult,
        totalPages: Math.ceil(totalCountResult / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ---------- GET /sessions/:sessionId ----------
router.get('/sessions/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const events = await EventModel.find({ sessionId }).sort({ timestamp: 1 }).lean();

    if (events.length === 0) {
      res.status(404).json({
        success: false,
        error: `No events found for session: ${sessionId}`,
      });
      return;
    }

    const startTime = events[0].timestamp;
    const endTime = events[events.length - 1].timestamp;

    res.json({
      success: true,
      data: {
        sessionId,
        eventCount: events.length,
        startTime,
        endTime,
        events,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ---------- GET /heatmap ----------
router.get('/heatmap', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageUrl = req.query.pageUrl as string;

    if (!pageUrl) {
      res.status(400).json({
        success: false,
        error: 'Query parameter "pageUrl" is required',
      });
      return;
    }

    const clicks = await EventModel.find({
      eventType: 'click',
      pageUrl,
    })
      .select('metadata.x metadata.y timestamp')
      .sort({ timestamp: -1 })
      .lean();

    const heatmapData = clicks.map((click) => {
      const meta = click.metadata as Record<string, unknown>;
      return {
        x: meta.x as number,
        y: meta.y as number,
        timestamp: click.timestamp,
      };
    });

    res.json({
      success: true,
      data: heatmapData,
      count: heatmapData.length,
    });
  } catch (error) {
    next(error);
  }
});

// ---------- GET /stats ----------
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [statsResult, totalEvents] = await Promise.all([
      EventModel.aggregate([
        {
          $group: {
            _id: '$sessionId',
            startTime: { $min: '$timestamp' },
            endTime: { $max: '$timestamp' },
            clickCount: {
              $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            avgSessionDuration: {
              $avg: { $subtract: ['$endTime', '$startTime'] },
            },
            avgClicksPerSession: { $avg: '$clickCount' },
          },
        },
        {
          $project: {
            _id: 0,
            totalSessions: 1,
            avgSessionDuration: { $round: ['$avgSessionDuration', 0] },
            avgClicksPerSession: { $round: ['$avgClicksPerSession', 2] },
          },
        },
      ]),
      EventModel.countDocuments(),
    ]);

    const stats = statsResult[0] || {
      totalSessions: 0,
      avgSessionDuration: 0,
      avgClicksPerSession: 0,
    };

    res.json({
      success: true,
      data: {
        ...stats,
        totalEvents,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
