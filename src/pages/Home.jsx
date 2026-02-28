import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserStats } from '../lib/supabase'
import { GradientOrb } from '../components/Decorations'

export default function Home() {
  const { user, signOut, isCoach } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (user) {
      getUserStats(user.id).then(setStats)
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  const displayStats = stats || {
    total_interviews: 0,
    avg_score: 0,
  }

  const improvement = displayStats.avg_score_this_month && displayStats.avg_score_last_month
    ? displayStats.avg_score_this_month - displayStats.avg_score_last_month
    : 0

  // Calculate level from total XP (mock for now)
  const totalXP = (displayStats.total_interviews || 0) * 75
  const level = Math.floor(totalXP / 500) + 1
  const xpInLevel = totalXP % 500

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <GradientOrb className="w-96 h-96 -top-48 -right-48" colors={['from-blue-400', 'to-indigo-500']} />
      <GradientOrb className="w-80 h-80 -bottom-40 -left-40" colors={['from-indigo-400', 'to-purple-500']} />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <p className="font-semibold text-gray-900">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isCoach && (
              <Link
                to="/coach"
                className="px-3 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors"
              >
                Coach View
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg shadow-indigo-200 mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Simulations</h1>
          <p className="text-gray-500">Practice real scenarios. Get actionable feedback.</p>
        </div>

        {/* Level Progress */}
        {displayStats.total_interviews > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {level}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Level {level}</span>
                  <span className="text-gray-400">{xpInLevel} / 500 XP</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: `${(xpInLevel / 500) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="space-y-4 mb-8">
          <Link
            to="/setup"
            className="block w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                🎬
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Start Simulation</h3>
                <p className="text-gray-400 text-sm">Practice a 5-minute sales scenario</p>
              </div>
              <div className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all text-xl">→</div>
            </div>
          </Link>

          <Link
            to="/progress"
            className="block w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                📈
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Your Progress</h3>
                <p className="text-gray-400 text-sm">Track improvement over time</p>
              </div>
              <div className="text-gray-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all text-xl">→</div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 flex justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{displayStats.total_interviews || 0}</div>
            <div className="text-xs text-gray-400">Simulations</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className="text-2xl font-bold text-gray-900">{displayStats.avg_score || '—'}</div>
            <div className="text-xs text-gray-400">Avg Score</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {improvement > 0 ? '+' : ''}{improvement || '—'}
            </div>
            <div className="text-xs text-gray-400">This Month</div>
          </div>
        </div>

        {/* Quick tip for new users */}
        {displayStats.total_interviews === 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-gray-800">Ready to start?</p>
                <p className="text-sm text-gray-600 mt-1">
                  Begin with a Cold Call simulation — it's a great way to warm up your skills!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
