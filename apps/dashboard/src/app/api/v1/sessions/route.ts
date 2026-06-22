import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { EventModel } from '@/lib/models/Event';

export const revalidate = 60; // Native Next.js cache

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (!process.env.MONGO_URI) {
      return NextResponse.json({ 
        success: true, 
        data: [
          {
            sessionId: 'demo-session-123',
            eventCount: 12,
            startTime: new Date(Date.now() - 3600000),
            endTime: new Date(),
            durationMs: 3600000,
            pagesVisited: 3
          }
        ],
        message: 'Viewing mock data. Add MONGO_URI in Vercel to see real data.'
      });
    }

    await connectDB();

    const sessions = await EventModel.aggregate([
      {
        $group: {
          _id: '$sessionId',
          eventCount: { $sum: 1 },
          firstEventTime: { $min: '$timestamp' },
          lastEventTime: { $max: '$timestamp' },
          pagesVisited: { $addToSet: '$pageUrl' }
        }
      },
      {
        $project: {
          sessionId: '$_id',
          _id: 0,
          eventCount: 1,
          startTime: '$firstEventTime',
          endTime: '$lastEventTime',
          durationMs: { $subtract: ['$lastEventTime', '$firstEventTime'] },
          pagesVisited: { $size: '$pagesVisited' }
        }
      },
      { $sort: { startTime: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
