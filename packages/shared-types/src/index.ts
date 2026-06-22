import { z } from 'zod';

export const EventTypeEnum = z.enum(['page_view', 'click']);

export const BaseEventSchema = z.object({
  sessionId: z.string(),
  eventType: EventTypeEnum,
  pageUrl: z.string(),
  timestamp: z.number(),
});

export const PageViewEventSchema = BaseEventSchema.extend({
  eventType: z.literal('page_view'),
  metadata: z.object({
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
});

export const ClickEventSchema = BaseEventSchema.extend({
  eventType: z.literal('click'),
  metadata: z.object({
    x: z.number(),
    y: z.number(),
    viewportWidth: z.number(),
    viewportHeight: z.number(),
  }),
});

export const AnalyticsEventSchema = z.discriminatedUnion('eventType', [
  PageViewEventSchema,
  ClickEventSchema,
]);

export const BatchEventsSchema = z.object({
  events: z.array(AnalyticsEventSchema),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type PageViewEvent = z.infer<typeof PageViewEventSchema>;
export type ClickEvent = z.infer<typeof ClickEventSchema>;
