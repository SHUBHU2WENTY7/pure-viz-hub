import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ParsedData } from './dataParser';

Chart.register(...registerables);

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'doughnut' | 'area' | 'polarArea' | 'radar' | 'bubble';

export interface ChartSuggestion {
  type: ChartType;
  title: string;
  reason: string;
  xAxis?: string;
  yAxis?: string;
  data?: string;
}

export const suggestCharts = (parsedData: ParsedData): ChartSuggestion[] => {
  const { headers, types, rows } = parsedData;
  const suggestions: ChartSuggestion[] = [];
  
  const numericColumns = headers.filter(h => types[h] === 'number');
  const categoricalColumns = headers.filter(h => types[h] === 'string');
  const dateColumns = headers.filter(h => types[h] === 'date');
  
  // Detect contact-related data
  const contactKeywords = ['name', 'email', 'phone', 'contact', 'message', 'subject'];
  const hasContactData = headers.some(h => 
    contactKeywords.some(k => h.toLowerCase().includes(k))
  );
  
  // For contact data, prioritize table view and simpler visualizations
  if (hasContactData) {
    if (categoricalColumns.length > 0) {
      suggestions.push({
        type: 'doughnut',
        title: `${categoricalColumns[0]} Distribution`,
        reason: 'Contact categories overview',
        data: categoricalColumns[0]
      });
    }
    
    if (dateColumns.length > 0) {
      suggestions.push({
        type: 'area',
        title: `Contact Timeline`,
        reason: 'Contacts over time',
        xAxis: dateColumns[0],
        yAxis: 'count'
      });
    }
    
    return suggestions;
  }
  
  // Time series with area chart
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      type: 'area',
      title: `${numericColumns[0]} Trend over ${dateColumns[0]}`,
      reason: 'Time series trend analysis',
      xAxis: dateColumns[0],
      yAxis: numericColumns[0]
    });
    
    suggestions.push({
      type: 'line',
      title: `${numericColumns[0]} over ${dateColumns[0]}`,
      reason: 'Detailed time series',
      xAxis: dateColumns[0],
      yAxis: numericColumns[0]
    });
  }
  
  // Categorical comparison with multiple options
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      type: 'bar',
      title: `${numericColumns[0]} by ${categoricalColumns[0]}`,
      reason: 'Categorical comparison',
      xAxis: categoricalColumns[0],
      yAxis: numericColumns[0]
    });
    
    // Add polar area for category distributions
    if (rows.length <= 20) {
      suggestions.push({
        type: 'polarArea',
        title: `${numericColumns[0]} Distribution`,
        reason: 'Radial category view',
        data: categoricalColumns[0]
      });
    }
  }
  
  // Distribution charts
  if (categoricalColumns.length > 0) {
    suggestions.push({
      type: 'doughnut',
      title: `${categoricalColumns[0]} Breakdown`,
      reason: 'Category proportions',
      data: categoricalColumns[0]
    });
  }
  
  // Multi-dimensional analysis
  if (numericColumns.length >= 3) {
    suggestions.push({
      type: 'radar',
      title: `Multi-factor Analysis`,
      reason: 'Compare multiple metrics',
      data: categoricalColumns[0] || 'categories'
    });
  }
  
  // Correlation analysis
  if (numericColumns.length >= 2) {
    suggestions.push({
      type: 'scatter',
      title: `${numericColumns[0]} vs ${numericColumns[1]}`,
      reason: 'Correlation analysis',
      xAxis: numericColumns[0],
      yAxis: numericColumns[1]
    });
    
    suggestions.push({
      type: 'bubble',
      title: `${numericColumns[0]} vs ${numericColumns[1]} (Bubble)`,
      reason: 'Multi-dimensional comparison',
      xAxis: numericColumns[0],
      yAxis: numericColumns[1]
    });
  }
  
  return suggestions.slice(0, 8);
};

export const createChart = (
  canvas: HTMLCanvasElement,
  parsedData: ParsedData,
  suggestion: ChartSuggestion
): Chart => {
  const { rows } = parsedData;
  
  let config: ChartConfiguration;
  
  if (suggestion.type === 'pie' || suggestion.type === 'doughnut' || suggestion.type === 'polarArea') {
    const dataColumn = suggestion.data!;
    const counts: Record<string, number> = {};
    
    rows.forEach(row => {
      const value = String(row[dataColumn]);
      counts[value] = (counts[value] || 0) + 1;
    });
    
    const labels = Object.keys(counts).slice(0, 10);
    const data = labels.map(l => counts[l]);
    
    config = {
      type: suggestion.type,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            'rgba(147, 51, 234, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(251, 146, 60, 0.8)',
          ],
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 11 }
            }
          },
          title: {
            display: true,
            text: suggestion.title,
            color: 'rgba(255, 255, 255, 0.9)',
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    };
  } else if (suggestion.type === 'radar') {
    const numericCols = Object.keys(parsedData.types).filter(h => parsedData.types[h] === 'number');
    const labels = numericCols.slice(0, 6);
    const dataPoints = labels.map(col => {
      const values = rows.map(row => Number(row[col]) || 0);
      return values.reduce((a, b) => a + b, 0) / values.length;
    });
    
    config = {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Average Values',
          data: dataPoints,
          backgroundColor: 'rgba(147, 51, 234, 0.3)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(16, 185, 233, 1)',
          pointBorderColor: 'rgba(255, 255, 255, 0.8)',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          },
          title: {
            display: true,
            text: suggestion.title,
            color: 'rgba(255, 255, 255, 0.9)',
            font: { size: 14, weight: 'bold' }
          }
        },
        scales: {
          r: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          }
        }
      }
    };
  } else {
    const xData = rows.map(row => row[suggestion.xAxis!]);
    const yData = rows.map(row => Number(row[suggestion.yAxis!]) || 0);
    
    const baseConfig = {
      label: suggestion.yAxis,
      data: yData.slice(0, 50),
      backgroundColor: suggestion.type === 'area' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.6)',
      borderColor: 'rgba(147, 51, 234, 1)',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: 'rgba(16, 185, 233, 1)',
      pointBorderColor: 'rgba(255, 255, 255, 0.8)',
      pointRadius: suggestion.type === 'scatter' || suggestion.type === 'bubble' ? 5 : 3,
      pointHoverRadius: 7,
      fill: suggestion.type === 'area'
    };
    
    config = {
      type: suggestion.type === 'area' ? 'line' : suggestion.type,
      data: {
        labels: xData.slice(0, 50),
        datasets: [baseConfig]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: suggestion.type !== 'line',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          },
          title: {
            display: true,
            text: suggestion.title,
            color: 'rgba(255, 255, 255, 0.9)',
            font: { size: 14, weight: 'bold' }
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            }
          }
        }
      }
    };
  }
  
  return new Chart(canvas, config);
};
