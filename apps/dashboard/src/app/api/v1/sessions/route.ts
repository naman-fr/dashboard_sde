import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { EventModel } from '@/lib/models/Event';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const cacheKey = `sessions:${page}:${limit}`;
    const cachedData = await cacheGet(cacheKey);

    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData });
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

    await cacheSet(cacheKey, sessions, 30);

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
