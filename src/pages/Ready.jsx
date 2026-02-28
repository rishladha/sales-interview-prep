import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { generateScenario } from '../lib/ai'
import { GradientOrb } from '../components/Decorations'

export default function Ready() {
  const [setup, setSetup] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const storedSetup = sessionStorage.getItem('simulationSetup')
    if (!storedSetup) {
      navigate('/setup')
      return
    }

    const parsedSetup = JSON.parse(storedSetup)
    setSetup(parsedSetup)

    // Generate scenario
    generateScenario(parsedSetup).then((s) => {
      setScenario(s)
      setLoading(false)
    })
  }, [navigate])

  const handleStart = () => {
    sessionStorage.setItem('simulationScenario', JSON.stringify(scenario))
    navigate('/simulation')
  }

  if (loading || !setup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎬</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Preparing your scenario...</h2>
          <p className="text-gray-500">Setting up the simulation</p>
        </div>
      </div>
    )
  }

  const SIMULATION_EMOJIS = {
    cold_call: '📞', discovery_basic: '🔍', discovery: '🔍', objection: '🛡️',
    negotiation: '🤝', csm_renewal: '🔄', csm_escalation: '🚨', qbr: '📊',
    hiring: '💼', multi_stakeholder: '👥', team_scenario: '👔',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <GradientOrb className="w-96 h-96 -top-48 right-0" colors={['from-purple-400', 'to-pink-400']} />
      <GradientOrb className="w-80 h-80 -bottom-40 -left-40" colors={['from-indigo-400', 'to-purple-500']} />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        <Link to="/research" className="inline-flex items-center gap-2 text-gray-400 mb-6 hover:text-gray-600 transition-colors">
          <span>←</span> Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{SIMULATION_EMOJIS[setup.simulationType] || '🎯'}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{setup.typeName}</h1>
          <p className="text-indigo-600 font-medium">{setup.companyName}</p>
        </div>

        {/* Scenario Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-purple-100/50 mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Scenario Brief</h2>

          {/* Person */}
          <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg">
              👤
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-lg">{scenario.personName}</div>
              <div className="text-gray-500">{scenario.personRole}</div>
              <div className="text-sm text-gray-400 mt-1">{scenario.personMood}</div>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-indigo-600 uppercase mb-1">Company Situation</div>
              <div className="text-gray-700 text-sm">{scenario.companyContext}</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-purple-600 uppercase mb-1">Your Objective</div>
              <div className="text-gray-700 text-sm">{scenario.objective}</div>
            </div>

            {/* Success Criteria */}
            {scenario.successCriteria && (
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-emerald-600 uppercase mb-2">What Good Looks Like</div>
                <ul className="space-y-1">
                  {scenario.successCriteria.map((c, i) => (
                    <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Product reminder */}
        <div className="bg-white/60 rounded-xl p-4 mb-8 text-center">
          <p className="text-sm text-gray-500">
            You're selling <span className="font-medium text-gray-700">{setup.productContext?.productName || 'your solution'}</span>
          </p>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStart}
            className="w-36 h-36 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-purple-300 hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="text-center text-white">
              <div className="text-5xl mb-1">🎤</div>
              <div className="text-sm font-semibold tracking-wide">START</div>
            </div>
          </button>
          <p className="text-gray-400 text-sm mt-4">5 minutes • Tap to speak</p>
        </div>
      </div>
    </div>
  )
}
