import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { EventModel } from '@/lib/models/Event';
import { BatchEventsSchema } from '@analytics/shared-types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = BatchEventsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.errors }, { status: 400 });
    }

    if (!process.env.MONGO_URI) {
      return NextResponse.json({ success: true, count: result.data.events.length, message: 'Mock ingestion successful.' }, { status: 201 });
    }

    await connectDB();
    
    // Map timestamp strings to Dates
    const eventsToInsert = result.data.events.map(event => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }));

    await EventModel.insertMany(eventsToInsert);

    return NextResponse.json({ success: true, count: eventsToInsert.length }, { status: 201 });
  } catch (error) {
    console.error('Error ingesting events:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
