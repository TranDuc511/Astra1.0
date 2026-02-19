import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatWithAI } from './ai/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Memory storage path
const MEMORY_DIR = path.join(__dirname, 'memories');
fs.ensureDirSync(MEMORY_DIR);

// Helper to get formatted date string (YYYY-MM-DD)
const getToday = () => new Date().toISOString().split('T')[0];

// --- Routes ---

// 1. Get current memory context (System + Today)
app.get('/api/memory', async (req, res) => {
  try {
    const today = getToday();
    const systemMemoryPath = path.join(MEMORY_DIR, 'SYSTEM.md');
    const dailyMemoryPath = path.join(MEMORY_DIR, `${today}.md`);

    // Ensure files exist
    await fs.ensureFile(systemMemoryPath);
    await fs.ensureFile(dailyMemoryPath);

    const systemMemory = await fs.readFile(systemMemoryPath, 'utf-8');
    const dailyMemory = await fs.readFile(dailyMemoryPath, 'utf-8');

    res.json({
      system: systemMemory,
      daily: dailyMemory,
      date: today
    });
  } catch (error) {
    console.error('Error reading memory:', error);
    res.status(500).json({ error: 'Failed to read memory' });
  }
});

// 2. Append to daily memory (Auto-logging)
app.post('/api/memory/log', async (req, res) => {
  try {
    const { content, source = 'User' } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const today = getToday();
    const dailyMemoryPath = path.join(MEMORY_DIR, `${today}.md`);
    const timestamp = new Date().toLocaleTimeString();

    const logEntry = `\n[${timestamp}] **${source}:** ${content}`;
    
    await fs.appendFile(dailyMemoryPath, logEntry);
    res.json({ success: true, message: 'Logged to memory' });
  } catch (error) {
    console.error('Error logging memory:', error);
    res.status(500).json({ error: 'Failed to log memory' });
  }
});

// 3. Update System Memory (Long-term facts)
app.post('/api/memory/system', async (req, res) => {
  try {
    const { content } = req.body;
    if (content === undefined) return res.status(400).json({ error: 'Content required' });

    const systemMemoryPath = path.join(MEMORY_DIR, 'SYSTEM.md');
    await fs.writeFile(systemMemoryPath, content, 'utf-8');
    
    res.json({ success: true, message: 'System memory updated' });
  } catch (error) {
    console.error('Error updating system memory:', error);
    res.status(500).json({ error: 'Failed to update system memory' });
  }
});

// 4. Search/List Memories (Simple file list for now)
app.get('/api/memory/list', async (req, res) => {
  try {
    const files = await fs.readdir(MEMORY_DIR);
    const memories = files.filter(f => f.endsWith('.md'));
    res.json({ memories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list memories' });
  }
});

// 5. Chat with AI (The Brain)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // 1. Read Memory Context
    const today = getToday();
    const systemMemoryPath = path.join(MEMORY_DIR, 'SYSTEM.md');
    const dailyMemoryPath = path.join(MEMORY_DIR, `${today}.md`);

    await fs.ensureFile(systemMemoryPath);
    await fs.ensureFile(dailyMemoryPath);

    const systemContext = await fs.readFile(systemMemoryPath, 'utf-8');
    const recentLogs = await fs.readFile(dailyMemoryPath, 'utf-8');

    // 2. Call AI
    const aiReply = await chatWithAI(message, systemContext, recentLogs);

    // 3. Auto-Log Interaction (So AI remembers it!)
    const timestamp = new Date().toLocaleTimeString();
    const interactionLog = `\n[${timestamp}] **User:** ${message}\n[${timestamp}] **AI:** ${aiReply}`;
    
    await fs.appendFile(dailyMemoryPath, interactionLog);

    // 4. Return Reply
    res.json({ reply: aiReply });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Failed to chat with AI' });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 Memory Server running on http://localhost:${PORT}`);
});