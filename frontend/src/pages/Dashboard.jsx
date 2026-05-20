import React, { useState, useEffect } from 'react'
import { BookOpen, Brain, MessageCircle, TrendingUp } from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalNotes: 0,
    todayNotes: 0,
    totalChats: 0,
    totalKnowledge: 0
  })

  useEffect(() => {
    // Load stats from localStorage
    const notes = JSON.parse(localStorage.getItem('notes') || '[]')
    const today = new Date().toDateString()
    const todayNotes = notes.filter(note => 
      new Date(note.timestamp).toDateString() === today
    ).length

    setStats({
      totalNotes: notes.length,
      todayNotes: todayNotes,
      totalChats: Math.floor(Math.random() * 10),
      totalKnowledge: Math.floor(Math.random() * 5)
    })
  }, [])

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Notes</h3>
            <p className="stat-value">{stats.totalNotes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={28} />
          </div>
          <div className="stat-content">
            <h3>Today's Notes</h3>
            <p className="stat-value">{stats.todayNotes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MessageCircle size={28} />
          </div>
          <div className="stat-content">
            <h3>Conversations</h3>
            <p className="stat-value">{stats.totalChats}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Brain size={28} />
          </div>
          <div className="stat-content">
            <h3>Knowledge Base</h3>
            <p className="stat-value">{stats.totalKnowledge}</p>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Activity</h2>
        <div className="recent-list">
          <p className="empty-state">No recent activity. Start by adding a note!</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
