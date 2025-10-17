import { ParsedData } from '@/utils/dataParser';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface DataInsightsProps {
  data: ParsedData;
}

export const DataInsights = ({ data }: DataInsightsProps) => {
  const generateInsights = () => {
    const insights = [];
    const numericCols = data.headers.filter(h => data.types[h] === 'number');
    const categoricalCols = data.headers.filter(h => data.types[h] === 'string');

    // Data Quality Insights
    const nullCount = data.rows.reduce((acc, row) => {
      return acc + Object.values(row).filter(v => v === null || v === '').length;
    }, 0);
    
    if (nullCount === 0) {
      insights.push({
        type: 'success',
        title: 'Complete Dataset',
        description: 'No missing values detected across all fields',
        icon: CheckCircle
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Data Quality',
        description: `${nullCount} missing values found. Consider data cleaning.`,
        icon: AlertCircle
      });
    }

    // Numeric Analysis
    if (numericCols.length > 0) {
      numericCols.forEach(col => {
        const values = data.rows.map(r => Number(r[col])).filter(v => !isNaN(v));
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min;
        
        const recentValues = values.slice(-Math.min(10, values.length));
        const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
        
        if (recentAvg > avg && avg > 0) {
          insights.push({
            type: 'positive',
            title: `${col} Trending Up`,
            description: `Recent average (${recentAvg.toFixed(2)}) is ${(((recentAvg - avg) / avg) * 100).toFixed(1)}% above overall average`,
            icon: TrendingUp
          });
        } else if (recentAvg < avg * 0.9 && avg > 0) {
          insights.push({
            type: 'negative',
            title: `${col} Declining`,
            description: `Recent values are ${(((avg - recentAvg) / avg) * 100).toFixed(1)}% below average`,
            icon: TrendingDown
          });
        }
      });
    }

    // Category Distribution
    if (categoricalCols.length > 0) {
      const firstCat = categoricalCols[0];
      const distribution = data.rows.reduce((acc, row) => {
        const val = String(row[firstCat]);
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const entries = Object.entries(distribution).sort((a, b) => Number(b[1]) - Number(a[1]));
      if (entries.length > 0) {
        const dominant = entries[0];
        const dominantPct = ((Number(dominant[1]) / data.rows.length) * 100).toFixed(1);
        
        insights.push({
          type: 'info',
          title: 'Dominant Category',
          description: `"${dominant[0]}" represents ${dominantPct}% of ${firstCat} entries`,
          icon: Sparkles
        });
      }
    }

    return insights.slice(0, 5);
  };

  const insights = generateInsights();

  const typeColors = {
    success: 'from-emerald-500/10 to-green-500/10 border-emerald-500',
    warning: 'from-amber-500/10 to-yellow-500/10 border-amber-500',
    positive: 'from-blue-500/10 to-cyan-500/10 border-blue-500',
    negative: 'from-rose-500/10 to-red-500/10 border-rose-500',
    info: 'from-purple-500/10 to-violet-500/10 border-purple-500'
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">AI-Powered Insights</h3>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg bg-gradient-to-r ${typeColors[insight.type as keyof typeof typeColors]} border-l-4 animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
