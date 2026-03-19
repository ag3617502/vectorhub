import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

function App() {
  const [inputs, setInputs] = useState(['']);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  const addInput = () => {
    if (inputs.length < 10) {
      setInputs([...inputs, '']);
      setIsProcessed(false);
    }
  };

  const removeInput = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs.length ? newInputs : ['']);
    setIsProcessed(false);
  };

  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    setIsProcessed(false);
  };

  const handleProcess = async () => {
    const activeInputs = inputs.filter(i => i.trim());
    if (activeInputs.length === 0) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/process`, {
        strings: activeInputs
      });
      setIsProcessed(true);
      alert("Phrases have been processed and saved to the AI database!");
    } catch (error) {
      console.error("Processing error:", error);
      alert("Error processing phrases. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!question || !isProcessed) return;
    
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(`${API_BASE}/search`, {
        query: question
      });
      setResult(response.data.matches[0]);
    } catch (error) {
      console.error("Search error:", error);
      alert("Error finding match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Semantic Match</h1>
        <p className="subtitle">Find which of your phrases best matches a query using AI embeddings.</p>

        <div className="input-group">
          <label>Your Phrases</label>
          <div className="dynamic-inputs">
            {inputs.map((input, index) => (
              <div key={index} className="input-row">
                <input
                  type="text"
                  placeholder={`Phrase #${index + 1}`}
                  value={input}
                  onChange={(e) => updateInput(index, e.target.value)}
                />
                <button 
                  className="btn btn-danger" 
                  onClick={() => removeInput(index)}
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          {inputs.length < 10 && (
            <button className="btn btn-secondary" onClick={addInput}>
              <Plus size={18} /> Add Phrase
            </button>
          )}
        </div>
        <div className="button-group" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleProcess}
            disabled={loading || inputs.every(i => !i.trim())}
          >
            {loading && !isProcessed ? <Loader2 className="animate-spin" size={18} /> : null}
            Sync with AI Database
          </button>
        </div>

        <div className="input-group">
          <label>Ask a Question</label>
          <input
            type="text"
            placeholder="e.g. Where does he live?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!isProcessed}
          />
          {!isProcessed && <small style={{ color: '#888' }}>Please sync phrases with AI database first.</small>}
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleSearch}
          disabled={loading || !question || !isProcessed}
        >
          {loading && isProcessed ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          {loading && isProcessed ? 'Finding Match...' : 'Search Top Match'}
        </button>

        {result && (
          <div className="result-card">
            <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="result-label" style={{ fontWeight: 'bold' }}>Best Match Found</span>
              <span className="result-confidence" style={{ color: '#4CAF50' }}>Confidence: {Math.round((1 - result.distance) * 100)}%</span>
            </div>
            <div className="result-text">{result.text}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
