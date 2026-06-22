import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { EventModel } from '@/lib/models/Event';

export const revalidate = 60; // Native Next.js cache

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pageUrl = searchParams.get('pageUrl');

    if (!pageUrl) {
      return NextResponse.json({ success: false, error: 'pageUrl query parameter is required' }, { status: 400 });
    }

    if (!process.env.MONGO_URI) {
      return NextResponse.json({ 
        success: true, 
        data: [
          { metadata: { x: 100, y: 200 }, timestamp: new Date() },
          { metadata: { x: 150, y: 250 }, timestamp: new Date() },
          { metadata: { x: 300, y: 400 }, timestamp: new Date() }
        ],
        message: 'Viewing mock data. Add MONGO_URI to see real data.'
      });
    }

    await connectDB();

    // In a real scenario, we would aggregate click coordinates specifically
    // Here we find all events for this URL to return to the frontend
    const events = await EventModel.find({ 
      pageUrl, 
      eventType: 'click' 
    }).select('metadata timestamp').lean();

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
