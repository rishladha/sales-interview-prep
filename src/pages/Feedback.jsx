import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { generateFeedback, SCORING_FRAMEWORKS } from '../lib/ai'
import { checkBadges, calculateOverallLevel, getNextRecommendation } from '../lib/gamification'

export default function Feedback() {
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [newBadges, setNewBadges] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const loadFeedback = async () => {
      const setup = JSON.parse(sessionStorage.getItem('simulationSetup') || '{}')
      const scenario = JSON.parse(sessionStorage.getItem('simulationScenario') || '{}')
      const messages = JSON.parse(sessionStorage.getItem('simulationMessages') || '[]')
      const duration = parseInt(sessionStorage.getItem('simulationDuration') || '0')
      const researchScore = sessionStorage.getItem('researchScore')

    if (!setup.roleType || messages.length < 1) {
        navigate('/setup')
        return
      }

      try {
        const result = await generateFeedback(
          setup, 
          scenario, 
          messages, 
          duration,
          researchScore ? parseInt(researchScore) : null
        )
        setFeedback(result)

      } catch (error) {
        console.error('Feedback error:', error)
        setFeedback({
          overall: 0,
          grade: 'F',
          passed: false,
          criteriaScores: [],
          keyMoments: [],
          topStrength: { skill: 'N/A', example: 'N/A', keepDoing: 'Try again' },
          topImprovement: { skill: 'N/A', issue: 'Error generating feedback', howToFix: 'Please try again', resource: 'N/A' },
          frameworkAnalysis: 'Could not analyze',
          nextChallenge: 'Try another simulation'
        })
      }

      setLoading(false)
    }

    loadFeedback()
  }, [user, navigate])

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'from-emerald-400 to-emerald-600',
      'B': 'from-blue-400 to-blue-600',
      'C': 'from-amber-400 to-amber-600',
      'D': 'from-orange-400 to-orange-600',
      'F': 'from-red-400 to-red-600'
    }
    return colors[grade] || colors['F']
  }

  const getGradeBgColor = (grade) => {
    const colors = {
      'A': 'bg-emerald-500/20 border-emerald-500/30',
      'B': 'bg-blue-500/20 border-blue-500/30',
      'C': 'bg-amber-500/20 border-amber-500/30',
      'D': 'bg-orange-500/20 border-orange-500/30',
      'F': 'bg-red-500/20 border-red-500/30'
    }
    return colors[grade] || colors['F']
  }

  const getMomentColor = (type) => {
    const colors = {
      'excellent': 'border-emerald-500/50 bg-emerald-500/10',
      'good': 'border-blue-500/50 bg-blue-500/10',
      'needs_work': 'border-amber-500/50 bg-amber-500/10',
      'missed_opportunity': 'border-red-500/50 bg-red-500/10'
    }
    return colors[type] || colors['needs_work']
  }

  const getMomentIcon = (type) => {
    const icons = {
      'excellent': '🌟',
      'good': '✓',
      'needs_work': '⚠️',
      'missed_opportunity': '❌'
    }
    return icons[type] || '•'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white mx-auto mb-4" />
          <p className="text-slate-400">Analyzing your performance...</p>
          <p className="text-slate-500 text-sm mt-2">Using course frameworks to evaluate</p>
        </div>
      </div>
    )
  }

  const setup = JSON.parse(sessionStorage.getItem('simulationSetup') || '{}')
  const messages = JSON.parse(sessionStorage.getItem('simulationMessages') || '[]')
  const framework = SCORING_FRAMEWORKS[setup.simulationType]

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      {/* Header with Grade */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-400 text-sm">{framework?.name || 'Simulation'} Results</p>
            <p className="text-white font-medium">{setup.companyName}</p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Grade Display */}
        <div className={`rounded-2xl p-6 border ${getGradeBgColor(feedback.grade)}`}>
          <div className="flex items-center gap-6">
            {/* Grade Badge */}
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getGradeColor(feedback.grade)} flex items-center justify-center shadow-lg`}>
              <span className="text-5xl font-bold text-white">{feedback.grade}</span>
            </div>
            
            {/* Score and Status */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-white">{feedback.overall}</span>
                <span className="text-slate-400">/100</span>
              </div>
              <p className={`text-sm font-medium ${feedback.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {feedback.passed ? '✓ Passed' : '✗ Did not pass'}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Minimum passing score: 60
              </p>
            </div>
          </div>

          {/* Framework used */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">
              Evaluated using: <span className="text-slate-400">{framework?.framework || 'Standard framework'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1">
          {['overview', 'moments', 'transcript'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Criteria Scores */}
            <div className="bg-slate-800/50 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4">Performance by Criteria</h3>
              <div className="space-y-4">
                {feedback.criteriaScores?.map((criterion, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{criterion.name}</span>
                      <span className={`font-medium ${
                        criterion.score >= criterion.maxScore * 0.8 ? 'text-emerald-400' :
                        criterion.score >= criterion.maxScore * 0.6 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {criterion.score}/{criterion.maxScore}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          criterion.score >= criterion.maxScore * 0.8 ? 'bg-emerald-500' :
                          criterion.score >= criterion.maxScore * 0.6 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{criterion.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Strength */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💪</span>
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-1">Top Strength</h3>
                  <p className="text-white font-medium">{feedback.topStrength?.skill}</p>
                  {feedback.topStrength?.example && (
                    <p className="text-slate-400 text-sm mt-2 italic">"{feedback.topStrength.example}"</p>
                  )}
                  <p className="text-emerald-400/80 text-sm mt-2">{feedback.topStrength?.keepDoing}</p>
                </div>
              </div>
            </div>

            {/* Top Improvement */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className="text-amber-400 font-semibold mb-1">Area to Improve</h3>
                  <p className="text-white font-medium">{feedback.topImprovement?.skill}</p>
                  <p className="text-slate-400 text-sm mt-2">{feedback.topImprovement?.issue}</p>
                  <p className="text-amber-400/80 text-sm mt-2 font-medium">How to fix: {feedback.topImprovement?.howToFix}</p>
                  {feedback.topImprovement?.resource && (
                    <p className="text-slate-500 text-xs mt-2">📚 Review: {feedback.topImprovement.resource}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Framework Analysis */}
            <div className="bg-slate-800/50 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-2">Framework Analysis</h3>
              <p className="text-slate-400 text-sm">{feedback.frameworkAnalysis}</p>
            </div>

            {/* Next Challenge */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5">
              <h3 className="text-indigo-400 font-semibold mb-2">Next Challenge</h3>
              <p className="text-slate-300 text-sm">{feedback.nextChallenge}</p>
            </div>
          </div>
        )}

        {activeTab === 'moments' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">Key moments from your simulation, analyzed for learning opportunities.</p>
            
            {feedback.keyMoments?.length > 0 ? (
              feedback.keyMoments.map((moment, i) => (
                <div key={i} className={`rounded-xl p-4 border ${getMomentColor(moment.type)}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getMomentIcon(moment.type)}</span>
                    <div className="flex-1">
                      {moment.timestamp && (
                        <p className="text-slate-500 text-xs mb-1">{moment.timestamp}</p>
                      )}
                      <p className="text-white text-sm italic mb-2">"{moment.quote}"</p>
                      <p className="text-slate-400 text-sm">{moment.feedback}</p>
                      {moment.betterAlternative && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <p className="text-slate-500 text-xs mb-1">Better approach:</p>
                          <p className="text-emerald-400/80 text-sm">"{moment.betterAlternative}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-800/50 rounded-xl p-6 text-center">
                <p className="text-slate-400">No key moments identified.</p>
                <p className="text-slate-500 text-sm mt-2">This usually means there wasn't enough conversation to analyze.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="bg-slate-800/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Full Transcript</h3>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`${msg.role === 'user' ? 'pl-4 border-l-2 border-indigo-500' : 'pl-4 border-l-2 border-slate-600'}`}>
                  <p className="text-xs text-slate-500 mb-1">
                    {msg.role === 'user' ? 'You' : 'Prospect'}
                  </p>
                  <p className="text-slate-300 text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/setup')}
            className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
          >
            New Simulation
          </button>
          <button
            onClick={() => {
              // Retry same scenario
              navigate('/ready')
            }}
            className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
