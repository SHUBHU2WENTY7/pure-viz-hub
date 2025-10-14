import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';
import { ParsedData } from '@/utils/dataParser';
import { ChartSuggestion, createChart } from '@/utils/chartGenerator';
import { Download, X, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChartPanelProps {
  data: ParsedData;
  suggestion: ChartSuggestion;
  onRemove: () => void;
}

export const ChartPanel = ({ data, suggestion, onRemove }: ChartPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      chartRef.current = createChart(canvasRef.current, data, suggestion);
    }

    return () => {
      chartRef.current?.destroy();
    };
  }, [data, suggestion]);

  const downloadChart = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${suggestion.title}.png`;
      link.href = url;
      link.click();
      toast.success('Chart downloaded');
    }
  };

  return (
    <div
      className={`glass-card p-6 space-y-4 animate-fade-in group ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-lg">{suggestion.title}</h4>
          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={downloadChart}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Download as PNG"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onRemove}
            className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
            title="Remove chart"
          >
            <X className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>

      <div className={`relative ${isFullscreen ? 'h-[calc(100%-4rem)]' : 'h-80'}`}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};
