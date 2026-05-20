import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body

    // TODO: Integrate with Gemini API
    const response = {
      response: 'This is a placeholder response. Connect your Gemini API key to get real responses.'
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Voice transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    // TODO: Implement voice transcription using OpenAI or Google Speech-to-Text
    res.json({ text: 'Transcription placeholder' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
