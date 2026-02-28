import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { generateFeedback } from '../lib/ai'
import { saveInterview } from '../lib/supabase'
import { FloatingBlob } from '../components/Decorations'

const INTERVIEW_EMOJIS = {
  cold_call: '📞',
  discovery_basic: '🔍',
  discovery: '🔍',
  objection: '🛡️',
  negotiation: '🤝',
  csm_renewal: '🔄',
  csm_escalation: '🚨',
  qbr: '📊',
  hiring: '💼',
  multi_stakeholder: '👥',
  team_scenario: '👔',
}

export default function Feedback() {
  const [setup, setSetup] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const storedSetup = sessionStorage.getItem('interviewSetup')
    const storedScenario = sessionStorage.getItem('interviewScenario')
    const storedMessages = sessionStorage.getItem('interviewMessages')
    const storedDuration = sessionStorage.getItem('interviewDuration')

    if (!storedSetup || !storedScenario || !storedMessages) {
      navigate('/setup')
      return
    }

    const parsedSetup = JSON.parse(storedSetup)
    const parsedScenario = JSON.parse(storedScenario)
    const parsedMessages = JSON.parse(storedMessages)
    const duration = parseInt(storedDuration || '0', 10)

    setSetup(parsedSetup)
    setScenario(parsedScenario)

    // Generate feedback
    generateFeedback(parsedScenario, parsedSetup.interviewType, parsedSetup.interviewTypeName, parsedMessages, duration).then(
      async (fb) => {
        setFeedback(fb)
        setLoading(false)

        // Save to database
        if (user) {
          try {
            await saveInterview(user.id, {
              roleType: parsedSetup.roleType,
              interviewType: parsedSetup.interviewType,
              companyName: parsedSetup.companyName,
              scenario: parsedScenario,
              feedback: fb,
              duration,
            })
            setSaved(true)
          } catch (e) {
            console.error('Failed to save:', e)
          }
        }
      }
    )
  }, [navigate, user])

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handlePracticeAgain = () => {
    // Clear interview-specific data, keep setup
    sessionStorage.removeItem('interviewScenario')
    sessionStorage.removeItem('interviewMessages')
    sessionStorage.removeItem('interviewDuration')
    navigate('/ready')
  }

  const handleNewSetup = () => {
    sessionStorage.clear()
    navigate('/setup')
  }

  // Loading state
  if (loading || !setup || !scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-violet-400 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing...</h2>
          <p className="text-gray-600">Finding teachable moments</p>
        </div>
      </div>
    )
  }

  const emoji = INTERVIEW_EMOJIS[setup.interviewType] || '🎯'

  // Render annotated transcript
  const renderAnnotatedTranscript = () => {
    if (!feedback?.transcript) return null

    const lines = feedback.transcript.split('\n\n').filter((l) => l.trim())

    return lines.map((line, i) => {
      // Find if this line matches any annotated moment
      const moment = feedback.annotatedMoments?.find((m) => line.toLowerCase().includes(m.quote?.toLowerCase().slice(0, 30)))

      return (
        <div key={i} className="mb-4">
          <p className={`text-sm ${line.startsWith('You:') ? 'text-violet-700 font-medium' : 'text-gray-600'}`}>
            {line}
          </p>
          {moment && (
            <div
              className={`mt-2 ml-4 p-3 rounded-xl text-sm ${
                moment.type === 'good' ? 'bg-emerald-50 border-l-4 border-emerald-400' : 'bg-amber-50 border-l-4 border-amber-400'
              }`}
            >
              <span className="font-medium">{moment.type === 'good' ? '✓ ' : '⚠️ '}</span>
              {moment.note}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden pb-12">
      <FloatingBlob className="absolute -top-20 -right-20 w-80 h-80 opacity-20" color="#FED7AA" />
      <FloatingBlob className="absolute -bottom-20 -left-20 w-60 h-60 opacity-20" color="#C4B5FD" />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full text-sm text-gray-600 mb-4">
            {emoji} {setup.interviewTypeName} • {formatTime(feedback?.duration || 0)}
            {saved && <span className="text-emerald-500">• Saved</span>}
          </div>

          {/* Big Score */}
          <div
            className={`text-7xl font-bold mb-2 ${
              feedback?.overallScore >= 75
                ? 'text-emerald-500'
                : feedback?.overallScore >= 55
                ? 'text-amber-500'
                : 'text-red-500'
            }`}
          >
            {feedback?.overallScore || 0}
          </div>
          <p className="text-gray-500 mb-4">out of 100</p>

          {/* Summary */}
          <p className="text-gray-700">{feedback?.summary}</p>
        </div>

        {/* Dimension Scores */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-orange-100/50 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">📊 Breakdown</h3>
          <div className="space-y-4">
            {feedback?.dimensionScores?.map((dim, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{dim.name}</span>
                  <span className={dim.score >= 70 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                    {dim.score}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${dim.score >= 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{dim.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        {feedback?.strengths?.length > 0 && (
          <div className="bg-emerald-50/80 backdrop-blur-sm rounded-3xl p-6 mb-6">
            <h3 className="font-semibold text-emerald-800 mb-4">✅ What worked</h3>
            {feedback.strengths.map((s, i) => (
              <div key={i} className="bg-white/60 rounded-2xl p-4 mb-3 last:mb-0">
                <p className="text-gray-800">{s.point}</p>
                <p className="text-sm text-emerald-600 mt-1">{s.framework}</p>
              </div>
            ))}
          </div>
        )}

        {/* Improvements */}
        {feedback?.improvements?.length > 0 && (
          <div className="bg-amber-50/80 backdrop-blur-sm rounded-3xl p-6 mb-6">
            <h3 className="font-semibold text-amber-800 mb-4">🎯 To improve</h3>
            {feedback.improvements.map((s, i) => (
              <div key={i} className="bg-white/60 rounded-2xl p-4 mb-3 last:mb-0">
                <p className="text-gray-800">{s.point}</p>
                {s.tip && <p className="text-sm text-gray-600 mt-1">💡 {s.tip}</p>}
                <p className="text-sm text-amber-600 mt-1">{s.framework}</p>
              </div>
            ))}
          </div>
        )}

        {/* Annotated Transcript */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">📜 Annotated Transcript</h3>
          <div className="max-h-96 overflow-y-auto pr-2">{renderAnnotatedTranscript()}</div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleNewSetup}
            className="flex-1 py-4 bg-white text-gray-700 font-medium rounded-2xl shadow-sm hover:shadow transition-all"
          >
            New Setup
          </button>
          <button
            onClick={handlePracticeAgain}
            className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all"
          >
            Practice Again
          </button>
        </div>

        {/* Home link */}
        <Link to="/" className="block text-center text-gray-500 mt-4 hover:text-gray-700 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
