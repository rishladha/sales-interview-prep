import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserStats, getRecentSimulations, getRecentScores } from '../lib/supabase'
import { GradientOrb, XPBar } from '../components/Decorations'

const SIMULATION_NAMES = {
  cold_call: 'Cold Call', discovery_basic: 'Discovery', discovery: 'Discovery',
  objection: 'Objections', negotiation: 'Negotiation', csm_renewal: 'Renewal',
  csm_escalation: 'Escalation', qbr: 'QBR', hiring: 'Interview',
  multi_stakeholder: 'Multi-Stake', team_scenario: 'Team',
}

export default function Progress() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentSims, setRecentSims] = useState([])
  const [recentScores, setRecentScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    Promise.all([
      getUserStats(user.id),
      getRecentSimulations(user.id, 10),
      getRecentScores(user.id, 12),
    ]).then(([statsData, sims, scores]) => {
      setStats(statsData)
      setRecentSims(sims || [])
      setRecentScores(scores || [])
      setLoading(false)
    })
  }, [user])

  const improvement = stats?.avg_score_this_month && stats?.avg_score_last_month
    ? stats.avg_score_this_month - stats.avg_score_last_month
    : 0

  // Calculate level
  const totalXP = (stats?.total_interviews || 0) * 75
  const level = Math.floor(totalXP / 500) + 1
  const xpInLevel = totalXP % 500

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  // Find weak areas from dimension scores
  const getWeakAreas = () => {
    if (recentSims.length < 2) return []
    
    const dimensionScores = {}
    recentSims.forEach(sim => {
      if (sim.dimension_scores) {
        sim.dimension_scores.forEach(d => {
          if (!dimensionScores[d.name]) {
            dimensionScores[d.name] = { total: 0, count: 0 }
          }
          dimensionScores[d.name].total += d.score
          dimensionScores[d.name].count++
        })
      }
    })

    return Object.entries(dimensionScores)
      .map(([name, data]) => ({ name, avg: Math.round(data.total / data.count) }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3)
  }

  const weakAreas = getWeakAreas()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  const hasData = stats?.total_interviews > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden pb-8">
      <GradientOrb className="w-96 h-96 -top-48 -right-48" colors={['from-emerald-400', 'to-teal-500']} />
      <GradientOrb className="w-80 h-80 -bottom-40 -left-40" colors={['from-indigo-400', 'to-purple-500']} />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 mb-6 hover:text-gray-600 transition-colors">
          <span>←</span> Back
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h1>

        {!hasData ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No simulations yet</h2>
            <p className="text-gray-500 mb-6">Complete your first simulation to see your progress here.</p>
            <Link
              to="/setup"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
            >
              Start Practice
            </Link>
          </div>
        ) : (
          <>
            {/* Level Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {level}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">Level {level}</h2>
                  <p className="text-sm text-gray-500">{totalXP} total XP</p>
                </div>
              </div>
              <XPBar current={xpInLevel} max={500} level={level} />
            </div>

            {/* Main Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-4xl font-bold text-gray-900">{stats?.avg_score || 0}</div>
                  <div className="text-sm text-gray-500">Average Score</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold flex items-center justify-end gap-1 ${improvement >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {improvement > 0 ? '↑' : improvement < 0 ? '↓' : '→'}
                    <span>{Math.abs(improvement)}</span>
                  </div>
                  <div className="text-sm text-gray-500">vs last month</div>
                </div>
              </div>

              {/* Score Chart */}
              {recentScores.length > 0 && (
                <div>
                  <div className="h-20 flex items-end gap-1">
                    {recentScores.slice().reverse().map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-t transition-all ${
                            item.score >= 70 ? 'bg-emerald-400' :
                            item.score >= 50 ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ height: `${item.score}%` }}
                          title={`Score: ${item.score}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Oldest</span>
                    <span>Most recent</span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <div className="text-xl font-semibold text-gray-900">{stats?.total_interviews || 0}</div>
                <div className="text-xs text-gray-500">Total Simulations</div>
              </div>
            </div>

            {/* Focus Areas */}
            {weakAreas.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <span>🎯</span> Focus Areas
                </h3>
                <div className="space-y-3">
                  {weakAreas.map((area, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{area.name}</span>
                        <span className="text-amber-600 font-semibold">{area.avg}</span>
                      </div>
                      <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${area.avg}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-700 mt-3">Based on your recent simulations</p>
              </div>
            )}

            {/* Recent Sessions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {recentSims.map((session, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${
                      session.overall_score >= 75 ? 'bg-emerald-400' :
                      session.overall_score >= 55 ? 'bg-amber-400' : 'bg-red-400'
                    }`}>
                      {session.overall_score || '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {SIMULATION_NAMES[session.interview_type] || session.interview_type}
                      </div>
                      {session.company_name && (
                        <div className="text-sm text-gray-500 truncate">{session.company_name}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{formatDate(session.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
