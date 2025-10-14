import { useState, useEffect } from 'react';
import { ParsedData } from '@/utils/dataParser';
import { ChartSuggestion, suggestCharts } from '@/utils/chartGenerator';
import { ChartPanel } from './ChartPanel';
import { DataTable } from './DataTable';
import { BarChart3, Table2, Save, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  data: ParsedData;
}

export const Dashboard = ({ data }: DashboardProps) => {
  const [activeCharts, setActiveCharts] = useState<ChartSuggestion[]>([]);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'charts' | 'data'>('charts');

  useEffect(() => {
    const chartSuggestions = suggestCharts(data);
    setSuggestions(chartSuggestions);
    setActiveCharts(chartSuggestions.slice(0, 2));
  }, [data]);

  const addChart = (suggestion: ChartSuggestion) => {
    setActiveCharts(prev => [...prev, suggestion]);
    toast.success('Chart added');
  };

  const removeChart = (index: number) => {
    setActiveCharts(prev => prev.filter((_, i) => i !== index));
    toast.success('Chart removed');
  };

  const saveDashboard = () => {
    const state = {
      data,
      activeCharts,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('dashboard-state', JSON.stringify(state));
    toast.success('Dashboard saved');
  };

  const loadDashboard = () => {
    const saved = localStorage.getItem('dashboard-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setActiveCharts(state.activeCharts);
        toast.success('Dashboard loaded');
      } catch {
        toast.error('Failed to load dashboard');
      }
    } else {
      toast.error('No saved dashboard found');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              Analytics Dashboard
            </h2>
            <p className="text-muted-foreground mt-1">
              {data.fileName} • {data.rows.length} rows • {data.headers.length} columns
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={saveDashboard} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button onClick={loadDashboard} className="btn-accent flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Load
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'charts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Charts
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'data'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Table2 className="w-4 h-4" />
            Data
          </button>
        </div>
      </div>

      {/* Chart Suggestions */}
      {activeTab === 'charts' && suggestions.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Suggested Charts</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addChart(suggestion)}
                className="px-4 py-2 glass-panel rounded-lg hover:bg-secondary transition-all text-sm"
              >
                + {suggestion.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'charts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeCharts.map((chart, index) => (
            <ChartPanel
              key={index}
              data={data}
              suggestion={chart}
              onRemove={() => removeChart(index)}
            />
          ))}
          {activeCharts.length === 0 && (
            <div className="col-span-full glass-card p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No charts added yet. Click on a suggested chart above to get started.
              </p>
            </div>
          )}
        </div>
      ) : (
        <DataTable data={data} />
      )}
    </div>
  );
};
