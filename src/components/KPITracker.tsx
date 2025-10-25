import { useState, useEffect } from 'react';
import { ParsedData } from '@/utils/dataParser';
import { Target, TrendingUp, TrendingDown, Activity, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface KPI {
  id: string;
  name: string;
  column: string;
  target: number;
  current: number;
  unit: string;
}

interface KPITrackerProps {
  data: ParsedData;
}

export const KPITracker = ({ data }: KPITrackerProps) => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKPI, setNewKPI] = useState({
    name: '',
    column: '',
    target: 0,
    unit: ''
  });

  const numericColumns = data.headers.filter(h => data.types[h] === 'number');

  useEffect(() => {
    // Auto-generate KPIs from data
    if (kpis.length === 0 && numericColumns.length > 0) {
      const autoKPIs: KPI[] = numericColumns.slice(0, 3).map((col, index) => {
        const values = data.rows.map(r => Number(r[col]) || 0);
        const current = values.reduce((a, b) => a + b, 0) / values.length;
        return {
          id: `kpi-${index}`,
          name: col,
          column: col,
          target: current * 1.2,
          current: current,
          unit: ''
        };
      });
      setKpis(autoKPIs);
    }
  }, [data, numericColumns, kpis.length]);

  const calculateKPI = (column: string) => {
    const values = data.rows.map(r => Number(r[column]) || 0);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const addKPI = () => {
    if (!newKPI.name || !newKPI.column) {
      toast.error('Please fill all fields');
      return;
    }

    const current = calculateKPI(newKPI.column);
    const kpi: KPI = {
      id: `kpi-${Date.now()}`,
      name: newKPI.name,
      column: newKPI.column,
      target: newKPI.target,
      current: current,
      unit: newKPI.unit
    };

    setKpis([...kpis, kpi]);
    setNewKPI({ name: '', column: '', target: 0, unit: '' });
    setShowAddForm(false);
    toast.success('KPI added successfully');
  };

  const removeKPI = (id: string) => {
    setKpis(kpis.filter(k => k.id !== id));
    toast.success('KPI removed');
  };

  const getPerformance = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    return {
      percentage: Math.round(percentage),
      status: percentage >= 100 ? 'success' : percentage >= 80 ? 'warning' : 'danger'
    };
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          KPI Performance Tracker
        </h3>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add KPI
        </Button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-background/50 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="KPI Name"
            value={newKPI.name}
            onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
          />
          <select
            value={newKPI.column}
            onChange={(e) => setNewKPI({ ...newKPI, column: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
          >
            <option value="">Select Column</option>
            {numericColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Target Value"
            value={newKPI.target || ''}
            onChange={(e) => setNewKPI({ ...newKPI, target: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
          />
          <input
            type="text"
            placeholder="Unit (e.g., $, %, units)"
            value={newKPI.unit}
            onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
          />
          <Button onClick={addKPI} className="w-full">Add KPI</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(kpi => {
          const performance = getPerformance(kpi.current, kpi.target);
          return (
            <div key={kpi.id} className="p-4 bg-background/50 rounded-lg space-y-3 relative">
              <button
                onClick={() => removeKPI(kpi.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{kpi.name}</h4>
                {performance.percentage >= 100 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current</span>
                  <span className="font-bold">{Math.round(kpi.current)}{kpi.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-bold">{Math.round(kpi.target)}{kpi.unit}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span className={`font-bold ${
                    performance.status === 'success' ? 'text-emerald-500' :
                    performance.status === 'warning' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {performance.percentage}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      performance.status === 'success' ? 'bg-emerald-500' :
                      performance.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(performance.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {kpis.length === 0 && !showAddForm && (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No KPIs configured. Add your first KPI to start tracking.</p>
        </div>
      )}
    </div>
  );
};
