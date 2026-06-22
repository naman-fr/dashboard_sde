import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { EventModel } from '@/lib/models/Event';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { sessionId } = resolvedParams;

    await connectDB();

    const events = await EventModel.find({ sessionId }).sort({ timestamp: 1 }).lean();

    if (!events.length) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const sessionSummary = {
      sessionId,
      eventCount: events.length,
      startTime: events[0].timestamp,
      endTime: events[events.length - 1].timestamp,
      events
    };

    return NextResponse.json({ success: true, data: sessionSummary });
  } catch (error) {
    console.error('Error fetching session details:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
