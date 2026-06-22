import mongoose, { Schema, Document } from 'mongoose';
import { AnalyticsEvent } from '@analytics/shared-types';

export interface IEvent extends Document, Omit<AnalyticsEvent, 'timestamp'> {
  timestamp: Date;
  createdAt: Date;
}

const EventSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    pageUrl: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index for optimal timeline queries
EventSchema.index({ sessionId: 1, timestamp: 1 });

export const EventModel = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
