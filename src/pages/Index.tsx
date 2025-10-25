import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';
import { ParsedData, parseFile } from '@/utils/dataParser';
import { BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    setLoading(true);

    try {
      // For simplicity, process the first file
      const file = files[0];
      const data = await parseFile(file);
      setParsedData(data);
      toast.success('Data parsed successfully!');
    } catch (error) {
      toast.error('Failed to parse file: ' + (error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg sticky top-0 z-40 glass-panel">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 gradient-primary rounded-xl shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  DataViz Pro
                </h1>
                <p className="text-xs text-muted-foreground">
                  Enterprise Analytics Platform
                </p>
              </div>
            </div>
            {parsedData && (
              <button onClick={handleReset} className="btn-accent text-sm">
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground">Processing your data...</p>
            <p className="text-sm text-muted-foreground/60">Analyzing structure and generating insights</p>
          </div>
        ) : parsedData ? (
          <Dashboard data={parsedData} onReset={handleReset} />
        ) : (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12 animate-fade-in">
              <div className="inline-block px-4 py-2 glass-panel rounded-full mb-4">
                <span className="text-sm font-medium text-primary">🚀 The Ultimate Data Analysis Tool</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Transform Your Data Into{' '}
                <span className="gradient-accent bg-clip-text text-transparent">
                  Actionable Insights
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Upload your data files and unlock the power of professional analytics. 
                Generate beautiful visualizations, AI-powered insights, and comprehensive reports in seconds.
              </p>
            </div>

            {/* File Upload */}
            <div className="animate-slide-up">
              <FileUpload onFilesSelected={handleFilesSelected} />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              <div className="glass-card p-6 hover-lift cursor-default">
                <div className="w-14 h-14 gradient-primary rounded-xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Smart Visualizations</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  10+ chart types with auto-suggestions based on your data structure
                </p>
              </div>

              <div className="glass-card p-6 hover-lift cursor-default">
                <div className="w-14 h-14 gradient-accent rounded-xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="font-bold text-lg mb-2">KPI Tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Define and monitor key performance indicators with trend analysis
                </p>
              </div>

              <div className="glass-card p-6 hover-lift cursor-default">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Data Transformation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Apply operations like normalization, aggregation, and moving averages
                </p>
              </div>

              <div className="glass-card p-6 hover-lift cursor-default">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pivot tables, correlation analysis, and multi-dimensional comparisons
                </p>
              </div>

              <div className="glass-card p-6 hover-lift cursor-default">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="font-bold text-lg mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automatic trend detection, anomaly alerts, and data quality analysis
                </p>
              </div>

              <div className="glass-card p-6 hover-lift cursor-default">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📄</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Export Options</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Export to CSV, Excel, PDF, JSON or print professional reports
                </p>
              </div>

              <div className="glass-card p-6 hover-lift cursor-default">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Client-side processing means instant results with no server delays
                </p>
              </div>

              <div className="glass-card p-6 hover-lift cursor-default">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="font-bold text-lg mb-2">100% Private</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data never leaves your browser - complete privacy guaranteed
                </p>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="glass-card p-8 text-center mt-16">
              <h3 className="text-xl font-bold mb-4">Supported Formats</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {['CSV', 'Excel (.xlsx)', 'JSON', 'TSV', 'Text Files'].map((format) => (
                  <span key={format} className="px-4 py-2 glass-panel rounded-lg text-sm font-medium">
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {!parsedData && (
        <footer className="border-t border-border/50 mt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>Built for data professionals. Secure, fast, and powerful.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
