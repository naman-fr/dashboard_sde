import mongoose, { Schema, Document } from 'mongoose';
import { AnalyticsEvent } from '@analytics/shared-types';

export interface IEventDocument extends Document, Omit<AnalyticsEvent, 'timestamp'> {
  timestamp: Date;
  createdAt: Date;
}

const eventSchema = new Schema<IEventDocument>({
  sessionId: { type: String, required: true, index: true },
  eventType: { type: String, required: true, index: true },
  pageUrl: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for querying user journeys
eventSchema.index({ sessionId: 1, timestamp: 1 });

export const EventModel = mongoose.model<IEventDocument>('Event', eventSchema);
