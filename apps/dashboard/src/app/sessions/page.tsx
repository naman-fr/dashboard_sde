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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  MousePointerClick,
  Inbox,
  AlertCircle,
} from 'lucide-react';

/* ───────── helpers ───────── */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/* ───────── sessions page ───────── */
export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sessions', page],
    queryFn: () => getSessions(page, 20),
    retry: 1,
    staleTime: 15_000,
  });

  const { data: timelineData, isLoading: isTimelineLoading } = useQuery({
    queryKey: ['sessionTimeline', selectedSession],
    queryFn: () => getSessionTimeline(selectedSession!),
    enabled: !!selectedSession,
  });

  const sessions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">User Sessions</h2>
        <p className="text-sm text-slate-500">
          Explore recorded user sessions and their journeys.
        </p>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/80 backdrop-blur-xl px-5 py-4 text-sm text-rose-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-medium">Failed to load sessions</p>
            <p className="text-rose-600 text-xs mt-0.5">Ensure the analytics API is running.</p>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-b border-slate-100">
              <TableHead className="font-medium text-slate-600">Session ID</TableHead>
              <TableHead className="font-medium text-slate-600 text-right">Events</TableHead>
              <TableHead className="font-medium text-slate-600 text-right">Duration</TableHead>
              <TableHead className="font-medium text-slate-600 text-right hidden sm:table-cell">
                Pages
              </TableHead>
              <TableHead className="font-medium text-slate-600 text-right">Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-b border-slate-50">
                  <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : sessions.length === 0 && !isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-60">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100">
                      <Inbox className="h-7 w-7" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-slate-500">No sessions yet</p>
                      <p className="text-xs mt-0.5">
                        Sessions will appear here once users start interacting.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session: any, i: number) => (
                <TableRow
                  key={session.sessionId}
                  className="cursor-pointer border-b border-slate-50 transition-all duration-200 hover:bg-indigo-50/40 hover:shadow-sm even:bg-slate-50/30 animate-in fade-in slide-in-from-bottom-1"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}
                  onClick={() => setSelectedSession(session.sessionId)}
                >
                  <TableCell className="font-mono text-xs text-slate-600 max-w-[200px] truncate">
                    {session.sessionId}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                      {session.eventCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {session.durationMs ? formatDuration(session.durationMs) : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500 hidden sm:table-cell">
                    {session.pagesVisited ?? '—'}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {session.startTime
                      ? format(new Date(session.startTime), 'MMM d, HH:mm')
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && sessions.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Session Timeline Sheet */}
      <Sheet open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-pulse" />
              Session Timeline
            </SheetTitle>
            <SheetDescription className="font-mono text-xs mt-1 truncate">
              {selectedSession}
            </SheetDescription>
          </SheetHeader>

          {/* Timeline summary */}
          {timelineData?.data && (
            <div className="flex gap-3 mb-6 px-4">
              <div className="flex-1 rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold text-slate-800">{timelineData.data.eventCount}</p>
                <p className="text-xs text-slate-500">Events</p>
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-bold text-slate-800">
                  {timelineData.data.startTime && timelineData.data.endTime
                    ? formatDuration(
                        new Date(timelineData.data.endTime).getTime() -
                          new Date(timelineData.data.startTime).getTime()
                      )
                    : '—'}
                </p>
                <p className="text-xs text-slate-500">Duration</p>
              </div>
            </div>
          )}

          {/* Timeline events */}
          <div className="relative px-4">
            <div className="absolute left-[31px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent" />

            {isTimelineLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-16 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {timelineData?.data?.events?.map((event: any, i: number) => (
                  <div
                    key={i}
                    className="relative flex items-start gap-3 animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
                  >
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 z-10 shadow-sm ${
                        event.eventType === 'page_view'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                          : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      }`}
                    >
                      {event.eventType === 'page_view' ? (
                        <Globe className="h-3.5 w-3.5" />
                      ) : (
                        <MousePointerClick className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-800 capitalize">
                          {event.eventType.replace(/_/g, ' ')}
                        </span>
                        <time className="font-mono text-[11px] text-slate-400">
                          {format(new Date(event.timestamp), 'HH:mm:ss')}
                        </time>
                      </div>
                      {event.pageUrl && (
                        <p className="text-xs text-slate-500 truncate" title={event.pageUrl}>
                          {(() => {
                            try {
                              return new URL(event.pageUrl).pathname;
                            } catch {
                              return event.pageUrl;
                            }
                          })()}
                        </p>
                      )}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {Object.entries(event.metadata).map(([k, v]) => (
                            <span
                              key={k}
                              className="inline-flex text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5"
                            >
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {timelineData?.data?.events?.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No events in this session.
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
