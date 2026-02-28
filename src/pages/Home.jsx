import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserStats } from '../lib/supabase'
import { FloatingBlob, FloatingDots } from '../components/Decorations'

export default function Home() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (user) {
      getUserStats(user.id).then(setStats)
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  // Default stats if none exist
  const displayStats = stats || {
    total_interviews: 0,
    avg_score: 0,
    improvement: 0,
  }

  const improvement = displayStats.avg_score_this_month && displayStats.avg_score_last_month
    ? displayStats.avg_score_this_month - displayStats.avg_score_last_month
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Decorative elements */}
      <FloatingBlob className="absolute -top-20 -right-20 w-96 h-96 opacity-30" color="#FED7AA" />
      <FloatingBlob className="absolute -bottom-32 -left-32 w-80 h-80 opacity-20" color="#FBBF24" />
      <FloatingDots />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        {/* Header with sign out */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-500 text-sm">Welcome back,</p>
            <p className="font-semibold text-gray-900">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-200 mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Prep</h1>
          <p className="text-gray-600">Practice. Get feedback. Improve.</p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4 mb-8">
          <Link
            to="/setup"
            className="block w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-orange-100/50 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                🎤
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Start Practice</h3>
                <p className="text-gray-500 text-sm">5-minute voice interview</p>
              </div>
              <div className="text-gray-300 group-hover:text-gray-400 transition-colors text-xl">→</div>
            </div>
          </Link>

          <Link
            to="/progress"
            className="block w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-orange-100/50 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                📈
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Your Progress</h3>
                <p className="text-gray-500 text-sm">Track improvement over time</p>
              </div>
              <div className="text-gray-300 group-hover:text-gray-400 transition-colors text-xl">→</div>
            </div>
          </Link>
        </div>

        {/* Stats preview */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 flex justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{displayStats.total_interviews || 0}</div>
            <div className="text-xs text-gray-500">Sessions</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className="text-2xl font-bold text-gray-900">{displayStats.avg_score || '—'}</div>
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {improvement > 0 ? '+' : ''}{improvement || '—'}
            </div>
            <div className="text-xs text-gray-500">This Month</div>
          </div>
        </div>

        {/* Quick tip */}
        {displayStats.total_interviews === 0 && (
          <div className="mt-8 bg-violet-50/80 backdrop-blur-sm rounded-2xl p-5 text-center">
            <p className="text-violet-800 text-sm">
              <span className="font-medium">💡 Tip:</span> Start with a Cold Call practice to warm up!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
