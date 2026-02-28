import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSimulationResponse } from '../lib/ai'
import { 
  AudioRecorder, 
  transcribeAudio, 
  synthesizeSpeech, 
  playBase64Audio,
  isSarvamAvailable,
  createBrowserSpeechRecognition 
} from '../lib/voice'

export default function Simulation() {
  const [setup, setSetup] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)
  const [micError, setMicError] = useState(null)
  const [usingSarvam, setUsingSarvam] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  const audioRecorderRef = useRef(null)
  const browserRecognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  // Initialize
  useEffect(() => {
    const storedSetup = sessionStorage.getItem('simulationSetup')
    const storedScenario = sessionStorage.getItem('simulationScenario')

    if (!storedSetup || !storedScenario) {
      navigate('/setup')
      return
    }

    const parsedSetup = JSON.parse(storedSetup)
    const parsedScenario = JSON.parse(storedScenario)
    setSetup(parsedSetup)
    setScenario(parsedScenario)
    
    const sarvamAvailable = isSarvamAvailable()
    setUsingSarvam(sarvamAvailable)
    console.log('Sarvam available:', sarvamAvailable)

    // Check microphone permissions
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('Microphone access granted')
        setMicError(null)
      })
      .catch((err) => {
        console.error('Mic error:', err)
        setMicError('Microphone access denied. Please allow microphone access.')
      })

    // Start with AI's opening line
    const openingLine = parsedScenario.openingLine || 'Hello?'
    setMessages([{ role: 'ai', content: openingLine }])
    setIsTimerRunning(true)

    // Speak the opening line
    if (sarvamAvailable) {
      speakText(openingLine)
    }

    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop()
      }
      if (browserRecognitionRef.current) {
        browserRecognitionRef.current.stop()
      }
    }
  }, [navigate])

  // Timer
  useEffect(() => {
    let interval
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    } else if (timeLeft === 0 && isTimerRunning) {
      handleEndSimulation()
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentTranscript])

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // Speak text using Sarvam TTS
  const speakText = async (text) => {
    if (!voiceEnabled || !usingSarvam) return
    
    setIsSpeaking(true)
    try {
      const audioBase64 = await synthesizeSpeech(text, 'aditya')
      if (audioBase64) {
        await playBase64Audio(audioBase64)
      }
    } catch (error) {
      console.error('TTS error:', error)
    }
    setIsSpeaking(false)
  }

  const startListening = async () => {
    if (hasEnded || isProcessing || isSpeaking || micError) return

    setIsListening(true)
    setCurrentTranscript('')

    if (usingSarvam) {
      // Use Sarvam AI with audio recording
      audioRecorderRef.current = new AudioRecorder()
      const started = await audioRecorderRef.current.start()
      if (!started) {
        setMicError('Failed to start recording. Please check microphone permissions.')
        setIsListening(false)
      }
    } else {
      // Use browser speech recognition as fallback
      browserRecognitionRef.current = createBrowserSpeechRecognition(
        (final, interim) => {
          setCurrentTranscript(final + interim)
        },
        async (finalText) => {
          setIsListening(false)
          if (finalText) {
            await sendMessage(finalText)
          }
        }
      )

      if (browserRecognitionRef.current) {
        try {
          browserRecognitionRef.current.start()
        } catch (e) {
          console.error('Recognition start error:', e)
          setMicError('Speech recognition not supported. Try Chrome.')
          setIsListening(false)
        }
      } else {
        setMicError('Speech recognition not supported. Try Chrome.')
        setIsListening(false)
      }
    }
  }

  const stopListening = async () => {
    setIsListening(false)

    if (usingSarvam && audioRecorderRef.current) {
      // Stop recording and transcribe with Sarvam
      setCurrentTranscript('Transcribing...')
      setIsProcessing(true)
      
      const audioBlob = await audioRecorderRef.current.stop()
      
      if (audioBlob && audioBlob.size > 0) {
        console.log('Audio blob size:', audioBlob.size)
        const transcript = await transcribeAudio(audioBlob)
        setCurrentTranscript('')
        
        if (transcript) {
          console.log('Transcript:', transcript)
          await sendMessage(transcript)
        } else {
          console.error('No transcript received')
          setIsProcessing(false)
          setMicError('Could not transcribe. Try speaking louder or use text input.')
        }
      } else {
        setCurrentTranscript('')
        setIsProcessing(false)
      }
    } else if (browserRecognitionRef.current) {
      browserRecognitionRef.current.stop()
    }
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isProcessing || hasEnded) return

    const userMessage = text.trim()
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsProcessing(true)
    setCurrentTranscript('')

    try {
      const response = await getSimulationResponse(
        scenario,
        setup.simulationType,
        newMessages,
        userMessage,
        setup.productContext
      )

      setMessages((prev) => [...prev, { role: 'ai', content: response }])
      
      // Speak the AI response
      if (voiceEnabled && usingSarvam) {
        await speakText(response)
      }
    } catch (error) {
      console.error('Response error:', error)
      const fallbackResponse = "I see. Go on..."
      setMessages((prev) => [...prev, { role: 'ai', content: fallbackResponse }])
    }

    setIsProcessing(false)
  }

  const handleEndSimulation = () => {
    if (hasEnded) return
    setHasEnded(true)
    setIsTimerRunning(false)
    setIsListening(false)

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop()
    }
    if (browserRecognitionRef.current) {
      browserRecognitionRef.current.stop()
    }

    sessionStorage.setItem('simulationMessages', JSON.stringify(messages))
    sessionStorage.setItem('simulationDuration', String(5 * 60 - timeLeft))

    navigate('/feedback')
  }

  // Manual text input fallback
  const [textInput, setTextInput] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)

  const handleTextSubmit = async (e) => {
    e.preventDefault()
    if (textInput.trim()) {
      await sendMessage(textInput)
      setTextInput('')
    }
  }

  if (!setup || !scenario) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        <div className="flex-1">
          <p className="text-slate-400 text-sm">{scenario.personName}</p>
          <p className="text-white font-medium">{setup.companyName}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Voice toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg transition-colors ${voiceEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}
            title={voiceEnabled ? 'Voice on' : 'Voice off'}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
          <div className={`text-2xl font-mono tabular-nums ${
            timeLeft < 60 ? 'text-red-400 animate-pulse' :
            timeLeft < 120 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleEndSimulation}
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
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : 'bg-slate-800 text-slate-100'
            }`}>
              {msg.role === 'ai' && (
                <p className="text-xs text-slate-400 mb-1">{scenario.personName}</p>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {(isProcessing || isSpeaking) && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-slate-800 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <span className="text-xs text-slate-500">
                  {isSpeaking ? 'Speaking...' : 'Thinking...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Current transcript preview */}
      {currentTranscript && (
        <div className="px-6 py-2">
          <div className="bg-slate-800/50 rounded-xl px-4 py-2 text-slate-400 text-sm italic">
            {currentTranscript}
          </div>
        </div>
      )}

      {/* Mic error */}
      {micError && (
        <div className="px-6 py-2">
          <div className="bg-red-500/20 rounded-xl px-4 py-2 text-red-400 text-sm flex items-center justify-between">
            <span>{micError}</span>
            <button 
              onClick={() => {
                setShowTextInput(true)
                setMicError(null)
              }}
              className="text-red-300 underline ml-2"
            >
              Type instead
            </button>
          </div>
        </div>
      )}

      {/* Text input fallback */}
      {showTextInput && (
        <form onSubmit={handleTextSubmit} className="px-6 py-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
              disabled={isProcessing || hasEnded || isSpeaking}
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing || hasEnded || isSpeaking}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      )}

      {/* Voice Input */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || hasEnded || isSpeaking || !!micError}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all relative ${
              isListening
                ? 'bg-red-500 shadow-lg shadow-red-500/50'
                : isSpeaking
                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping" />
            )}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse" />
            )}
            <span className="text-3xl relative z-10">
              {isSpeaking ? '🔊' : isListening ? '⏹️' : '🎤'}
            </span>
          </button>
          
          <p className="text-slate-400 text-sm mt-3">
            {hasEnded ? 'Simulation ended' :
             isSpeaking ? 'AI is speaking...' :
             isProcessing ? 'Processing...' :
             isListening ? 'Listening... tap to send' :
             micError ? 'Mic unavailable' :
             'Tap to speak'}
          </p>

          {/* Toggle text input */}
          {!showTextInput && !micError && (
            <button
              onClick={() => setShowTextInput(true)}
              className="text-slate-500 text-xs mt-2 hover:text-slate-400"
            >
              or type instead
            </button>
          )}

          {/* Voice mode indicator */}
          <p className="text-slate-600 text-xs mt-2">
            {usingSarvam ? '🇮🇳 Sarvam AI (Speech-to-Speech)' : '🌐 Browser Speech'}
          </p>
        </div>
      </div>
    </div>
  )
}
