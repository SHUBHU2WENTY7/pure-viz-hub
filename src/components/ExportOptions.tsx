import { Download, FileJson, FileSpreadsheet, Printer, Share2, FileText } from 'lucide-react';
import { ParsedData } from '@/utils/dataParser';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text(`Data Report: ${data.fileName}`, 14, 15);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Records: ${data.rows.length}`, 14, 27);
    doc.text(`Columns: ${data.headers.length}`, 14, 32);
    
    // Add table
    autoTable(doc, {
      startY: 38,
      head: [data.headers],
      body: data.rows.map(row => data.headers.map(h => String(row[h] || ''))),
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 38, left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      }
    });
    
    doc.save(`${data.fileName}_report.pdf`);
    toast.success('PDF report generated successfully');
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
    { icon: FileText, label: 'PDF', action: exportToPDF, color: 'from-red-500 to-orange-500' },
    { icon: Printer, label: 'Print', action: printReport, color: 'from-purple-500 to-violet-500' },
    { icon: Share2, label: 'Share', action: shareReport, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent mb-2">Export & Share</h3>
        <p className="text-muted-foreground text-sm">Export your data in multiple formats or share your insights</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <button
              key={index}
              onClick={option.action}
              className="p-5 glass-panel rounded-xl hover:scale-105 transition-all flex flex-col items-center gap-3 group hover:shadow-lg"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-br ${option.color} group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
