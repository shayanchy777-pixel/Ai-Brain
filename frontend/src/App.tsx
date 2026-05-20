import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Menu, X, Search, Plus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Capture {
  id: string;
  content: string;
  type: string;
  created_at: string;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for voice transcription
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  const startVoiceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Also start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access');
    }
  };

  const stopVoiceRecord = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setIsListening(false);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('http://localhost:3000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setInputText(data.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const addCapture = async () => {
    if (!inputText.trim()) return;

    try {
      const { data, error } = await supabase
        .from('captures')
        .insert([
          {
            content: inputText,
            type: 'note',
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        setCaptures([data[0], ...captures]);
      }
      setInputText('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding capture:', error);
    }
  };

  useEffect(() => {
    const fetchCaptures = async () => {
      try {
        const { data, error } = await supabase
          .from('captures')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setCaptures(data || []);
      } catch (error) {
        console.error('Error fetching captures:', error);
      }
    };

    fetchCaptures();
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-slate-900 border-r border-purple-500/20 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-purple-500/20">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Personal OS
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {['Dashboard', 'Inbox', 'Tasks', 'Journal', 'Daily Notes', 'Search'].map((item) => (
            <button
              key={item}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-500/20 transition-colors text-gray-300 hover:text-white"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-1 mx-4 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search memories..."
              className="w-full bg-slate-800 border border-purple-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Captures', value: captures.length, color: 'from-purple-500' },
              { label: 'This Week', value: '12', color: 'from-blue-500' },
              { label: 'Completed', value: '8', color: 'from-green-500' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.color} to-transparent rounded-lg p-6 border border-purple-500/20`}
              >
                <p className="text-gray-300 text-sm">{stat.label}</p>
                <p className="text-4xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Captures */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Captures</h2>
            <div className="space-y-3">
              {captures.map((capture) => (
                <div
                  key={capture.id}
                  className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                >
                  <p className="text-gray-300">{capture.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(capture.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {captures.length === 0 && (
                <p className="text-gray-500 text-center py-8">No captures yet. Create one below!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Capture Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-6 w-96 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Quick Capture</h2>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or speak your thoughts..."
              className="w-full bg-slate-800 border border-purple-500/30 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 mb-4 resize-none h-32"
            />

            <div className="flex gap-3">
              <button
                onClick={isRecording ? stopVoiceRecord : startVoiceRecord}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                <Mic size={20} />
                {isRecording ? 'Stop Recording' : 'Start Voice'}
              </button>

              <button
                onClick={addCapture}
                disabled={!inputText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                Save
              </button>
            </div>

            {isListening && (
              <p className="text-sm text-purple-400 mt-3 text-center">🎤 Listening...</p>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                if (isRecording) stopVoiceRecord();
              }}
              className="w-full mt-4 px-4 py-2 border border-gray-500 rounded-lg hover:bg-gray-500/20 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
