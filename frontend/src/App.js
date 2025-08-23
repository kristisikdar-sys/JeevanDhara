import React, { useEffect, useState } from 'react';
import DataView from './components/DataView';
import Analysis from './components/Analysis';
import { fetchData, runAnalysis } from './api';

function App() {
  const [data, setData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Hackathon Project';
  }, []);

  const handleLoadData = async () => {
    setError(null);
    setLoadingData(true);
    try {
      const rows = await fetchData();
      setData(rows || []);
    } catch (err) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleRunAnalysis = async () => {
    setError(null);
    setLoadingAnalysis(true);
    try {
      const result = await runAnalysis();
      setAnalysis(result || null);
    } catch (err) {
      setError(err?.message || 'Failed to run analysis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full bg-gray-900 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">Hackathon Project</h1>
          <div className="space-x-2">
            <button
              onClick={handleLoadData}
              disabled={loadingData}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded"
            >
              {loadingData ? 'Loading…' : 'Load Data'}
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={loadingAnalysis}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded"
            >
              {loadingAnalysis ? 'Running…' : 'Run Analysis'}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 flex-1">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <section className="mb-6">
          <h2 className="text-xl font-medium mb-2">Dataset</h2>
          <DataView data={data} />
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">Analysis</h2>
          <Analysis result={analysis} />
        </section>
      </main>
    </div>
  );
}

export default App;
