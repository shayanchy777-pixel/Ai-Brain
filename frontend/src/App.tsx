import React, { useState, useEffect } from 'react'
import { Plus, Mic, MessageSquare, Book, Settings, Menu, X } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import Chat from './pages/Chat'
import Knowledge from './pages/Knowledge'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported')
    }
  }, [])

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in your browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcript + ' ')
        } else {
          interim += transcript
        }
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error)
      alert('Error: ' + event.error)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
    window.recognitionInstance = recognition
  }

  const stopVoiceRecognition = () => {
    if (window.recognitionInstance) {
      window.recognitionInstance.stop()
      setIsRecording(false)
    }
  }

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        // You can send this blob to backend for transcription
        console.log('Audio recorded:', blob)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setAudioChunks([])
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone')
    }
  }

  const stopAudioRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handleSave = async () => {
    if (!transcript.trim()) {
      alert('Please add some text or record audio')
      return
    }

    try {
      // Save to localStorage for now
      const note = {
        id: Date.now(),
        content: transcript,
        timestamp: new Date().toISOString(),
        type: 'voice'
      }
      const notes = JSON.parse(localStorage.getItem('notes') || '[]')
      notes.push(note)
      localStorage.setItem('notes', JSON.stringify(notes))

      setTranscript('')
      setShowModal(false)
      alert('Note saved successfully!')
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Error saving note')
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'journal':
        return <Journal />
      case 'knowledge':
        return <Knowledge />
      case 'chat':
        return <Chat />
      case 'settings':
        return <div className="page-content"><h1>Settings</h1></div>
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app-container">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
      />

      <main className="main-content">
        <div className="top-bar">
          <button 
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="page-title">
            {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
          </h1>
          <div></div>
        </div>

        {renderPage()}
      </main>

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={() => setShowModal(true)}
      >
        <Plus size={28} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Note</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <textarea
                placeholder="Write your thoughts..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="note-input"
              />

              <div className="voice-buttons">
                {!isRecording ? (
                  <button 
                    className="btn-voice"
                    onClick={startVoiceRecognition}
                  >
                    <Mic size={20} /> Start Voice
                  </button>
                ) : (
                  <button 
                    className="btn-voice recording"
                    onClick={stopVoiceRecognition}
                  >
                    <Mic size={20} /> Stop Recording
                  </button>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false)
                    setTranscript('')
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
