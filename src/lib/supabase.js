import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const coachEmails = (import.meta.env.VITE_COACH_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Auth features will not work.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// Check if user is a coach
export function isCoach(email) {
  if (!email) return false
  return coachEmails.includes(email.toLowerCase())
}

// Save simulation results
export async function saveSimulation(userId, data) {
  const { error } = await supabase
    .from('interviews')
    .insert({
      user_id: userId,
      role_type: data.roleType,
      interview_type: data.simulationType,
      company_name: data.companyName,
      scenario_person_name: data.scenario?.personName,
      scenario_person_role: data.scenario?.personRole,
      scenario_context: data.scenario?.companyContext,
      overall_score: data.feedback?.overallScore,
      dimension_scores: data.feedback?.dimensionScores,
      strengths: data.feedback?.topStrength ? [data.feedback.topStrength] : [],
      improvements: data.feedback?.topImprovement ? [data.feedback.topImprovement] : [],
      annotated_moments: data.feedback?.keyMoments,
      summary: data.feedback?.headline,
      transcript: data.feedback?.transcript,
      duration_seconds: data.duration,
    })

  if (error) {
    console.error('Error saving simulation:', error)
    throw error
  }
}

// Get user stats
export async function getUserStats(userId) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching stats:', error)
  }

  return data
}

// Get recent simulations for a user
export async function getRecentSimulations(userId, limit = 10) {
  const { data, error } = await supabase
    .from('interviews')
    .select('id, interview_type, company_name, overall_score, created_at, dimension_scores, summary')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching simulations:', error)
    return []
  }

  return data || []
}

// Get user's recent scores for chart
export async function getRecentScores(userId, limit = 12) {
  const { data, error } = await supabase
    .rpc('get_recent_scores', { p_user_id: userId, p_limit: limit })

  if (error) {
    console.error('Error fetching scores:', error)
    return []
  }

  return data || []
}

// ============================================
// COACH DASHBOARD FUNCTIONS
// ============================================

// Get all students with their stats
export async function getAllStudentStats() {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')

  if (profileError) {
    console.error('Error fetching profiles:', profileError)
    return []
  }

  // Get simulation data for each student
  const studentsWithStats = await Promise.all(
    profiles.map(async (profile) => {
      const { data: simulations } = await supabase
        .from('interviews')
        .select('overall_score, interview_type, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      const totalSessions = simulations?.length || 0
      const avgScore = totalSessions > 0
        ? Math.round(simulations.reduce((sum, s) => sum + (s.overall_score || 0), 0) / totalSessions)
        : 0
      
      const lastActive = simulations?.[0]?.created_at || profile.created_at

      // Calculate trend (last 5 vs previous 5)
      let trend = 0
      if (totalSessions >= 10) {
        const recent5 = simulations.slice(0, 5).reduce((sum, s) => sum + (s.overall_score || 0), 0) / 5
        const prev5 = simulations.slice(5, 10).reduce((sum, s) => sum + (s.overall_score || 0), 0) / 5
        trend = Math.round(recent5 - prev5)
      }

      // Find weak areas
      const dimensionScores = {}
      simulations?.forEach(sim => {
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

      const weakAreas = Object.entries(dimensionScores)
        .map(([name, data]) => ({ name, avg: Math.round(data.total / data.count) }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 2)
        .map(a => a.name)

      return {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
        totalSessions,
        avgScore,
        trend,
        lastActive,
        weakAreas,
        simulations: simulations?.slice(0, 5) || []
      }
    })
  )

  return studentsWithStats.filter(s => !isCoach(s.email))
}

// Get aggregated class stats
export async function getClassStats() {
  const students = await getAllStudentStats()
  
  const activeStudents = students.filter(s => s.totalSessions > 0)
  const totalSimulations = students.reduce((sum, s) => sum + s.totalSessions, 0)
  const avgClassScore = activeStudents.length > 0
    ? Math.round(activeStudents.reduce((sum, s) => sum + s.avgScore, 0) / activeStudents.length)
    : 0

  // Find common weak areas across class
  const allWeakAreas = students.flatMap(s => s.weakAreas)
  const weakAreaCounts = {}
  allWeakAreas.forEach(area => {
    weakAreaCounts[area] = (weakAreaCounts[area] || 0) + 1
  })
  const commonWeakAreas = Object.entries(weakAreaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area)

  // Simulation type distribution
  const typeDistribution = {}
  students.forEach(s => {
    s.simulations?.forEach(sim => {
      typeDistribution[sim.interview_type] = (typeDistribution[sim.interview_type] || 0) + 1
    })
  })

  return {
    totalStudents: students.length,
    activeStudents: activeStudents.length,
    totalSimulations,
    avgClassScore,
    commonWeakAreas,
    typeDistribution,
    students
  }
}

// Get detailed student data for coach
export async function getStudentDetail(studentId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single()

  const { data: simulations } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', studentId)
    .order('created_at', { ascending: false })

  return {
    profile,
    simulations: simulations || []
  }
}
