import { Request, Response, NextFunction } from 'express';
import { EventModel } from '../models/Event';
import { logger } from '@analytics/shared-utils';
import { cacheGet, cacheSet } from '../config/redis';

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const cacheKey = `sessions:page:${page}:limit:${limit}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Aggregation pipeline to group by sessionId and get counts/timestamps
    const pipeline = [
      {
        $group: {
          _id: "$sessionId",
          eventCount: { $sum: 1 },
          firstSeen: { $min: "$timestamp" },
          lastSeen: { $max: "$timestamp" }
        }
      },
      { $sort: { lastSeen: -1 as const } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          sessionId: "$_id",
          eventCount: 1,
          firstSeen: 1,
          lastSeen: 1,
          _id: 0
        }
      }
    ];

    const sessions = await EventModel.aggregate(pipeline);
    
    // Get total count for pagination (in a real app with millions, this could be slow, might need optimization)
    const countPipeline = [
      { $group: { _id: "$sessionId" } },
      { $count: "total" }
    ];
    const totalResult = await EventModel.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    const responseData = {
      success: true,
      data: sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    await cacheSet(cacheKey, responseData, 60); // cache for 60 seconds
    res.json(responseData);
  } catch (error) {
    logger.error('Error fetching sessions:', error);
    next(error);
  }
};

export const getSessionTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const events = await EventModel.find({ sessionId })
      .sort({ timestamp: 1 })
      .select('-_id eventType pageUrl timestamp metadata')
      .lean();

    res.json({ success: true, data: events });
  } catch (error) {
    logger.error('Error fetching session timeline:', error);
    next(error);
  }
};

export const getHeatmap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageUrl = req.query.pageUrl as string;
    
    if (!pageUrl) {
      return res.status(400).json({ success: false, error: 'pageUrl query parameter is required' });
    }

    const cacheKey = `heatmap:${pageUrl}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const clicks = await EventModel.find({
      eventType: 'click',
      pageUrl: pageUrl
    })
    .select('metadata.x metadata.y -_id')
    .lean();

    // Transform back to simple {x, y} array
    const data = clicks.map((c: any) => ({
      x: c.metadata?.x,
      y: c.metadata?.y
    })).filter((c: any) => c.x !== undefined && c.y !== undefined);

    const responseData = { success: true, data };
    await cacheSet(cacheKey, responseData, 120); // Cache heatmap for 2 mins
    res.json(responseData);
  } catch (error) {
    logger.error('Error fetching heatmap data:', error);
    next(error);
  }
};
