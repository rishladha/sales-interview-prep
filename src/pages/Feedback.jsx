import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { generateFeedback } from '../lib/ai'
import { saveSimulation } from '../lib/supabase'
import { GradientOrb, ScoreRing, Badge } from '../components/Decorations'

export default function Feedback() {
  const [setup, setSetup] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const storedSetup = sessionStorage.getItem('simulationSetup')
    const storedScenario = sessionStorage.getItem('simulationScenario')
    const storedMessages = sessionStorage.getItem('simulationMessages')
    const storedDuration = sessionStorage.getItem('simulationDuration')
    const storedResearchScore = sessionStorage.getItem('researchScore')

    if (!storedSetup || !storedScenario || !storedMessages) {
      navigate('/setup')
      return
    }

    const parsedSetup = JSON.parse(storedSetup)
    const parsedScenario = JSON.parse(storedScenario)
    const parsedMessages = JSON.parse(storedMessages)
    const duration = parseInt(storedDuration || '0', 10)
    const researchScore = storedResearchScore ? JSON.parse(storedResearchScore) : null

    setSetup(parsedSetup)
    setScenario(parsedScenario)

    // Generate feedback
    generateFeedback(
      parsedSetup,
      parsedScenario,
      parsedMessages,
      researchScore?.overallScore,
      duration
    ).then(async (fb) => {
      setFeedback(fb)
      setLoading(false)

      // Save to database
      if (user) {
        try {
          await saveSimulation(user.id, {
            roleType: parsedSetup.roleType,
            simulationType: parsedSetup.simulationType,
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
    })
  }, [navigate, user])

  const handlePracticeAgain = () => {
    sessionStorage.removeItem('simulationScenario')
    sessionStorage.removeItem('simulationMessages')
    sessionStorage.removeItem('simulationDuration')
    sessionStorage.removeItem('researchData')
    sessionStorage.removeItem('researchScore')
    navigate('/research')
  }

  const handleNewSetup = () => {
    sessionStorage.clear()
    navigate('/setup')
  }

  if (loading || !setup || !scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Analyzing your performance...</h2>
          <p className="text-gray-500">Finding teachable moments</p>
        </div>
      </div>
    )
  }

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'from-emerald-400 to-emerald-600',
      'B': 'from-blue-400 to-blue-600',
      'C': 'from-amber-400 to-amber-600',
      'D': 'from-orange-400 to-orange-600',
      'F': 'from-red-400 to-red-600',
    }
    return colors[grade] || colors['C']
  }

  const getMomentColor = (type) => {
    const colors = {
      'excellent': 'bg-emerald-50 border-emerald-400 text-emerald-700',
      'good': 'bg-blue-50 border-blue-400 text-blue-700',
      'needs-work': 'bg-amber-50 border-amber-400 text-amber-700',
      'missed-opportunity': 'bg-red-50 border-red-400 text-red-700',
    }
    return colors[type] || colors['needs-work']
  }

  const getMomentIcon = (type) => {
    const icons = { 'excellent': '🌟', 'good': '✓', 'needs-work': '↑', 'missed-opportunity': '💡' }
    return icons[type] || '•'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden pb-8">
      <GradientOrb className="w-96 h-96 -top-48 -right-48" colors={['from-indigo-400', 'to-purple-500']} />
      <GradientOrb className="w-80 h-80 -bottom-40 -left-40" colors={['from-blue-400', 'to-cyan-500']} />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        {/* Header with Grade */}
        <div className="text-center mb-6">
          {/* Grade Badge */}
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${getGradeColor(feedback?.grade)} rounded-3xl shadow-lg mb-4`}>
            <span className="text-4xl font-bold text-white">{feedback?.grade || 'C'}</span>
          </div>

          {/* Headline */}
          <h1 className="text-xl font-bold text-gray-900 mb-2">{feedback?.headline || 'Good effort!'}</h1>
          
          {/* Meta */}
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
            <span>{setup.typeName}</span>
            <span>•</span>
            <span>{Math.round((feedback?.duration || 0) / 60)}m</span>
            {saved && (
              <>
                <span>•</span>
                <span className="text-emerald-500">✓ Saved</span>
              </>
            )}
          </div>
        </div>

        {/* XP & Badges */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow">
              +{feedback?.xpEarned || 50}
            </div>
            <div>
              <p className="font-semibold text-gray-800">XP Earned</p>
              <p className="text-xs text-gray-500">Keep practicing!</p>
            </div>
          </div>
          {feedback?.badges?.length > 0 && (
            <div className="flex gap-1">
              {feedback.badges.slice(0, 2).map((badge, i) => (
                <Badge key={i} type={i === 0 ? 'gold' : 'silver'}>{badge}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['overview', 'moments', 'transcript'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white/60 text-gray-600 hover:bg-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Score Ring */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 flex items-center gap-6">
              <ScoreRing score={feedback?.overallScore || 0} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">Dimension Scores</h3>
                <div className="space-y-2">
                  {feedback?.dimensionScores?.slice(0, 4).map((dim, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="text-gray-600">{dim.emoji} {dim.name}</span>
                        <span className={`font-semibold ${dim.score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {dim.score}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${dim.score >= 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Strength */}
            {feedback?.topStrength && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💪</div>
                  <div>
                    <h3 className="font-semibold text-emerald-800">{feedback.topStrength.title}</h3>
                    <p className="text-sm text-emerald-700 mt-1">{feedback.topStrength.description}</p>
                    <p className="text-xs text-emerald-600 mt-2 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                      Keep doing: {feedback.topStrength.keepDoing}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Improvement */}
            {feedback?.topImprovement && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="font-semibold text-amber-800">{feedback.topImprovement.title}</h3>
                    <p className="text-sm text-amber-700 mt-1">{feedback.topImprovement.description}</p>
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg">
                        <strong>Action:</strong> {feedback.topImprovement.actionItem}
                      </p>
                      <p className="text-xs text-amber-600">
                        📚 Review: {feedback.topImprovement.resource}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Challenge */}
            {feedback?.nextChallenge && (
              <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-indigo-700">
                  <strong>Next challenge:</strong> {feedback.nextChallenge}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'moments' && (
          <div className="space-y-3 animate-fadeIn">
            <p className="text-sm text-gray-500 mb-4">Key moments from your simulation:</p>
            
            {feedback?.keyMoments?.length > 0 ? (
              feedback.keyMoments.map((moment, i) => (
                <div key={i} className={`rounded-2xl p-4 border-l-4 ${getMomentColor(moment.type)}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <span>{getMomentIcon(moment.type)}</span>
                    <span className="text-xs font-medium uppercase">{moment.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium mb-2">"{moment.quote}"</p>
                  <p className="text-sm opacity-80">{moment.feedback}</p>
                  {moment.betterAlternative && (
                    <div className="mt-2 text-xs bg-white/50 rounded-lg p-2">
                      <strong>Try instead:</strong> {moment.betterAlternative}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No specific moments captured.</p>
                <p className="text-sm mt-1">Try having a longer conversation next time.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 animate-fadeIn">
            <h3 className="font-semibold text-gray-800 mb-4">Full Transcript</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {feedback?.transcript?.split('\n\n').filter(l => l.trim()).map((line, i) => {
                const isUser = line.startsWith('Student:')
                return (
                  <div key={i} className={`text-sm ${isUser ? 'text-indigo-700' : 'text-gray-600'}`}>
                    {line}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleNewSetup}
            className="flex-1 py-4 bg-white text-gray-700 font-medium rounded-xl shadow-sm hover:shadow transition-all"
          >
            New Scenario
          </button>
          <button
            onClick={handlePracticeAgain}
            className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
          >
            Practice Again
          </button>
        </div>

        <Link to="/" className="block text-center text-gray-400 mt-4 hover:text-gray-600 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
