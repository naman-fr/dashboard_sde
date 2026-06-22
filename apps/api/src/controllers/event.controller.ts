import { Request, Response, NextFunction } from 'express';
import { BatchEventsSchema } from '@analytics/shared-types';
import { EventModel } from '../models/Event';
import { logger } from '@analytics/shared-utils';

export const ingestEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const result = BatchEventsSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.errors });
    }

    const { events } = result.data;
    
    // Transform timestamp to Date object
    const docs = events.map(event => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }));

    await EventModel.insertMany(docs, { ordered: false });

    res.status(201).json({ success: true, data: { count: docs.length } });
  } catch (error) {
    logger.error('Error ingesting events:', error);
    next(error);
  }
};
