'use client';

import { useQuery } from '@tanstack/react-query';
import { getSessions, getSessionTimeline } from '@/lib/api';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';

export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sessions', page],
    queryFn: () => getSessions(page, 20),
  });

  const { data: timelineData, isLoading: isTimelineLoading } = useQuery({
    queryKey: ['sessionTimeline', selectedSession],
    queryFn: () => getSessionTimeline(selectedSession!),
    enabled: !!selectedSession,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">User Sessions</h2>
        <p className="text-sm text-slate-500">Explore recorded user sessions and their journeys.</p>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-medium">Session ID</TableHead>
              <TableHead className="font-medium text-right">Events</TableHead>
              <TableHead className="font-medium text-right">First Seen</TableHead>
              <TableHead className="font-medium text-right">Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px] ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-rose-500">
                  Failed to load sessions. Ensure API is running.
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No sessions recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((session: any) => (
                <TableRow 
                  key={session.sessionId}
                  className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                  onClick={() => setSelectedSession(session.sessionId)}
                >
                  <TableCell className="font-mono text-xs text-slate-600">{session.sessionId}</TableCell>
                  <TableCell className="text-right font-medium">{session.eventCount}</TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {format(new Date(session.firstSeen), 'MMM d, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {format(new Date(session.lastSeen), 'MMM d, yyyy HH:mm:ss')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Session Timeline</SheetTitle>
            <SheetDescription className="font-mono text-xs mt-1">
              {selectedSession}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {isTimelineLoading ? (
               <Skeleton className="h-32 w-full" />
            ) : (
              timelineData?.data?.map((event: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {event.eventType === 'page_view' ? '📄' : '🖱️'}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm capitalize">{event.eventType.replace('_', ' ')}</div>
                      <time className="font-mono text-xs text-slate-500">{format(new Date(event.timestamp), 'HH:mm:ss.SSS')}</time>
                    </div>
                    <div className="text-slate-500 text-xs truncate" title={event.pageUrl}>
                      {new URL(event.pageUrl).pathname}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
