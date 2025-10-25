import { useState } from 'react';
import { ParsedData } from '@/utils/dataParser';
import { Table, TrendingUp, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface PivotTableProps {
  data: ParsedData;
}

export const PivotTable = ({ data }: PivotTableProps) => {
  const [rowField, setRowField] = useState<string>(data.headers[0] || '');
  const [columnField, setColumnField] = useState<string>(data.headers[1] || '');
  const [valueField, setValueField] = useState<string>(
    data.headers.find(h => data.types[h] === 'number') || data.headers[2] || ''
  );
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count' | 'min' | 'max'>('sum');

  const numericColumns = data.headers.filter(h => data.types[h] === 'number');

  const generatePivotData = () => {
    const pivot: Record<string, Record<string, number[]>> = {};

    data.rows.forEach(row => {
      const rowKey = String(row[rowField] || 'N/A');
      const colKey = String(row[columnField] || 'N/A');
      const value = Number(row[valueField]) || 0;

      if (!pivot[rowKey]) pivot[rowKey] = {};
      if (!pivot[rowKey][colKey]) pivot[rowKey][colKey] = [];
      pivot[rowKey][colKey].push(value);
    });

    return pivot;
  };

  const calculateAggregate = (values: number[]): number => {
    if (values.length === 0) return 0;
    
    switch (aggregation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return 0;
    }
  };

  const pivotData = generatePivotData();
  const columnKeys = [...new Set(data.rows.map(r => String(r[columnField] || 'N/A')))].slice(0, 10);
  const rowKeys = Object.keys(pivotData).slice(0, 20);

  const exportPivot = () => {
    const csv = [
      [rowField, ...columnKeys, 'Total'].join(','),
      ...rowKeys.map(rowKey => {
        const values = columnKeys.map(colKey => {
          const cellValues = pivotData[rowKey][colKey] || [];
          return calculateAggregate(cellValues).toFixed(2);
        });
        const rowTotal = values.reduce((a, b) => a + Number(b), 0).toFixed(2);
        return [rowKey, ...values, rowTotal].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pivot_table_${data.fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Pivot table exported');
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent mb-2">Pivot Table Analysis</h3>
          <p className="text-muted-foreground text-sm">Cross-tabulate and summarize your data</p>
        </div>
        <button onClick={exportPivot} className="btn-accent flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Row Field</label>
          <Select value={rowField} onValueChange={setRowField}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.headers.map(h => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Column Field</label>
          <Select value={columnField} onValueChange={setColumnField}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.headers.map(h => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Value Field</label>
          <Select value={valueField} onValueChange={setValueField}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map(h => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Aggregation</label>
          <Select value={aggregation} onValueChange={(v: any) => setAggregation(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sum">Sum</SelectItem>
              <SelectItem value="avg">Average</SelectItem>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="min">Minimum</SelectItem>
              <SelectItem value="max">Maximum</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary/20">
              <th className="border border-border p-3 text-left font-semibold sticky left-0 bg-primary/20">{rowField}</th>
              {columnKeys.map(col => (
                <th key={col} className="border border-border p-3 text-center font-semibold min-w-[120px]">{col}</th>
              ))}
              <th className="border border-border p-3 text-center font-semibold bg-accent/20">Total</th>
            </tr>
          </thead>
          <tbody>
            {rowKeys.map(rowKey => {
              const rowValues = columnKeys.map(colKey => {
                const cellValues = pivotData[rowKey][colKey] || [];
                return calculateAggregate(cellValues);
              });
              const rowTotal = rowValues.reduce((a, b) => a + b, 0);

              return (
                <tr key={rowKey} className="hover:bg-secondary/50 transition-colors">
                  <td className="border border-border p-3 font-medium sticky left-0 bg-card">{rowKey}</td>
                  {rowValues.map((val, idx) => (
                    <td key={idx} className="border border-border p-3 text-center">
                      {val.toFixed(2)}
                    </td>
                  ))}
                  <td className="border border-border p-3 text-center font-bold bg-accent/10">
                    {rowTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-accent/20 font-bold">
              <td className="border border-border p-3 sticky left-0 bg-accent/20">Total</td>
              {columnKeys.map((colKey, idx) => {
                const colTotal = rowKeys.reduce((sum, rowKey) => {
                  const values = pivotData[rowKey][colKey] || [];
                  return sum + calculateAggregate(values);
                }, 0);
                return (
                  <td key={idx} className="border border-border p-3 text-center">
                    {colTotal.toFixed(2)}
                  </td>
                );
              })}
              <td className="border border-border p-3 text-center bg-accent/30">
                {rowKeys.reduce((sum, rowKey) => {
                  return sum + columnKeys.reduce((s, colKey) => {
                    const values = pivotData[rowKey][colKey] || [];
                    return s + calculateAggregate(values);
                  }, 0);
                }, 0).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {rowKeys.length >= 20 && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Showing first 20 rows. Export to see all data.
        </p>
      )}
    </div>
  );
};