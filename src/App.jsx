import { useState, useEffect, useRef } from 'react';
import { memoryService } from './services/memory';
import './App.css';

function App() {
  const [memory, setMemory] = useState({ system: '', daily: '' });
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // Local session history
  const logEndRef = useRef(null);

  // Load memory on mount
  useEffect(() => {
    refreshMemory();
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [memory.daily]);

  const refreshMemory = async () => {
    try {
      const data = await memoryService.getContext();
      setMemory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = chatInput;
    setChatInput('');
    setLoading(true);

    // Optimistic UI update
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      // Send to AI (Backend handles logging to file)
      const data = await memoryService.chat(userMsg);
      
      setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }]);
      
      // Refresh logs so we see the new memory entry immediately
      await refreshMemory(); 
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'error', content: "Failed to reach AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🧠 AI Memory System</h1>
        <p>Current Context: {memory.date}</p>
      </header>

      <main className="grid">
        {/* Left: System Memory (Personality) */}
        <section className="column left-col">
          <div className="card system-memory">
            <h2>🌌 System Identity</h2>
            <textarea
              value={memory.system}
              onChange={(e) => setMemory({ ...memory, system: e.target.value })}
              onBlur={() => memoryService.updateSystem(memory.system)}
              placeholder="You are a helpful AI..."
              rows={15}
            />
          </div>
          
          <div className="card instructions">
            <h3>Usage</h3>
            <p>1. <strong>Identity:</strong> Edit the box above to define who the AI is.</p>
            <p>2. <strong>Chat:</strong> Use the box on the right to talk.</p>
            <p>3. <strong>Memory:</strong> Everything is auto-saved to <code>server/memories/</code>.</p>
          </div>
        </section>

        {/* Right: Chat & Logs */}
        <section className="column right-col">
          
          {/* Active Chat */}
          <div className="card chat-interface">
            <h2>💬 Chat</h2>
            <div className="chat-window">
              {chatHistory.length === 0 && <p className="placeholder">Start talking to wake the AI...</p>}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <strong>{msg.role === 'ai' ? '🤖' : '👤'}:</strong> {msg.content}
                </div>
              ))}
              {loading && <div className="message ai typing">🤖 Thinking...</div>}
            </div>
            <form onSubmit={handleChat} className="chat-input">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                disabled={loading}
              />
              <button type="submit" disabled={loading}>Send</button>
            </form>
          </div>

          {/* Raw Memory Log Viewer */}
          <div className="card daily-log">
            <h3>📝 Memory Stream (Today)</h3>
            <div className="log-viewer">
              <pre>{memory.daily || '(No memory yet)'}</pre>
              <div ref={logEndRef} />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default App;