'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHeatmapData } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Flame, MousePointerClick, Inbox } from 'lucide-react';

/* ───────── heatmap renderer ───────── */
function drawHeatmap(
  canvas: HTMLCanvasElement,
  clicks: { x: number; y: number; timestamp?: string }[],
  animate: boolean
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a subtle grid
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < canvas.width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw each click as a warm radial gradient
  clicks.forEach((click, i) => {
    const delay = animate ? i * 8 : 0;

    setTimeout(() => {
      const radius = 30;
      const gradient = ctx.createRadialGradient(click.x, click.y, 0, click.x, click.y, radius);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.7)');   // red center
      gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.4)'); // orange-yellow
      gradient.addColorStop(0.6, 'rgba(250, 204, 21, 0.2)'); // yellow
      gradient.addColorStop(1, 'rgba(250, 204, 21, 0)');      // transparent

      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.arc(click.x, click.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Bright center dot
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(click.x, click.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.fill();
    }, delay);
  });
}

/* ───────── main component ───────── */
export default function HeatmapPage() {
  const [url, setUrl] = useState('');
  const [searchUrl, setSearchUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasAnimated = useRef(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['heatmap', searchUrl],
    queryFn: () => getHeatmapData(searchUrl),
    enabled: !!searchUrl,
    retry: 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    hasAnimated.current = false;
    setSearchUrl(url.trim());
  };

  // The API returns `{ data: [ {x, y, timestamp}, ... ] }`
  const clicks: { x: number; y: number; timestamp?: string }[] = data?.data ?? [];

  useEffect(() => {
    if (clicks.length > 0 && canvasRef.current) {
      const animate = !hasAnimated.current;
      drawHeatmap(canvasRef.current, clicks, animate);
      hasAnimated.current = true;
    }
    if (clicks.length === 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [clicks]);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Click Heatmap
        </h2>
        <p className="text-sm text-slate-500">
          Visualize where users are clicking on specific pages.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Enter page URL (e.g., http://localhost:3000/)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9 bg-white/70 backdrop-blur-xl border-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>
        <Button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Loading…' : 'Generate'}
        </Button>
      </form>

      {/* Heatmap canvas card */}
      <Card className="flex-1 border-0 bg-white/70 backdrop-blur-xl shadow-sm ring-1 ring-slate-100 overflow-hidden flex flex-col relative">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 flex flex-row items-center justify-between z-10">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-indigo-500" />
              Heatmap Visualization
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {searchUrl
                ? clicks.length > 0
                  ? `Showing ${clicks.length} click${clicks.length !== 1 ? 's' : ''}`
                  : isLoading
                  ? 'Loading click data…'
                  : 'No clicks found for this URL'
                : 'Enter a URL above to view click data'}
            </CardDescription>
          </div>

          {/* Click count badge */}
          {clicks.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
                <Flame className="h-3 w-3" />
                {clicks.length} clicks
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 m-0 flex-1 relative overflow-auto bg-slate-50/30">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Generating heatmap…</p>
              </div>
            </div>
          ) : !searchUrl ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100">
                  <MousePointerClick className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-500">Ready to visualize</p>
                  <p className="text-xs mt-0.5">Enter a page URL above to see the click heatmap.</p>
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50">
                  <Flame className="h-8 w-8 text-rose-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-rose-500">Unable to load heatmap</p>
                  <p className="text-xs mt-0.5 text-slate-400">
                    Check that the API is running and the URL is correct.
                  </p>
                </div>
              </div>
            </div>
          ) : clicks.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100">
                  <Inbox className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-500">No clicks recorded</p>
                  <p className="text-xs mt-0.5">No click data found for this page URL.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-w-[1200px] min-h-[800px] w-full h-full relative">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="absolute top-0 left-0 bg-white shadow-sm"
                style={{ transformOrigin: 'top left', transform: 'scale(0.625)' }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
