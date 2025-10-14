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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 gradient-primary rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                DataViz Pro
              </h1>
              <p className="text-xs text-muted-foreground">
                Enterprise Data Visualization Platform
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Processing your data...</p>
          </div>
        ) : parsedData ? (
          <Dashboard data={parsedData} onReset={handleReset} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4 mb-12 animate-slide-up">
              <h2 className="text-4xl font-bold">
                Transform Your Data Into{' '}
                <span className="gradient-accent bg-clip-text text-transparent">
                  Insights
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your data files and let our intelligent visualization engine create
                stunning, interactive charts automatically.
              </p>
            </div>

            <FileUpload onFilesSelected={handleFilesSelected} />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="glass-card p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold mb-2">Smart Charts</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-generated visualizations based on your data structure
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Client-side processing means instant results with no server needed
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold mb-2">100% Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your data never leaves your browser - complete privacy guaranteed
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
