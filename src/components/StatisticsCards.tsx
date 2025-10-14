import { ParsedData } from '@/utils/dataParser';
import { TrendingUp, Database, Layers, Activity } from 'lucide-react';

interface StatisticsCardsProps {
  data: ParsedData;
}

export const StatisticsCards = ({ data }: StatisticsCardsProps) => {
  const numericColumns = data.headers.filter(h => data.types[h] === 'number');
  const categoricalColumns = data.headers.filter(h => data.types[h] === 'string');
  
  const totalRecords = data.rows.length;
  const totalColumns = data.headers.length;
  
  // Calculate average of first numeric column
  let averageValue = 0;
  if (numericColumns.length > 0) {
    const values = data.rows.map(row => Number(row[numericColumns[0]]) || 0);
    averageValue = values.reduce((a, b) => a + b, 0) / values.length;
  }
  
  // Count unique values in first categorical column
  let uniqueCategories = 0;
  if (categoricalColumns.length > 0) {
    const unique = new Set(data.rows.map(row => String(row[categoricalColumns[0]])));
    uniqueCategories = unique.size;
  }
  
  const stats = [
    {
      title: 'Total Records',
      value: totalRecords.toLocaleString(),
      icon: Database,
      gradient: 'from-purple-500 to-blue-500',
      bgGradient: 'from-purple-500/10 to-blue-500/10'
    },
    {
      title: 'Data Columns',
      value: totalColumns.toString(),
      icon: Layers,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      title: numericColumns[0] ? `Avg ${numericColumns[0]}` : 'Average Value',
      value: averageValue.toFixed(2),
      icon: TrendingUp,
      gradient: 'from-cyan-500 to-emerald-500',
      bgGradient: 'from-cyan-500/10 to-emerald-500/10'
    },
    {
      title: 'Unique Categories',
      value: uniqueCategories.toString(),
      icon: Activity,
      gradient: 'from-emerald-500 to-purple-500',
      bgGradient: 'from-emerald-500/10 to-purple-500/10'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`glass-card p-6 bg-gradient-to-br ${stat.bgGradient} border-l-4 border-transparent hover:border-primary transition-all duration-300 hover:scale-105 animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
