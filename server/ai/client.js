import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Default config: Points to Local (Ollama/LM Studio) by default if env is missing
const config = {
  baseURL: process.env.AI_BASE_URL || 'http://localhost:11434/v1', // Default: Ollama
  apiKey: process.env.AI_API_KEY || 'ollama', // Often ignored locally
  model: process.env.AI_MODEL || 'qwen2.5:3b',   // Default model
};

const openai = new OpenAI({
  baseURL: config.baseURL,
  apiKey: config.apiKey,
});

/**
 * Main function to chat with AI.
 * It automatically injects:
 * 1. System Prompt (Identity)
 * 2. Recent Memory (Context)
 */
export async function chatWithAI(userMessage, systemContext = '', recentLogs = '') {
  try {
    const messages = [
      { role: 'system', content: systemContext },
      { role: 'system', content: `Current Context (Today's Logs):\n${recentLogs}` },
      { role: 'user', content: userMessage }
    ];

    console.log(`🤖 Sending to AI (${config.model})...`);

    const completion = await openai.chat.completions.create({
      messages,
      model: config.model,
      temperature: 0.7, // Creativity (0.7 is balanced)
    });

    const reply = completion.choices[0].message.content;
    return reply;
  } catch (error) {
    console.error('❌ AI Error:', error.message);
    return `[System Error] Failed to reach AI at ${config.baseURL}. Is it running?`;
  }
}