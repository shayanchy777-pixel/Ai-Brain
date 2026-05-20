import React, { useState, useEffect } from 'react'
import { Trash2, Edit2 } from 'lucide-react'
import './Pages.css'

function Journal() {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
    setNotes(savedNotes.reverse())
  }, [])

  const deleteNote = (id) => {
    const updated = notes.filter(note => note.id !== id)
    localStorage.setItem('notes', JSON.stringify(updated))
    setNotes(updated)
  }

  return (
    <div className="page-content">
      <div className="notes-grid">
        {notes.length === 0 ? (
          <p className="empty-state">No notes yet. Click the + button to add one!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <p>{note.content}</p>
              <div className="note-footer">
                <small>{new Date(note.timestamp).toLocaleDateString()}</small>
                <button 
                  className="delete-btn"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Journal
