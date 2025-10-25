import { useState } from 'react';
import { ParsedData } from '@/utils/dataParser';
import { GitCompare, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from './ui/button';

interface DataComparisonProps {
  data: ParsedData;
}

export const DataComparison = ({ data }: DataComparisonProps) => {
  const [column1, setColumn1] = useState<string>('');
  const [column2, setColumn2] = useState<string>('');

  const numericColumns = data.headers.filter(h => data.types[h] === 'number');

  const compareColumns = () => {
    if (!column1 || !column2) return null;

    const values1 = data.rows.map(r => Number(r[column1]) || 0);
    const values2 = data.rows.map(r => Number(r[column2]) || 0);

    const sum1 = values1.reduce((a, b) => a + b, 0);
    const sum2 = values2.reduce((a, b) => a + b, 0);
    const avg1 = sum1 / values1.length;
    const avg2 = sum2 / values2.length;
    const max1 = Math.max(...values1);
    const max2 = Math.max(...values2);
    const min1 = Math.min(...values1);
    const min2 = Math.min(...values2);

    const correlation = calculateCorrelation(values1, values2);

    return {
      sum: { col1: sum1, col2: sum2, diff: sum2 - sum1, diffPercent: ((sum2 - sum1) / sum1) * 100 },
      avg: { col1: avg1, col2: avg2, diff: avg2 - avg1, diffPercent: ((avg2 - avg1) / avg1) * 100 },
      max: { col1: max1, col2: max2, diff: max2 - max1, diffPercent: ((max2 - max1) / max1) * 100 },
      min: { col1: min1, col2: min2, diff: min2 - min1, diffPercent: ((min2 - min1) / min1) * 100 },
      correlation
    };
  };

  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const comparison = compareColumns();

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const formatNumber = (num: number) => {
    return Math.abs(num) > 1000 ? num.toFixed(0) : num.toFixed(2);
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <GitCompare className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Column Comparison</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <select
          value={column1}
          onChange={(e) => setColumn1(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-md"
        >
          <option value="">Select Column 1</option>
          {numericColumns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>

        <select
          value={column2}
          onChange={(e) => setColumn2(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-md"
        >
          <option value="">Select Column 2</option>
          {numericColumns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      {comparison && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['sum', 'avg', 'max', 'min'] as const).map(metric => (
              <div key={metric} className="p-4 bg-background/50 rounded-lg space-y-2">
                <h4 className="font-semibold uppercase text-xs text-muted-foreground">{metric}</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{column1}</span>
                    <span className="font-bold">{formatNumber(comparison[metric].col1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{column2}</span>
                    <span className="font-bold">{formatNumber(comparison[metric].col2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Difference</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(comparison[metric].diff)}
                      <span className="font-bold">
                        {formatNumber(Math.abs(comparison[metric].diffPercent))}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-background/50 rounded-lg">
            <h4 className="font-semibold mb-3">Correlation Analysis</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      Math.abs(comparison.correlation) > 0.7 ? 'bg-emerald-500' :
                      Math.abs(comparison.correlation) > 0.4 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.abs(comparison.correlation) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{comparison.correlation.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.abs(comparison.correlation) > 0.7 ? 'Strong' :
                   Math.abs(comparison.correlation) > 0.4 ? 'Moderate' :
                   'Weak'} Correlation
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!comparison && (
        <div className="text-center py-8 text-muted-foreground">
          Select two columns to compare
        </div>
      )}
    </div>
  );
};
