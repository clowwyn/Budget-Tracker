import { useEffect, useState } from 'react';
import { DatabaseService } from './infrastructure/database/DatabaseService';
import Dashboard from './presentation/screens/Dashboard';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        await DatabaseService.getInstance().initialize();
        setDbReady(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      }
    };

    initDb();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bloom-card p-8 max-w-md mx-4">
          <h2 className="headline-md text-error mb-4">Database Error</h2>
          <p className="body-md text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bloom-card p-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="body-lg text-on-surface">Initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

export default App;
