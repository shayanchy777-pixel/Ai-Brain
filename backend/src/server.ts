import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all captures
app.get('/api/captures', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch captures' });
  }
});

// Create new capture
app.post('/api/captures', async (req, res) => {
  try {
    const { content, type, source } = req.body;
    
    // Classify with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const classification = await model.generateContent(
      `Classify this capture as one of: task, idea, journal, note, reminder. Content: "${content}"`
    );

    const { data, error } = await supabase
      .from('captures')
      .insert([{
        content,
        type: type || 'note',
        source: source || 'web',
        category: classification.response.text().split('\n')[0],
        created_at: new Date(),
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create capture' });
  }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const [captures, tasks, completed] = await Promise.all([
      supabase.from('captures').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    ]);

    res.json({
      totalCaptures: captures.count || 0,
      pendingTasks: tasks.count || 0,
      completedToday: completed.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 Personal OS Backend running on http://localhost:${PORT}`);
});
