const API_URL = 'http://localhost:3001/api/memory';

export const memoryService = {
  // Get System + Daily memory
  async getContext() {
    const res = await fetch(`${API_URL}`);
    if (!res.ok) throw new Error('Failed to fetch memory');
    return res.json();
  },

  // Log a chat/thought/event
  async logEntry(content, source = 'User') {
    const res = await fetch(`${API_URL}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, source }),
    });
    return res.json();
  },

  // Update Core/System memory (The "Soul")
  async updateSystem(content) {
    const res = await fetch(`${API_URL}/system`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  // Chat with AI
  async chat(message) {
    const res = await fetch(`http://localhost:3001/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return res.json();
  }
};