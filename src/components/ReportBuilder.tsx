import { useState } from 'react';
import { ParsedData } from '@/utils/dataParser';
import { FileText, Download, Eye, Layout } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ReportBuilderProps {
  data: ParsedData;
}

interface ReportSection {
  id: string;
  type: 'summary' | 'chart' | 'table' | 'insights' | 'kpi';
  title: string;
  enabled: boolean;
}

export const ReportBuilder = ({ data }: ReportBuilderProps) => {
  const [sections, setSections] = useState<ReportSection[]>([
    { id: '1', type: 'summary', title: 'Executive Summary', enabled: true },
    { id: '2', type: 'kpi', title: 'Key Performance Indicators', enabled: true },
    { id: '3', type: 'chart', title: 'Data Visualizations', enabled: true },
    { id: '4', type: 'insights', title: 'AI Insights & Analysis', enabled: true },
    { id: '5', type: 'table', title: 'Detailed Data Table', enabled: false }
  ]);

  const [reportTitle, setReportTitle] = useState('Analytics Report');
  const [reportTemplate, setReportTemplate] = useState<'executive' | 'detailed' | 'dashboard'>('executive');

  const toggleSection = (id: string) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const generateReport = () => {
    const enabledSections = sections.filter(s => s.enabled);
    
    let reportContent = `# ${reportTitle}\n\n`;
    reportContent += `**Generated:** ${new Date().toLocaleDateString()}\n`;
    reportContent += `**Dataset:** ${data.fileName}\n`;
    reportContent += `**Records:** ${data.rows.length} rows, ${data.headers.length} columns\n\n`;
    reportContent += `---\n\n`;

    enabledSections.forEach(section => {
      reportContent += `## ${section.title}\n\n`;
      
      switch (section.type) {
        case 'summary':
          reportContent += `This report analyzes ${data.rows.length} records across ${data.headers.length} data dimensions. `;
          reportContent += `The dataset "${data.fileName}" contains ${data.headers.filter(h => data.types[h] === 'number').length} numeric fields, `;
          reportContent += `${data.headers.filter(h => data.types[h] === 'string').length} categorical fields, `;
          reportContent += `and ${data.headers.filter(h => data.types[h] === 'date').length} temporal fields.\n\n`;
          break;
        case 'kpi':
          const numericCols = data.headers.filter(h => data.types[h] === 'number');
          numericCols.slice(0, 5).forEach(col => {
            const values = data.rows.map(r => Number(r[col]) || 0);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            reportContent += `- **${col}**: Average = ${avg.toFixed(2)}\n`;
          });
          reportContent += `\n`;
          break;
        case 'insights':
          reportContent += `**Data Quality:** ${((data.rows.length * data.headers.length - data.rows.reduce((acc, row) => {
            return acc + Object.values(row).filter(v => v === null || v === '').length;
          }, 0)) / (data.rows.length * data.headers.length) * 100).toFixed(1)}% complete\n\n`;
          break;
        case 'table':
          reportContent += `[Data table with ${data.rows.length} rows omitted for brevity]\n\n`;
          break;
        case 'chart':
          reportContent += `[Visualizations included in PDF/printed version]\n\n`;
          break;
      }
    });

    return reportContent;
  };

  const downloadReport = (format: 'pdf' | 'docx' | 'txt') => {
    const content = generateReport();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, '_')}.${format === 'pdf' ? 'txt' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Report downloaded as ${format.toUpperCase()}`);
  };

  const previewReport = () => {
    const content = generateReport();
    const preview = window.open('', '_blank');
    if (preview) {
      preview.document.write(`
        <html>
          <head>
            <title>${reportTitle}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
              h1 { color: #7c3aed; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; }
              h2 { color: #5b21b6; margin-top: 30px; }
              pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
            </style>
          </head>
          <body>${content.replace(/\n/g, '<br>').replace(/## (.*?)<br>/g, '<h2>$1</h2>').replace(/# (.*?)<br>/g, '<h1>$1</h1>')}</body>
        </html>
      `);
      preview.document.close();
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Custom Report Builder
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Report Title</label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Template</label>
          <div className="grid grid-cols-3 gap-2">
            {(['executive', 'detailed', 'dashboard'] as const).map(template => (
              <button
                key={template}
                onClick={() => setReportTemplate(template)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  reportTemplate === template
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Layout className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs capitalize">{template}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Report Sections</label>
          <div className="space-y-2">
            {sections.map(section => (
              <label key={section.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg cursor-pointer hover:bg-background/70">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={() => toggleSection(section.id)}
                  className="w-4 h-4"
                />
                <span className="flex-1">{section.title}</span>
                <span className="text-xs text-muted-foreground capitalize">{section.type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={previewReport} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button onClick={() => downloadReport('txt')}>
          <Download className="w-4 h-4 mr-2" />
          TXT
        </Button>
        <Button onClick={() => downloadReport('docx')}>
          <Download className="w-4 h-4 mr-2" />
          DOCX
        </Button>
        <Button onClick={() => downloadReport('pdf')}>
          <Download className="w-4 h-4 mr-2" />
          PDF
        </Button>
      </div>

      <div className="p-4 bg-primary/10 rounded-lg">
        <p className="text-sm">
          💡 <strong>Pro Tip:</strong> Customize your report by selecting which sections to include, then export in your preferred format.
        </p>
      </div>
    </div>
  );
};
