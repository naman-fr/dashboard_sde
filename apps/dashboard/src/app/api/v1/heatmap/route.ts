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
