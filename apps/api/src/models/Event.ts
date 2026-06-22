import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  sessionId: string;
  eventType: 'page_view' | 'click';
  pageUrl: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    sessionId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    pageUrl: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

EventSchema.index({ sessionId: 1, timestamp: 1 });

export const EventModel = mongoose.model<IEvent>('Event', EventSchema);
