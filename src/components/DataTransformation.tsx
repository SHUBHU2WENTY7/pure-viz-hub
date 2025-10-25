import { useState } from 'react';
import { ParsedData } from '@/utils/dataParser';
import { Calculator, Filter, TrendingUp, Split, Sigma } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface DataTransformationProps {
  data: ParsedData;
  onTransform: (newData: ParsedData) => void;
}

export const DataTransformation = ({ data, onTransform }: DataTransformationProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [operation, setOperation] = useState<string>('');
  const [newColumnName, setNewColumnName] = useState<string>('');

  const numericColumns = data.headers.filter(h => data.types[h] === 'number');

  const applyTransformation = () => {
    if (!selectedColumn || !operation) {
      toast.error('Please select column and operation');
      return;
    }

    const transformedRows = data.rows.map(row => {
      const value = Number(row[selectedColumn]) || 0;
      let result = value;

      switch (operation) {
        case 'percent_change':
          result = value > 0 ? ((value / data.rows[0][selectedColumn]) - 1) * 100 : 0;
          break;
        case 'moving_avg':
          const index = data.rows.indexOf(row);
          const window = Math.min(3, index + 1);
          const sum = data.rows.slice(Math.max(0, index - window + 1), index + 1)
            .reduce((acc, r) => acc + (Number(r[selectedColumn]) || 0), 0);
          result = sum / window;
          break;
        case 'normalize':
          const max = Math.max(...data.rows.map(r => Number(r[selectedColumn]) || 0));
          const min = Math.min(...data.rows.map(r => Number(r[selectedColumn]) || 0));
          result = max > min ? ((value - min) / (max - min)) * 100 : 0;
          break;
        case 'cumulative':
          const idx = data.rows.indexOf(row);
          result = data.rows.slice(0, idx + 1)
            .reduce((acc, r) => acc + (Number(r[selectedColumn]) || 0), 0);
          break;
      }

      return {
        ...row,
        [newColumnName || `${selectedColumn}_${operation}`]: Math.round(result * 100) / 100
      };
    });

    const newHeaders = [...data.headers, newColumnName || `${selectedColumn}_${operation}`];
    const newTypes = { ...data.types, [newColumnName || `${selectedColumn}_${operation}`]: 'number' as const };

    onTransform({
      ...data,
      headers: newHeaders,
      types: newTypes,
      rows: transformedRows
    });

    toast.success('Data transformation applied');
  };

  const aggregateData = (aggType: string) => {
    if (numericColumns.length === 0) {
      toast.error('No numeric columns found');
      return;
    }

    const aggregated: Record<string, number> = {};
    numericColumns.forEach(col => {
      const values = data.rows.map(r => Number(r[col]) || 0);
      switch (aggType) {
        case 'sum':
          aggregated[col] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregated[col] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'max':
          aggregated[col] = Math.max(...values);
          break;
        case 'min':
          aggregated[col] = Math.min(...values);
          break;
      }
    });

    toast.success(`Aggregation complete: ${aggType.toUpperCase()}`);
    console.log('Aggregated data:', aggregated);
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Data Transformation Lab</h3>
        <Calculator className="w-5 h-5 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column Operations */}
        <div className="space-y-4 p-4 bg-background/50 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Column Transformations
          </h4>
          
          <Select value={selectedColumn} onValueChange={setSelectedColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map(col => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent_change">Percent Change</SelectItem>
              <SelectItem value="moving_avg">Moving Average (3)</SelectItem>
              <SelectItem value="normalize">Normalize (0-100)</SelectItem>
              <SelectItem value="cumulative">Cumulative Sum</SelectItem>
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="New column name (optional)"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
          />

          <Button onClick={applyTransformation} className="w-full">
            Apply Transformation
          </Button>
        </div>

        {/* Aggregations */}
        <div className="space-y-4 p-4 bg-background/50 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2">
            <Sigma className="w-4 h-4" />
            Quick Aggregations
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => aggregateData('sum')} variant="outline">
              SUM
            </Button>
            <Button onClick={() => aggregateData('avg')} variant="outline">
              AVERAGE
            </Button>
            <Button onClick={() => aggregateData('max')} variant="outline">
              MAX
            </Button>
            <Button onClick={() => aggregateData('min')} variant="outline">
              MIN
            </Button>
          </div>

          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Aggregations compute statistics across all numeric columns and log results to console
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-background/50 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Advanced Operations
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Remove duplicates based on all columns')}>
            Remove Duplicates
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Sort by first column')}>
            Sort Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Fill missing values with column average')}>
            Fill Missing Values
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Transpose rows and columns')}>
            <Split className="w-4 h-4 mr-1" />
            Transpose
          </Button>
        </div>
      </div>
    </div>
  );
};
