import { Download, FileJson, FileSpreadsheet, Printer, Share2 } from 'lucide-react';
import { ParsedData } from '@/utils/dataParser';
import { toast } from 'sonner';

interface ExportOptionsProps {
  data: ParsedData;
}

export const ExportOptions = ({ data }: ExportOptionsProps) => {
  const exportToCSV = () => {
    const csv = [
      data.headers.join(','),
      ...data.rows.map(row => data.headers.map(h => {
        const val = row[h];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ].join('\n');
    
    downloadFile(csv, `${data.fileName}_export.csv`, 'text/csv');
    toast.success('Data exported as CSV');
  };

  const exportToJSON = () => {
    const json = JSON.stringify({
      metadata: {
        fileName: data.fileName,
        rows: data.rows.length,
        columns: data.headers.length,
        exportedAt: new Date().toISOString()
      },
      headers: data.headers,
      types: data.types,
      data: data.rows
    }, null, 2);
    
    downloadFile(json, `${data.fileName}_export.json`, 'application/json');
    toast.success('Data exported as JSON');
  };

  const exportToExcel = () => {
    // Create HTML table for Excel
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4f46e5; color: white; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.rows.map(row => `<tr>${data.headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    downloadFile(html, `${data.fileName}_export.xls`, 'application/vnd.ms-excel');
    toast.success('Data exported as Excel');
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${data.fileName} Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #4f46e5; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #4f46e5; color: white; }
              .meta { margin: 20px 0; padding: 10px; background: #f3f4f6; }
            </style>
          </head>
          <body>
            <h1>Data Report: ${data.fileName}</h1>
            <div class="meta">
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Records:</strong> ${data.rows.length}</p>
              <p><strong>Columns:</strong> ${data.headers.length}</p>
            </div>
            <table>
              <thead>
                <tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${data.rows.map(row => `<tr>${data.headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('Print dialog opened');
  };

  const shareReport = () => {
    const summary = `${data.fileName}\n${data.rows.length} records • ${data.headers.length} columns\n\nAnalyze your data with DataViz Pro`;
    
    if (navigator.share) {
      navigator.share({
        title: `DataViz Report: ${data.fileName}`,
        text: summary,
      }).then(() => {
        toast.success('Shared successfully');
      }).catch(() => {
        copyToClipboard(summary);
      });
    } else {
      copyToClipboard(summary);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Summary copied to clipboard');
  };

  const options = [
    { icon: FileSpreadsheet, label: 'CSV', action: exportToCSV, color: 'from-green-500 to-emerald-500' },
    { icon: FileJson, label: 'JSON', action: exportToJSON, color: 'from-yellow-500 to-amber-500' },
    { icon: Download, label: 'Excel', action: exportToExcel, color: 'from-blue-500 to-cyan-500' },
    { icon: Printer, label: 'Print', action: printReport, color: 'from-purple-500 to-violet-500' },
    { icon: Share2, label: 'Share', action: shareReport, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Export & Share</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <button
              key={index}
              onClick={option.action}
              className="p-4 glass-panel rounded-lg hover:scale-105 transition-all flex flex-col items-center gap-2 group"
            >
              <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
