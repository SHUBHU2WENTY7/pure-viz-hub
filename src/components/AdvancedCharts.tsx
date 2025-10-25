import { useEffect, useRef, useState } from 'react';
import { ParsedData } from '@/utils/dataParser';
import { Chart, ChartConfiguration } from 'chart.js';
import { BarChart3, Download, Maximize2, X } from 'lucide-react';

interface AdvancedChartsProps {
  data: ParsedData;
}

export const AdvancedCharts = ({ data }: AdvancedChartsProps) => {
  const [activeChart, setActiveChart] = useState<'grouped' | 'stacked' | 'horizontal' | 'multiline'>('grouped');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const numericColumns = data.headers.filter(h => data.types[h] === 'number');
  const categoricalColumns = data.headers.filter(h => data.types[h] === 'string');

  useEffect(() => {
    if (!canvasRef.current || numericColumns.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const categoryColumn = categoricalColumns[0] || data.headers[0];
    const labels = [...new Set(data.rows.map(r => String(r[categoryColumn])))].slice(0, 10);

    let config: ChartConfiguration;

    if (activeChart === 'grouped') {
      const datasets = numericColumns.slice(0, 3).map((col, idx) => {
        const colors = [
          'rgba(147, 51, 234, 0.8)',
          'rgba(16, 185, 233, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ];
        return {
          label: col,
          data: labels.map(label => {
            const rows = data.rows.filter(r => String(r[categoryColumn]) === label);
            const values = rows.map(r => Number(r[col]) || 0);
            return values.reduce((a, b) => a + b, 0) / values.length;
          }),
          backgroundColor: colors[idx],
          borderColor: colors[idx].replace('0.8', '1'),
          borderWidth: 2
        };
      });

      config = {
        type: 'bar',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Grouped Bar Chart - Multi-Metric Comparison',
              color: 'rgba(255, 255, 255, 0.9)',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              position: 'bottom',
              labels: { color: 'rgba(255, 255, 255, 0.8)' }
            }
          },
          scales: {
            x: {
              ticks: { color: 'rgba(255, 255, 255, 0.6)' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              ticks: { color: 'rgba(255, 255, 255, 0.6)' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      };
    } else if (activeChart === 'stacked') {
      const datasets = numericColumns.slice(0, 3).map((col, idx) => {
        const colors = [
          'rgba(147, 51, 234, 0.8)',
          'rgba(16, 185, 233, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ];
        return {
          label: col,
          data: labels.map(label => {
            const rows = data.rows.filter(r => String(r[categoryColumn]) === label);
            const values = rows.map(r => Number(r[col]) || 0);
            return values.reduce((a, b) => a + b, 0);
          }),
          backgroundColor: colors[idx],
          borderWidth: 0
        };
      });

      config = {
        type: 'bar',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Stacked Bar Chart - Cumulative Analysis',
              color: 'rgba(255, 255, 255, 0.9)',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              position: 'bottom',
              labels: { color: 'rgba(255, 255, 255, 0.8)' }
            }
          },
          scales: {
            x: {
              stacked: true,
              ticks: { color: 'rgba(255, 255, 255, 0.6)' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              stacked: true,
              ticks: { color: 'rgba(255, 255, 255, 0.6)' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      };
    } else if (activeChart === 'horizontal') {
      config = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: numericColumns[0],
            data: labels.map(label => {
              const rows = data.rows.filter(r => String(r[categoryColumn]) === label);
              const values = rows.map(r => Number(r[numericColumns[0]]) || 0);
              return values.reduce((a, b) => a + b, 0) / values.length;
            }),
            backgroundColor: 'rgba(147, 51, 234, 0.8)',
            borderColor: 'rgba(147, 51, 234, 1)',
            borderWidth: 2
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Horizontal Bar Chart - Ranked Comparison',
              color: 'rgba(255, 255, 255, 0.9)',
              font: { size: 16, weight: 'bold' }
            },
            legend: { display: false }
          },
          scales: {
            x: {
              ticks: { color: 'rgba(255, 255, 255, 0.6)' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              ticks: { color: 'rgba(255, 255, 255, 0.6)' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      };
    } else {
      const datasets = numericColumns.slice(0, 4).map((col, idx) => {
        const colors = [
          'rgba(147, 51, 234, 1)',
          'rgba(16, 185, 233, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)'
        ];
        return {
          label: col,
          data: data.rows.slice(0, 50).map(r => Number(r[col]) || 0),
          borderColor: colors[idx],
          backgroundColor: colors[idx].replace('1)', '0.1)'),
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6
        };
      });

      config = {
        type: 'line',
        data: {
          labels: data.rows.slice(0, 50).map((_, idx) => `Point ${idx + 1}`),
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Multi-Line Chart - Trend Analysis',
              color: 'rgba(255, 255, 255, 0.9)',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              position: 'bottom',
              labels: { color: 'rgba(255, 255, 255, 0.8)' }
            }
          },
          scales: {
            x: {
              ticks: { 
                color: 'rgba(255, 255, 255, 0.6)',
                maxRotation: 0
              },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              ticks: { color: 'rgba(255, 255, 255, 0.6)' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      };
    }

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, activeChart, numericColumns, categoricalColumns]);

  const downloadChart = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${activeChart}_chart.png`;
    link.href = url;
    link.click();
  };

  const chartTypes = [
    { id: 'grouped' as const, label: 'Grouped Bar', desc: 'Compare multiple metrics' },
    { id: 'stacked' as const, label: 'Stacked Bar', desc: 'Show cumulative totals' },
    { id: 'horizontal' as const, label: 'Horizontal Bar', desc: 'Ranked comparison' },
    { id: 'multiline' as const, label: 'Multi-Line', desc: 'Trend analysis' }
  ];

  if (numericColumns.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Numeric Data</h3>
        <p className="text-muted-foreground">Advanced charts require numeric columns in your dataset</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent mb-2">Advanced Visualizations</h3>
          <p className="text-muted-foreground text-sm">Professional chart types for corporate analysis</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadChart} className="btn-accent flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn-primary flex items-center gap-2"
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {chartTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveChart(type.id)}
            className={`p-4 rounded-xl transition-all ${
              activeChart === type.id
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'glass-panel hover:bg-secondary'
            }`}
          >
            <div className="font-semibold mb-1">{type.label}</div>
            <div className="text-xs opacity-80">{type.desc}</div>
          </button>
        ))}
      </div>

      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-8' : ''}`}>
        <canvas
          ref={canvasRef}
          style={{ height: isFullscreen ? '80vh' : '500px', width: '100%' }}
        />
      </div>
    </div>
  );
};