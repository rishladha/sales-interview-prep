import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Auth features will not work.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// Helper to save interview results
export async function saveInterview(userId, data) {
  const { error } = await supabase
    .from('interviews')
    .insert({
      user_id: userId,
      role_type: data.roleType,
      interview_type: data.interviewType,
      company_name: data.companyName,
      scenario_person_name: data.scenario?.personName,
      scenario_person_role: data.scenario?.personRole,
      scenario_context: data.scenario?.context,
      overall_score: data.feedback?.overallScore,
      dimension_scores: data.feedback?.dimensionScores,
      strengths: data.feedback?.strengths,
      improvements: data.feedback?.improvements,
      annotated_moments: data.feedback?.annotatedMoments,
      summary: data.feedback?.summary,
      transcript: data.feedback?.transcript,
      duration_seconds: data.duration,
    })

  if (error) {
    console.error('Error saving interview:', error)
    throw error
  }
}

// Helper to get user stats
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

// Helper to get recent interviews
export async function getRecentInterviews(userId, limit = 10) {
  const { data, error } = await supabase
    .from('interviews')
    .select('id, interview_type, company_name, overall_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching interviews:', error)
    return []
  }

  return data || []
}

// Helper to get recent scores for chart
export async function getRecentScores(userId, limit = 12) {
  const { data, error } = await supabase
    .rpc('get_recent_scores', { p_user_id: userId, p_limit: limit })

  if (error) {
    console.error('Error fetching scores:', error)
    return []
  }

  return data || []
}
