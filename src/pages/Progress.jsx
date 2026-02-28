import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserStats, getRecentInterviews, getRecentScores } from '../lib/supabase'
import { FloatingBlob } from '../components/Decorations'

const INTERVIEW_NAMES = {
  cold_call: 'Cold Call',
  discovery_basic: 'Discovery',
  discovery: 'Discovery',
  objection: 'Objections',
  negotiation: 'Negotiation',
  csm_renewal: 'Renewal',
  csm_escalation: 'Escalation',
  qbr: 'QBR',
  hiring: 'Interview',
  multi_stakeholder: 'Multi-Stake',
  team_scenario: 'Team',
}

export default function Progress() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentInterviews, setRecentInterviews] = useState([])
  const [recentScores, setRecentScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    Promise.all([
      getUserStats(user.id),
      getRecentInterviews(user.id, 10),
      getRecentScores(user.id, 12),
    ]).then(([statsData, interviews, scores]) => {
      setStats(statsData)
      setRecentInterviews(interviews || [])
      setRecentScores(scores || [])
      setLoading(false)
    })
  }, [user])

  const improvement =
    stats?.avg_score_this_month && stats?.avg_score_last_month
      ? stats.avg_score_this_month - stats.avg_score_last_month
      : 0

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  // Calculate focus areas from recent interviews
  const getFocusAreas = () => {
    if (recentInterviews.length < 2) return []

    const scoresByType = {}
    recentInterviews.forEach((interview) => {
      const type = interview.interview_type
      if (!scoresByType[type]) {
        scoresByType[type] = { total: 0, count: 0 }
      }
      if (interview.overall_score) {
        scoresByType[type].total += interview.overall_score
        scoresByType[type].count++
      }
    })

    const averages = Object.entries(scoresByType)
      .filter(([_, v]) => v.count > 0)
      .map(([type, v]) => ({
        type,
        name: INTERVIEW_NAMES[type] || type,
        avg: Math.round(v.total / v.count),
      }))
      .sort((a, b) => a.avg - b.avg)

    return averages.slice(0, 2)
  }

  const focusAreas = getFocusAreas()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  const hasData = stats?.total_interviews > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden pb-12">
      <FloatingBlob className="absolute -top-20 -right-20 w-96 h-96 opacity-20" color="#A7F3D0" />
      <FloatingBlob className="absolute -bottom-20 -left-20 w-60 h-60 opacity-20" color="#C4B5FD" />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-700 transition-colors">
          <span>←</span> Back
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h1>

        {!hasData ? (
          // Empty state
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No practice sessions yet</h2>
            <p className="text-gray-600 mb-6">Complete your first interview to see your progress here.</p>
            <Link
              to="/setup"
              className="inline-block px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
            >
              Start Practice
            </Link>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-4xl font-bold text-gray-900">{stats?.avg_score || 0}</div>
                  <div className="text-sm text-gray-500">Average Score</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {improvement > 0 ? '↑' : improvement < 0 ? '↓' : '→'} {Math.abs(improvement) || 0}
                  </div>
                  <div className="text-sm text-gray-500">vs last month</div>
                </div>
              </div>

              {/* Score Chart */}
              {recentScores.length > 0 && (
                <div>
                  <div className="h-24 flex items-end gap-1">
                    {recentScores
                      .slice()
                      .reverse()
                      .map((item, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-violet-400 to-purple-400 rounded-t-sm transition-all hover:from-violet-500 hover:to-purple-500"
                            style={{ height: `${item.score || 0}%` }}
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

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around text-center">
                <div>
                  <div className="text-xl font-semibold text-gray-900">{stats?.total_interviews || 0}</div>
                  <div className="text-xs text-gray-500">Total Sessions</div>
                </div>
              </div>
            </div>

            {/* Focus Areas */}
            {focusAreas.length > 0 && (
              <div className="bg-amber-50/80 backdrop-blur-sm rounded-3xl p-6 mb-6">
                <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <span>🎯</span> Focus Areas
                </h3>
                <div className="space-y-3">
                  {focusAreas.map((area, i) => (
                    <div key={i} className="bg-white/60 rounded-2xl p-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-800">{area.name}</span>
                        <span className="text-amber-600 font-semibold">{area.avg}</span>
                      </div>
                      <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${area.avg}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-700 mt-3">Based on your recent performance</p>
              </div>
            )}

            {/* Recent Sessions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {recentInterviews.map((session, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${
                        session.overall_score >= 75
                          ? 'bg-emerald-400'
                          : session.overall_score >= 55
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    >
                      {session.overall_score || '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {INTERVIEW_NAMES[session.interview_type] || session.interview_type}
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
