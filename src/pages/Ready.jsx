import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { generateScenario } from '../lib/ai'
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

export default function Ready() {
  const [setup, setSetup] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const storedSetup = sessionStorage.getItem('interviewSetup')
    if (!storedSetup) {
      navigate('/setup')
      return
    }

    const parsedSetup = JSON.parse(storedSetup)
    setSetup(parsedSetup)

    // Generate scenario
    generateScenario(
      parsedSetup.roleType,
      parsedSetup.roleName,
      parsedSetup.interviewType,
      parsedSetup.interviewTypeName,
      parsedSetup.companyName
    ).then((s) => {
      setScenario(s)
      setLoading(false)
    })
  }, [navigate])

  const handleStart = () => {
    // Store scenario for interview page
    sessionStorage.setItem('interviewScenario', JSON.stringify(scenario))
    navigate('/interview')
  }

  if (loading || !setup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-violet-400 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-2 bg-violet-400 rounded-full animate-pulse opacity-30" />
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <p className="text-gray-600">Generating your scenario...</p>
        </div>
      </div>
    )
  }

  const emoji = INTERVIEW_EMOJIS[setup.interviewType] || '🎯'

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
      <FloatingBlob className="absolute -top-20 right-0 w-80 h-80 opacity-20" color="#DDD6FE" />
      <FloatingBlob className="absolute -bottom-20 -left-20 w-60 h-60 opacity-20" color="#C4B5FD" />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        <Link to="/setup" className="inline-flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-700 transition-colors">
          <span>←</span> Change setup
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{emoji}</div>
          <h1 className="text-2xl font-bold text-gray-900">{setup.interviewTypeName}</h1>
          {setup.companyName && (
            <p className="text-violet-600 mt-1 font-medium">@ {setup.companyName}</p>
          )}
        </div>

        {/* Scenario Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-purple-100/50 mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-4">SCENARIO BRIEF</h2>

          {/* Person */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center text-xl text-white shadow-lg">
              👤
            </div>
            <div>
              <div className="font-semibold text-gray-900">{scenario.personName}</div>
              <div className="text-sm text-gray-600">{scenario.personRole}</div>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-4">
            <div className="bg-violet-50 rounded-xl p-4">
              <div className="text-xs font-medium text-violet-600 mb-1">CONTEXT</div>
              <div className="text-gray-700 text-sm">{scenario.context}</div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <div className="text-xs font-medium text-amber-600 mb-1">YOUR GOAL</div>
              <div className="text-gray-700 text-sm">{scenario.objective}</div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <span className="text-lg">
                {scenario.personMood?.toLowerCase().includes('busy') ? '⏰' : 
                 scenario.personMood?.toLowerCase().includes('skeptic') ? '🤨' :
                 scenario.personMood?.toLowerCase().includes('frustrat') ? '😤' : '😐'}
              </span>
              <span>{scenario.personMood}</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStart}
            className="w-32 h-32 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-purple-300 hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="text-center text-white">
              <div className="text-4xl mb-1">🎤</div>
              <div className="text-xs font-semibold tracking-wide">START</div>
            </div>
          </button>
          <p className="text-gray-500 text-sm mt-4">5 minutes • Voice-first</p>
        </div>
      </div>
    </div>
  )
}
