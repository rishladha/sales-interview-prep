// Gamification System - Skill-Based Progression
// Tied to Mesa School curriculum learning objectives

// Skill trees by role - based on course materials
export const SKILL_TREES = {
  SDR: {
    name: 'Sales Development',
    skills: [
      {
        id: 'prospecting',
        name: 'Prospecting',
        description: 'Finding and qualifying potential customers',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Complete 1 cold call simulation with 50+ score' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on 3 cold call simulations' },
          { level: 3, name: 'Competent', requirement: 'Score 75+ on 5 cold call simulations' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on 3 consecutive simulations' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ average across 10 simulations' }
        ],
        relatedSimulations: ['cold-call']
      },
      {
        id: 'discovery_basic',
        name: 'Basic Discovery',
        description: 'Asking good questions to understand customer needs',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Complete 1 discovery simulation with 50+ score' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on 3 discovery simulations' },
          { level: 3, name: 'Competent', requirement: 'Score 75+ on 5 discovery simulations' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on Mom Test criteria' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ average on SPIN questions' }
        ],
        relatedSimulations: ['discovery']
      },
      {
        id: 'objection_handling',
        name: 'Objection Handling',
        description: 'Handling pushback professionally',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Handle 1 objection scenario with 50+ score' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on acknowledge step' },
          { level: 3, name: 'Competent', requirement: 'Score 75+ on explore step' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on reframe step' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ overall on objection simulations' }
        ],
        relatedSimulations: ['cold-call', 'objection-handling']
      }
    ]
  },
  AE: {
    name: 'Account Executive',
    skills: [
      {
        id: 'discovery_advanced',
        name: 'Advanced Discovery',
        description: 'SPIN selling and strategic questioning',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Score 50+ on Situation questions' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on Problem questions' },
          { level: 3, name: 'Competent', requirement: 'Score 75+ on Implication questions' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on Need-Payoff questions' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ overall on full SPIN cycle' }
        ],
        relatedSimulations: ['discovery']
      },
      {
        id: 'challenger',
        name: 'Challenger Selling',
        description: 'Teaching, tailoring, and taking control',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Complete 1 sales pitch simulation' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on teaching insight' },
          { level: 3, name: 'Competent', requirement: 'Score 75+ on tailoring message' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on taking control' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ average on all three dimensions' }
        ],
        relatedSimulations: ['discovery', 'objection-handling']
      },
      {
        id: 'negotiation',
        name: 'Commercial Negotiation',
        description: 'Value-based negotiation and closing',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Complete 1 negotiation simulation' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on value defense' },
          { level: 3, name: 'Competent', requirement: 'Score 75+ on trade-offs' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on concession strategy' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ and close favorable terms' }
        ],
        relatedSimulations: ['negotiation']
      }
    ]
  },
  CSM: {
    name: 'Customer Success',
    skills: [
      {
        id: 'value_realization',
        name: 'Value Realization',
        description: 'Demonstrating and communicating ROI',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Complete 1 QBR or renewal simulation' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on value recap' },
          { level: 3, name: 'Competent', requirement: 'Quantify ROI in simulation' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on forward-looking plan' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ on strategic alignment' }
        ],
        relatedSimulations: ['renewal', 'qbr']
      },
      {
        id: 'escalation_management',
        name: 'Escalation Management',
        description: 'De-escalating and resolving customer issues',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Complete 1 escalation simulation' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on empathy' },
          { level: 3, name: 'Competent', requirement: 'Score 75+ on action plan' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on ownership' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ and preserve relationship' }
        ],
        relatedSimulations: ['escalation']
      },
      {
        id: 'executive_presence',
        name: 'Executive Presence',
        description: 'Communicating at executive level',
        levels: [
          { level: 1, name: 'Novice', requirement: 'Complete 1 QBR simulation' },
          { level: 2, name: 'Developing', requirement: 'Score 65+ on structured communication' },
          { level: 3, name: 'Competent', requirement: 'Score 75+ on strategic language' },
          { level: 4, name: 'Proficient', requirement: 'Score 85+ on concise delivery' },
          { level: 5, name: 'Expert', requirement: 'Score 90+ on executive engagement' }
        ],
        relatedSimulations: ['qbr', 'renewal']
      }
    ]
  }
}

// Achievement badges - tied to specific accomplishments
export const BADGES = {
  // Participation badges
  'first-simulation': {
    id: 'first-simulation',
    name: 'First Steps',
    description: 'Completed your first simulation',
    icon: '🎯',
    requirement: { type: 'simulations_completed', count: 1 }
  },
  'dedicated-learner': {
    id: 'dedicated-learner',
    name: 'Dedicated Learner',
    description: 'Completed 10 simulations',
    icon: '📚',
    requirement: { type: 'simulations_completed', count: 10 }
  },
  'practice-makes-perfect': {
    id: 'practice-makes-perfect',
    name: 'Practice Makes Perfect',
    description: 'Completed 25 simulations',
    icon: '🏋️',
    requirement: { type: 'simulations_completed', count: 25 }
  },

  // Score-based badges
  'first-pass': {
    id: 'first-pass',
    name: 'First Pass',
    description: 'Scored 60+ on a simulation',
    icon: '✅',
    requirement: { type: 'score_achieved', score: 60 }
  },
  'solid-performer': {
    id: 'solid-performer',
    name: 'Solid Performer',
    description: 'Scored 75+ on a simulation',
    icon: '⭐',
    requirement: { type: 'score_achieved', score: 75 }
  },
  'excellence': {
    id: 'excellence',
    name: 'Excellence',
    description: 'Scored 90+ on a simulation',
    icon: '🌟',
    requirement: { type: 'score_achieved', score: 90 }
  },
  'perfect-score': {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Scored 95+ on a simulation',
    icon: '💯',
    requirement: { type: 'score_achieved', score: 95 }
  },

  // Consistency badges
  'consistent-performer': {
    id: 'consistent-performer',
    name: 'Consistent Performer',
    description: '5 passing scores in a row',
    icon: '📈',
    requirement: { type: 'consecutive_passes', count: 5 }
  },
  'streak-master': {
    id: 'streak-master',
    name: 'Streak Master',
    description: '10 passing scores in a row',
    icon: '🔥',
    requirement: { type: 'consecutive_passes', count: 10 }
  },

  // Framework mastery badges
  'mom-test-master': {
    id: 'mom-test-master',
    name: 'Mom Test Master',
    description: 'Scored 85+ on active listening in 3 discovery calls',
    icon: '👂',
    requirement: { type: 'criterion_mastery', criterion: 'active_listening', score: 85, count: 3 }
  },
  'spin-doctor': {
    id: 'spin-doctor',
    name: 'SPIN Doctor',
    description: 'Scored 80+ on all SPIN dimensions in one simulation',
    icon: '🔄',
    requirement: { type: 'all_criteria_above', score: 80, simulationType: 'discovery' }
  },
  'objection-slayer': {
    id: 'objection-slayer',
    name: 'Objection Slayer',
    description: 'Scored 85+ on objection handling 5 times',
    icon: '⚔️',
    requirement: { type: 'criterion_mastery', criterion: 'objection_handling', score: 85, count: 5 }
  },
  'closer': {
    id: 'closer',
    name: 'The Closer',
    description: 'Scored 90+ on next step/closing in 5 simulations',
    icon: '🤝',
    requirement: { type: 'criterion_mastery', criterion: 'next_step', score: 90, count: 5 }
  },

  // Role-specific badges
  'cold-call-warrior': {
    id: 'cold-call-warrior',
    name: 'Cold Call Warrior',
    description: 'Passed 10 cold call simulations',
    icon: '📞',
    requirement: { type: 'simulation_type_passes', simulationType: 'cold-call', count: 10 }
  },
  'discovery-expert': {
    id: 'discovery-expert',
    name: 'Discovery Expert',
    description: 'Passed 10 discovery simulations',
    icon: '🔍',
    requirement: { type: 'simulation_type_passes', simulationType: 'discovery', count: 10 }
  },
  'negotiation-ninja': {
    id: 'negotiation-ninja',
    name: 'Negotiation Ninja',
    description: 'Passed 5 negotiation simulations with 80+ average',
    icon: '🥷',
    requirement: { type: 'simulation_type_average', simulationType: 'negotiation', score: 80, count: 5 }
  },
  'csm-champion': {
    id: 'csm-champion',
    name: 'CSM Champion',
    description: 'Passed 10 CSM simulations (renewal, QBR, escalation)',
    icon: '🏆',
    requirement: { type: 'simulation_type_passes', simulationType: ['renewal', 'qbr', 'escalation'], count: 10 }
  },

  // Improvement badges
  'comeback-kid': {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Improved score by 20+ points on a retry',
    icon: '💪',
    requirement: { type: 'improvement', points: 20 }
  },
  'growth-mindset': {
    id: 'growth-mindset',
    name: 'Growth Mindset',
    description: 'Average score improved by 15+ over 10 simulations',
    icon: '🌱',
    requirement: { type: 'average_improvement', points: 15, simulations: 10 }
  }
}

// Calculate skill levels based on simulation history
export function calculateSkillLevels(userStats, role) {
  const roleSkills = SKILL_TREES[role]?.skills || SKILL_TREES['SDR'].skills
  
  return roleSkills.map(skill => {
    // Get relevant simulation history
    const relevantSessions = userStats.sessions?.filter(s => 
      skill.relatedSimulations.includes(s.simulationType)
    ) || []
    
    // Calculate current level based on scores
    const scores = relevantSessions.map(s => s.score)
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const passCount = scores.filter(s => s >= 60).length
    const highScoreCount = scores.filter(s => s >= 85).length
    
    // Determine level (simplified logic - in production, check specific requirements)
    let currentLevel = 0
    if (passCount >= 1 && avgScore >= 50) currentLevel = 1
    if (passCount >= 3 && avgScore >= 65) currentLevel = 2
    if (passCount >= 5 && avgScore >= 75) currentLevel = 3
    if (highScoreCount >= 3 && avgScore >= 85) currentLevel = 4
    if (highScoreCount >= 5 && avgScore >= 90) currentLevel = 5
    
    // Calculate progress to next level
    const nextLevel = currentLevel < 5 ? currentLevel + 1 : 5
    const nextRequirement = skill.levels[nextLevel - 1]
    
    return {
      ...skill,
      currentLevel,
      currentLevelName: skill.levels[currentLevel]?.name || 'Locked',
      nextLevel,
      nextRequirement: nextRequirement?.requirement || 'Maximum level reached',
      progress: calculateProgressToNextLevel(currentLevel, scores, avgScore),
      totalSessions: relevantSessions.length,
      averageScore: Math.round(avgScore)
    }
  })
}

function calculateProgressToNextLevel(currentLevel, scores, avgScore) {
  if (currentLevel >= 5) return 100
  
  // Simplified progress calculation
  const passCount = scores.filter(s => s >= 60).length
  const highScoreCount = scores.filter(s => s >= 85).length
  
  switch (currentLevel) {
    case 0: return Math.min(100, passCount > 0 && avgScore >= 50 ? 100 : avgScore * 2)
    case 1: return Math.min(100, (passCount / 3) * 50 + (avgScore >= 65 ? 50 : 0))
    case 2: return Math.min(100, (passCount / 5) * 50 + (avgScore >= 75 ? 50 : 0))
    case 3: return Math.min(100, (highScoreCount / 3) * 50 + (avgScore >= 85 ? 50 : 0))
    case 4: return Math.min(100, (highScoreCount / 5) * 50 + (avgScore >= 90 ? 50 : 0))
    default: return 0
  }
}

// Check which badges user has earned
export function checkBadges(userStats) {
  const earnedBadges = []
  
  for (const [id, badge] of Object.entries(BADGES)) {
    if (checkBadgeRequirement(badge.requirement, userStats)) {
      earnedBadges.push(badge)
    }
  }
  
  return earnedBadges
}

function checkBadgeRequirement(requirement, userStats) {
  const sessions = userStats.sessions || []
  
  switch (requirement.type) {
    case 'simulations_completed':
      return sessions.length >= requirement.count
    
    case 'score_achieved':
      return sessions.some(s => s.score >= requirement.score)
    
    case 'consecutive_passes':
      return getMaxConsecutivePasses(sessions) >= requirement.count
    
    case 'simulation_type_passes':
      const types = Array.isArray(requirement.simulationType) 
        ? requirement.simulationType 
        : [requirement.simulationType]
      const typePasses = sessions.filter(s => 
        types.includes(s.simulationType) && s.score >= 60
      ).length
      return typePasses >= requirement.count
    
    case 'criterion_mastery':
      const criterionHighScores = sessions.filter(s => 
        s.criteriaScores?.[requirement.criterion] >= requirement.score
      ).length
      return criterionHighScores >= requirement.count
    
    case 'improvement':
      return checkImprovement(sessions, requirement.points)
    
    default:
      return false
  }
}

function getMaxConsecutivePasses(sessions) {
  let max = 0
  let current = 0
  
  for (const session of sessions.sort((a, b) => new Date(a.date) - new Date(b.date))) {
    if (session.score >= 60) {
      current++
      max = Math.max(max, current)
    } else {
      current = 0
    }
  }
  
  return max
}

function checkImprovement(sessions, requiredPoints) {
  // Group by simulation type and check for improvements
  const byType = {}
  for (const session of sessions) {
    const key = `${session.simulationType}-${session.scenarioId || 'default'}`
    if (!byType[key]) byType[key] = []
    byType[key].push(session.score)
  }
  
  for (const scores of Object.values(byType)) {
    if (scores.length >= 2) {
      const improvement = Math.max(...scores.slice(1)) - scores[0]
      if (improvement >= requiredPoints) return true
    }
  }
  
  return false
}

// Get recommended next simulation based on skill gaps
export function getNextRecommendation(userStats, role) {
  const skills = calculateSkillLevels(userStats, role)
  
  // Find lowest skill level
  const lowestSkill = skills.reduce((min, skill) => 
    skill.currentLevel < min.currentLevel ? skill : min
  , skills[0])
  
  // If all skills are at similar levels, recommend variety
  const avgLevel = skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length
  
  if (lowestSkill.currentLevel >= avgLevel - 0.5) {
    // Skills are balanced - recommend least practiced
    const leastPracticed = skills.reduce((min, skill) => 
      skill.totalSessions < min.totalSessions ? skill : min
    , skills[0])
    
    return {
      skill: leastPracticed.name,
      simulationType: leastPracticed.relatedSimulations[0],
      reason: `You haven't practiced ${leastPracticed.name} much. Try a ${leastPracticed.relatedSimulations[0].replace('-', ' ')} simulation.`
    }
  }
  
  return {
    skill: lowestSkill.name,
    simulationType: lowestSkill.relatedSimulations[0],
    reason: `Your ${lowestSkill.name} skill needs work. Practice with a ${lowestSkill.relatedSimulations[0].replace('-', ' ')} simulation to level up.`
  }
}

// Calculate overall level (sum of all skill levels)
export function calculateOverallLevel(userStats, role) {
  const skills = calculateSkillLevels(userStats, role)
  const totalLevels = skills.reduce((sum, s) => sum + s.currentLevel, 0)
  const maxPossible = skills.length * 5
  
  // Overall level is 1-20 based on total skill progress
  const overallLevel = Math.floor((totalLevels / maxPossible) * 20) + 1
  const progress = ((totalLevels / maxPossible) * 20) % 1 * 100
  
  // Title based on level
  const titles = [
    'Trainee', 'Apprentice', 'Junior Rep', 'Rep', 'Senior Rep',
    'Lead Rep', 'Associate', 'Senior Associate', 'Specialist', 'Senior Specialist',
    'Expert', 'Senior Expert', 'Principal', 'Senior Principal', 'Director',
    'Senior Director', 'VP', 'Senior VP', 'Master', 'Grand Master'
  ]
  
  return {
    level: Math.min(overallLevel, 20),
    title: titles[Math.min(overallLevel - 1, 19)],
    progress: Math.round(progress),
    totalSkillLevels: totalLevels,
    maxSkillLevels: maxPossible
  }
}
