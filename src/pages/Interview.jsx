import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInterviewerOpening, getInterviewerResponse } from '../lib/ai'

export default function Interview() {
  const [setup, setSetup] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5 * 60) // 5 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  // Initialize
  useEffect(() => {
    const storedSetup = sessionStorage.getItem('interviewSetup')
    const storedScenario = sessionStorage.getItem('interviewScenario')

    if (!storedSetup || !storedScenario) {
      navigate('/setup')
      return
    }

    const parsedSetup = JSON.parse(storedSetup)
    const parsedScenario = JSON.parse(storedScenario)
    setSetup(parsedSetup)
    setScenario(parsedScenario)

    // Get interviewer opening
    getInterviewerOpening(parsedScenario, parsedSetup.interviewType).then((opening) => {
      setMessages([{ role: 'ai', content: opening }])
      setIsTimerRunning(true)
    })
  }, [navigate])

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-IN'

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setCurrentTranscript((prev) => prev + ' ' + finalTranscript)
        }
      }

      recognitionRef.current.onend = () => {
        if (isListening && !hasEnded) {
          recognitionRef.current?.start()
        }
      }

      recognitionRef.current.onerror = (e) => {
        console.error('Speech error:', e)
        setIsListening(false)
      }
    }

    return () => {
      recognitionRef.current?.stop()
    }
  }, [isListening, hasEnded])

  // Timer
  useEffect(() => {
    let interval
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    } else if (timeLeft === 0 && isTimerRunning) {
      handleEndInterview()
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const startListening = () => {
    if (hasEnded || isProcessing) return
    setIsListening(true)
    setCurrentTranscript('')
    try {
      recognitionRef.current?.start()
    } catch (e) {
      console.error('Start error:', e)
    }
  }

  const stopListening = async () => {
    setIsListening(false)
    recognitionRef.current?.stop()

    const text = currentTranscript.trim()
    setCurrentTranscript('')

    if (text) {
      await sendMessage(text)
    }
  }

  const sendMessage = async (text) => {
    if (!text || isProcessing || hasEnded) return

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setIsProcessing(true)

    const response = await getInterviewerResponse(scenario, setup.interviewType, newMessages, text)

    setMessages((prev) => [...prev, { role: 'ai', content: response }])
    setIsProcessing(false)
  }

  const handleEndInterview = () => {
    if (hasEnded) return
    setHasEnded(true)
    setIsTimerRunning(false)
    setIsListening(false)
    recognitionRef.current?.stop()

    // Store messages for feedback
    sessionStorage.setItem('interviewMessages', JSON.stringify(messages))
    sessionStorage.setItem('interviewDuration', String(5 * 60 - timeLeft))

    navigate('/feedback')
  }

  if (!setup || !scenario) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div>
          <p className="text-slate-400 text-sm">{scenario.personName}</p>
          <p className="text-white font-medium">{setup.companyName || setup.interviewTypeName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`text-2xl font-mono tabular-nums ${
              timeLeft < 60 ? 'text-red-400 animate-pulse' : timeLeft < 120 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleEndInterview}
            disabled={hasEnded}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            End
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}
            >
              {msg.role === 'ai' && <p className="text-xs text-slate-400 mb-1">{scenario.personName}</p>}
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-slate-800 rounded-2xl px-5 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Transcript preview */}
      {currentTranscript && (
        <div className="px-6 py-2">
          <div className="bg-slate-800/50 rounded-xl px-4 py-2 text-slate-400 text-sm italic">
            {currentTranscript}...
          </div>
        </div>
      )}

      {/* Voice Input */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || hasEnded}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 shadow-lg shadow-red-500/50'
                : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30 hover:shadow-xl'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening && (
              <div className="absolute w-24 h-24 rounded-full bg-red-500/30 animate-pulse-ring" />
            )}
            <span className="text-3xl relative z-10">{isListening ? '⏹️' : '🎤'}</span>
          </button>
          <p className="text-slate-400 text-sm mt-3">
            {hasEnded ? 'Interview ended' : isListening ? 'Listening... tap to send' : 'Tap to speak'}
          </p>
        </div>
      </div>
    </div>
  )
}
