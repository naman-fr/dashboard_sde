'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHeatmapData } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function HeatmapPage() {
  const [url, setUrl] = useState('');
  const [searchUrl, setSearchUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['heatmap', searchUrl],
    queryFn: () => getHeatmapData(searchUrl),
    enabled: !!searchUrl,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchUrl(url);
  };

  useEffect(() => {
    if (data?.data && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw clicks
      data.data.forEach((click: { x: number; y: number }) => {
        ctx.beginPath();
        ctx.arc(click.x, click.y, 8, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // Blue with opacity
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.stroke();
      });
    }
  }, [data]);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Click Heatmap</h2>
        <p className="text-sm text-slate-500">Visualize where users are clicking on specific pages.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
        <Input 
          placeholder="Enter exact page URL (e.g., http://localhost:3000/)" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-white"
        />
        <Button type="submit" disabled={!url || isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Search className="w-4 h-4 mr-2" />
          Generate Heatmap
        </Button>
      </form>

      <Card className="flex-1 border-0 shadow-sm ring-1 ring-slate-100 overflow-hidden flex flex-col relative">
        <CardHeader className="border-b bg-slate-50/50 py-4 absolute top-0 w-full z-10">
          <CardTitle className="text-sm font-medium">Heatmap Visualization</CardTitle>
          <CardDescription className="text-xs">
            {data?.data ? `Showing ${data.data.length} clicks` : 'Enter a URL to view clicks'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 m-0 flex-1 relative overflow-auto bg-slate-100/50 pt-20">
          <div className="min-w-[1200px] min-h-[800px] w-full h-full relative">
            {/* We use a static size for demo. In a real app we might overlay this on an iframe or scaled snapshot. */}
            <canvas 
              ref={canvasRef}
              width={1920}
              height={1080}
              className="absolute top-0 left-0 border border-slate-200 bg-white shadow-sm"
              style={{ transformOrigin: 'top left', transform: 'scale(0.8)' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
