import { useState, useEffect } from 'react';
import { ParsedData } from '@/utils/dataParser';
import { ChartSuggestion, suggestCharts } from '@/utils/chartGenerator';
import { ChartPanel } from './ChartPanel';
import { DataTable } from './DataTable';
import { StatisticsCards } from './StatisticsCards';
import { BarChart3, Table2, Save, FolderOpen, Download, Filter, Settings2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  data: ParsedData;
  onReset?: () => void;
}

export const Dashboard = ({ data, onReset }: DashboardProps) => {
  const [activeCharts, setActiveCharts] = useState<ChartSuggestion[]>([]);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'charts' | 'data' | 'overview'>('overview');
  const [filterText, setFilterText] = useState('');

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
    toast.success('Dashboard saved successfully');
  };

  const loadDashboard = () => {
    const saved = localStorage.getItem('dashboard-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setActiveCharts(state.activeCharts);
        toast.success('Dashboard loaded successfully');
      } catch {
        toast.error('Failed to load dashboard');
      }
    } else {
      toast.error('No saved dashboard found');
    }
  };

  const exportData = () => {
    const csv = [
      data.headers.join(','),
      ...data.rows.map(row => data.headers.map(h => row[h]).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.fileName}_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported as CSV');
  };

  const refreshCharts = () => {
    const chartSuggestions = suggestCharts(data);
    setSuggestions(chartSuggestions);
    setActiveCharts(chartSuggestions.slice(0, 2));
    toast.success('Charts refreshed');
  };

  const clearAllCharts = () => {
    setActiveCharts([]);
    toast.success('All charts cleared');
  };

  const filteredData = filterText
    ? {
        ...data,
        rows: data.rows.filter(row =>
          Object.values(row).some(val =>
            String(val).toLowerCase().includes(filterText.toLowerCase())
          )
        )
      }
    : data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              Analytics Dashboard
            </h2>
            <p className="text-muted-foreground mt-1">
              {data.fileName} • {data.rows.length} rows • {data.headers.length} columns
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {onReset && (
              <button onClick={onReset} className="btn-accent flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                New Dataset
              </button>
            )}
            <button onClick={refreshCharts} className="btn-accent flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Charts
            </button>
            <button onClick={clearAllCharts} className="btn-accent flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Clear All
            </button>
            <button onClick={exportData} className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
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
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'charts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Visualizations
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
            Data Table
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards data={data} />

      {/* Chart Suggestions */}
      {activeTab === 'charts' && suggestions.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Available Chart Types</h3>
            <span className="text-sm text-muted-foreground">{suggestions.length} suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addChart(suggestion)}
                className="px-4 py-2 glass-panel rounded-lg hover:bg-secondary hover:scale-105 transition-all text-sm font-medium"
              >
                + {suggestion.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Dashboard Summary */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Dashboard Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Active Visualizations</p>
                <p className="text-3xl font-bold text-primary">{activeCharts.length}</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Available Chart Types</p>
                <p className="text-3xl font-bold text-accent">{suggestions.length}</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Data Sources</p>
                <p className="text-3xl font-bold">1</p>
              </div>
            </div>
          </div>

          {/* Dataset Info */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Dataset Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                <span className="text-muted-foreground">File Name</span>
                <span className="font-semibold">{data.fileName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                <span className="text-muted-foreground">Total Rows</span>
                <span className="font-semibold">{data.rows.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                <span className="text-muted-foreground">Total Columns</span>
                <span className="font-semibold">{data.headers.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                <span className="text-muted-foreground">Column Names</span>
                <span className="font-semibold text-sm">{data.headers.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Active Charts List */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Active Visualizations</h3>
            {activeCharts.length > 0 ? (
              <div className="space-y-2">
                {activeCharts.map((chart, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{chart.title}</p>
                      <p className="text-sm text-muted-foreground">{chart.type.toUpperCase()} Chart</p>
                    </div>
                    <button
                      onClick={() => removeChart(index)}
                      className="text-destructive hover:text-destructive/80 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active charts. Go to Visualizations tab to add charts.</p>
            )}
          </div>

          {/* Quick Insights */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Quick Insights</h3>
            <div className="space-y-2">
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm">💡 Your dataset contains <strong>{data.rows.length}</strong> records across <strong>{data.headers.length}</strong> dimensions</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm">📊 <strong>{suggestions.length}</strong> chart types are recommended based on your data structure</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm">🎯 Currently visualizing <strong>{activeCharts.length}</strong> charts on your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'charts' ? (
        <>
          {/* Global Filter */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter all data..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCharts.map((chart, index) => (
              <ChartPanel
                key={index}
                data={filteredData}
                suggestion={chart}
                onRemove={() => removeChart(index)}
              />
            ))}
            {activeCharts.length === 0 && (
              <div className="col-span-full glass-card p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Charts Yet</h3>
                <p className="text-muted-foreground">
                  Click on any suggested chart above to visualize your data
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <DataTable data={filteredData} />
      )}
    </div>
  );
};
