import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getClassStats } from '../lib/supabase'
import { GradientOrb } from '../components/Decorations'

const SIMULATION_NAMES = {
  cold_call: 'Cold Call', discovery_basic: 'Discovery', discovery: 'Discovery',
  objection: 'Objections', negotiation: 'Negotiation', csm_renewal: 'Renewal',
  csm_escalation: 'Escalation', qbr: 'QBR', hiring: 'Interview',
  multi_stakeholder: 'Multi-Stake', team_scenario: 'Team',
}

export default function CoachDashboard() {
  const { user } = useAuth()
  const [classStats, setClassStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')

  useEffect(() => {
    getClassStats().then((stats) => {
      setClassStats(stats)
      setLoading(false)
    })
  }, [])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  const getSortedStudents = () => {
    if (!classStats?.students) return []
    
    let students = [...classStats.students]
    
    // Filter
    if (filterBy === 'active') {
      students = students.filter(s => s.totalSessions > 0)
    } else if (filterBy === 'inactive') {
      students = students.filter(s => s.totalSessions === 0)
    } else if (filterBy === 'struggling') {
      students = students.filter(s => s.avgScore > 0 && s.avgScore < 60)
    }
    
    // Sort
    students.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'score') return (b.avgScore || 0) - (a.avgScore || 0)
      if (sortBy === 'sessions') return b.totalSessions - a.totalSessions
      if (sortBy === 'recent') return new Date(b.lastActive) - new Date(a.lastActive)
      return 0
    })
    
    return students
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-200 border-t-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden pb-8">
      <GradientOrb className="w-96 h-96 -top-48 -right-48" colors={['from-amber-400', 'to-orange-500']} />
      <GradientOrb className="w-80 h-80 -bottom-40 -left-40" colors={['from-rose-400', 'to-pink-500']} />

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="text-amber-600 text-sm hover:underline mb-1 inline-block">← Back to app</Link>
            <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-medium text-gray-800">{user?.email}</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{classStats?.totalStudents || 0}</div>
            <div className="text-sm text-gray-500">Total Students</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-emerald-500">{classStats?.activeStudents || 0}</div>
            <div className="text-sm text-gray-500">Active (practiced)</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-indigo-500">{classStats?.totalSimulations || 0}</div>
            <div className="text-sm text-gray-500">Total Simulations</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-amber-500">{classStats?.avgClassScore || 0}</div>
            <div className="text-sm text-gray-500">Class Average</div>
          </div>
        </div>

        {/* Common Weak Areas */}
        {classStats?.commonWeakAreas?.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-8 border border-amber-200">
            <h2 className="font-semibold text-amber-800 mb-3">🎯 Common Weak Areas Across Class</h2>
            <div className="flex flex-wrap gap-2">
              {classStats.commonWeakAreas.map((area, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  {area}
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-3">Consider covering these topics in your next session</p>
          </div>
        )}

        {/* Simulation Type Distribution */}
        {classStats?.typeDistribution && Object.keys(classStats.typeDistribution).length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-8">
            <h2 className="font-semibold text-gray-800 mb-4">📊 Simulation Types Practiced</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(classStats.typeDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([type, count]) => (
                  <div key={type} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-gray-800">{count}</div>
                    <div className="text-xs text-gray-500">{SIMULATION_NAMES[type] || type}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Student List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="font-semibold text-gray-800">👥 Students</h2>
            
            <div className="flex gap-2 flex-wrap">
              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 border-0 focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">All Students</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive</option>
                <option value="struggling">Struggling (&lt;60)</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 border-0 focus:ring-2 focus:ring-amber-400"
              >
                <option value="name">Sort: Name</option>
                <option value="score">Sort: Score</option>
                <option value="sessions">Sort: Sessions</option>
                <option value="recent">Sort: Recent Activity</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium text-center">Sessions</th>
                  <th className="pb-3 font-medium text-center">Avg Score</th>
                  <th className="pb-3 font-medium text-center">Trend</th>
                  <th className="pb-3 font-medium">Weak Areas</th>
                  <th className="pb-3 font-medium text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getSortedStudents().map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
                  >
                    <td className="py-3">
                      <div className="font-medium text-gray-800">{student.name}</div>
                      <div className="text-xs text-gray-400">{student.email}</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-semibold ${student.totalSessions > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                        {student.totalSessions}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {student.avgScore > 0 ? (
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-semibold text-white ${
                          student.avgScore >= 70 ? 'bg-emerald-400' :
                          student.avgScore >= 50 ? 'bg-amber-400' : 'bg-red-400'
                        }`}>
                          {student.avgScore}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {student.trend !== 0 ? (
                        <span className={`font-medium ${student.trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {student.trend > 0 ? '↑' : '↓'} {Math.abs(student.trend)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      {student.weakAreas?.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {student.weakAreas.map((area, i) => (
                            <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                              {area}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-sm text-gray-500">
                      {formatDate(student.lastActive)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {getSortedStudents().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students match the current filter
            </div>
          )}
        </div>

        {/* Student Detail Drawer */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50" onClick={() => setSelectedStudent(null)}>
            <div 
              className="bg-white rounded-t-3xl w-full max-w-lg max-h-[70vh] overflow-y-auto p-6 animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">{selectedStudent.totalSessions}</div>
                  <div className="text-xs text-gray-500">Sessions</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${
                    selectedStudent.avgScore >= 70 ? 'text-emerald-500' :
                    selectedStudent.avgScore >= 50 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {selectedStudent.avgScore || '—'}
                  </div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${
                    selectedStudent.trend > 0 ? 'text-emerald-500' : 
                    selectedStudent.trend < 0 ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {selectedStudent.trend > 0 ? '+' : ''}{selectedStudent.trend || '—'}
                  </div>
                  <div className="text-xs text-gray-500">Trend</div>
                </div>
              </div>

              {selectedStudent.weakAreas?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Areas</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedStudent.weakAreas.map((area, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.simulations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Simulations</h4>
                  <div className="space-y-2">
                    {selectedStudent.simulations.map((sim, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                          sim.overall_score >= 70 ? 'bg-emerald-400' :
                          sim.overall_score >= 50 ? 'bg-amber-400' : 'bg-red-400'
                        }`}>
                          {sim.overall_score || '—'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            {SIMULATION_NAMES[sim.interview_type] || sim.interview_type}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{formatDate(sim.created_at)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
