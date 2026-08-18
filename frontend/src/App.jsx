import { useState } from 'react';
import AssessmentForm from './components/AssessmentForm';
import AssessmentResults from './components/AssessmentResults';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.details?.join(', ') || data.error || 'Failed to submit assessment';
        throw new Error(message);
      }

      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>CloudPath</h1>
        <p className="subtitle">Cloud Readiness &amp; Modernization Assessment</p>
        <p className="supporting-text">
          Evaluate an existing application, identify cloud-modernization gaps, and determine the
          most appropriate modernization path.
        </p>
      </header>

      <main className="app-main">
        {error && (
          <div className="alert alert-error" role="alert">
            <strong>Assessment failed:</strong> {error}
          </div>
        )}

        {result ? (
          <AssessmentResults result={result} onReset={handleReset} />
        ) : (
          <AssessmentForm onSubmit={handleSubmit} loading={loading} />
        )}
      </main>
    </div>
  );
}

export default App;
