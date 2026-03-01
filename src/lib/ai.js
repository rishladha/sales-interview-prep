// AI Integration with Claude API
// Scoring based on Mesa School frameworks: Mom Test, SPIN, Challenger, MEDDIC

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// Scoring frameworks by simulation type - based on Mesa School curriculum
const SCORING_FRAMEWORKS = {
  'cold-call': {
    name: 'Cold Call',
    framework: 'Opening + Value Prop + Qualification + Objection Handling',
    criteria: [
      {
        id: 'hook',
        name: 'Hook & Permission',
        weight: 20,
        description: 'Did they grab attention in first 10 seconds and ask permission to continue?',
        lookFor: ['pattern interrupt', 'asked if good time', 'stated purpose quickly', 'gave reason to listen'],
        redFlags: ['started with long intro', 'rambled', 'no clear purpose']
      },
      {
        id: 'value_prop',
        name: 'Value Proposition',
        weight: 20,
        description: 'Clear, concise value prop relevant to the persona pain points?',
        lookFor: ['specific benefit', 'relevant to their role', 'quantified impact', 'addressed a real pain'],
        redFlags: ['generic pitch', 'feature dumping', 'no clear benefit']
      },
      {
        id: 'qualification',
        name: 'Qualification Questions',
        weight: 20,
        description: 'Asked qualifying questions (BANT: Budget, Authority, Need, Timeline)?',
        lookFor: ['asked about current situation', 'explored decision process', 'understood timeline', 'identified stakeholders'],
        redFlags: ['no questions asked', 'assumed everything', 'only talked about product']
      },
      {
        id: 'objection_handling',
        name: 'Objection Handling',
        weight: 20,
        description: 'Handled pushback professionally using acknowledge-explore-respond?',
        lookFor: ['acknowledged concern', 'asked clarifying question', 'provided relevant response', 'stayed calm'],
        redFlags: ['got defensive', 'ignored objection', 'argued with prospect']
      },
      {
        id: 'next_step',
        name: 'Clear Next Step',
        weight: 20,
        description: 'Asked for a specific commitment (meeting, demo, follow-up)?',
        lookFor: ['proposed specific time', 'offered clear action', 'got commitment', 'confirmed next step'],
        redFlags: ['vague ending', 'no ask', 'let call fizzle out']
      }
    ],
    minimumBar: {
      exchanges: 3,
      words: 50,
      criteriaRequired: 3
    }
  },
  'discovery': {
    name: 'Discovery Call',
    framework: 'SPIN Selling + Mom Test',
    criteria: [
      {
        id: 'situation',
        name: 'Situation Questions',
        weight: 20,
        description: 'Understood current state without interrogating (Mom Test principle)',
        lookFor: ['asked about current process', 'understood their world', 'open-ended questions', 'let them talk'],
        redFlags: ['rapid-fire questions', 'leading questions', 'assumed situation']
      },
      {
        id: 'problem',
        name: 'Problem Questions',
        weight: 20,
        description: 'Uncovered real pain points by asking about challenges',
        lookFor: ['asked about challenges', 'explored frustrations', 'dug into specifics', 'found real pain'],
        redFlags: ['told them their problems', 'skipped to solution', 'surface-level only']
      },
      {
        id: 'implication',
        name: 'Implication Questions',
        weight: 20,
        description: 'Explored the impact and cost of the problems',
        lookFor: ['asked about consequences', 'quantified impact', 'explored ripple effects', 'made pain tangible'],
        redFlags: ['moved too fast', 'didn\'t explore impact', 'minimized problems']
      },
      {
        id: 'need_payoff',
        name: 'Need-Payoff Questions',
        weight: 20,
        description: 'Connected problems to potential value without pitching',
        lookFor: ['asked about ideal state', 'explored what success looks like', 'let them sell themselves', 'built vision'],
        redFlags: ['pitched too early', 'told instead of asked', 'didn\'t connect to value']
      },
      {
        id: 'active_listening',
        name: 'Active Listening',
        weight: 20,
        description: 'Listened more than talked, built on their responses',
        lookFor: ['referenced what they said', 'asked follow-up questions', 'paused to let them speak', 'summarized understanding'],
        redFlags: ['talked over them', 'ignored their answers', 'followed rigid script']
      }
    ],
    minimumBar: {
      exchanges: 4,
      words: 75,
      criteriaRequired: 3
    }
  },
  'objection-handling': {
    name: 'Objection Handling',
    framework: 'Acknowledge-Explore-Respond + Challenger',
    criteria: [
      {
        id: 'acknowledge',
        name: 'Acknowledge & Validate',
        weight: 20,
        description: 'Validated the concern without being defensive',
        lookFor: ['acknowledged feeling', 'showed empathy', 'didn\'t dismiss', 'stayed calm'],
        redFlags: ['got defensive', 'argued immediately', 'dismissed concern']
      },
      {
        id: 'explore',
        name: 'Explore Root Cause',
        weight: 25,
        description: 'Asked questions to understand the real concern behind the objection',
        lookFor: ['asked why', 'dug deeper', 'found root cause', 'understood context'],
        redFlags: ['assumed reason', 'surface-level response', 'rushed to counter']
      },
      {
        id: 'reframe',
        name: 'Reframe with Insight',
        weight: 25,
        description: 'Provided new perspective or insight (Challenger approach)',
        lookFor: ['offered new angle', 'shared relevant insight', 'taught something', 'changed perspective'],
        redFlags: ['repeated same pitch', 'no new information', 'begged']
      },
      {
        id: 'evidence',
        name: 'Provide Evidence',
        weight: 15,
        description: 'Backed up claims with proof (case studies, data, examples)',
        lookFor: ['cited example', 'used social proof', 'referenced data', 'told relevant story'],
        redFlags: ['no proof', 'vague claims', 'unsubstantiated promises']
      },
      {
        id: 'advance',
        name: 'Advance the Conversation',
        weight: 15,
        description: 'Moved conversation forward despite objection',
        lookFor: ['proposed next step', 'tested resolution', 'got micro-commitment', 'maintained momentum'],
        redFlags: ['gave up', 'let objection end call', 'no forward motion']
      }
    ],
    minimumBar: {
      exchanges: 3,
      words: 60,
      criteriaRequired: 3
    }
  },
  'negotiation': {
    name: 'Commercial Negotiation',
    framework: 'BATNA + Value-Based Negotiation',
    criteria: [
      {
        id: 'preparation',
        name: 'Preparation & Anchoring',
        weight: 20,
        description: 'Started from a position of strength with clear anchors',
        lookFor: ['stated clear position', 'anchored high/appropriately', 'showed preparation', 'knew their value'],
        redFlags: ['unprepared', 'weak opening', 'gave away position early']
      },
      {
        id: 'value_defense',
        name: 'Value Defense',
        weight: 25,
        description: 'Defended price/terms by connecting to value delivered',
        lookFor: ['quantified ROI', 'referenced value delivered', 'compared to alternatives', 'showed cost of inaction'],
        redFlags: ['caved on price immediately', 'no value justification', 'apologetic about pricing']
      },
      {
        id: 'trade_offs',
        name: 'Creative Trade-offs',
        weight: 20,
        description: 'Offered creative solutions that protected value while meeting needs',
        lookFor: ['proposed alternatives', 'found win-win', 'traded value not price', 'expanded the pie'],
        redFlags: ['only offered discounts', 'no creativity', 'zero-sum thinking']
      },
      {
        id: 'concession_strategy',
        name: 'Concession Strategy',
        weight: 20,
        description: 'Made concessions strategically, getting something in return',
        lookFor: ['asked for something back', 'made decreasing concessions', 'protected key terms', 'showed reluctance'],
        redFlags: ['gave without getting', 'large concessions', 'appeared desperate']
      },
      {
        id: 'closing',
        name: 'Closing & Commitment',
        weight: 15,
        description: 'Drove to clear commitment and next steps',
        lookFor: ['summarized agreement', 'confirmed terms', 'set timeline', 'got commitment'],
        redFlags: ['left things vague', 'no clear agreement', 'let them off hook']
      }
    ],
    minimumBar: {
      exchanges: 4,
      words: 80,
      criteriaRequired: 3
    }
  },
  'renewal': {
    name: 'CSM Renewal',
    framework: 'Value Realization + QBR Best Practices',
    criteria: [
      {
        id: 'value_recap',
        name: 'Value Recap & ROI',
        weight: 25,
        description: 'Quantified and communicated ROI delivered during the contract',
        lookFor: ['cited specific metrics', 'quantified impact', 'showed ROI > cost', 'referenced their goals'],
        redFlags: ['no value proof', 'vague claims', 'didn\'t know their metrics']
      },
      {
        id: 'concern_address',
        name: 'Proactive Concern Address',
        weight: 20,
        description: 'Acknowledged and addressed known issues before they raised them',
        lookFor: ['raised issues first', 'showed action taken', 'demonstrated responsiveness', 'owned problems'],
        redFlags: ['ignored known issues', 'defensive about problems', 'surprised by concerns']
      },
      {
        id: 'future_value',
        name: 'Future Roadmap & Value',
        weight: 20,
        description: 'Showed upcoming features/value aligned to their evolving needs',
        lookFor: ['shared roadmap', 'connected to their goals', 'showed continued investment', 'painted future vision'],
        redFlags: ['only backward-looking', 'no future value', 'generic roadmap']
      },
      {
        id: 'stakeholder',
        name: 'Stakeholder Engagement',
        weight: 20,
        description: 'Addressed multiple stakeholders and their different concerns',
        lookFor: ['knew decision makers', 'addressed different concerns', 'built multi-thread relationship', 'understood politics'],
        redFlags: ['single-threaded', 'ignored stakeholders', 'surprised by new people']
      },
      {
        id: 'commercial',
        name: 'Commercial Confidence',
        weight: 15,
        description: 'Handled pricing/commercial discussion with confidence',
        lookFor: ['defended value', 'handled price pushback', 'proposed fair terms', 'showed confidence'],
        redFlags: ['apologetic', 'caved immediately', 'avoided commercial discussion']
      }
    ],
    minimumBar: {
      exchanges: 4,
      words: 80,
      criteriaRequired: 3
    }
  },
  'qbr': {
    name: 'Quarterly Business Review',
    framework: '70% Forward-Looking QBR',
    criteria: [
      {
        id: 'value_review',
        name: 'Value Delivered (30%)',
        weight: 20,
        description: 'Concise review of value delivered, not a feature dump',
        lookFor: ['focused on outcomes', 'tied to their KPIs', 'quantified impact', 'kept it brief'],
        redFlags: ['feature list', 'too long on past', 'no business impact']
      },
      {
        id: 'strategic_alignment',
        name: 'Strategic Alignment',
        weight: 25,
        description: 'Connected to their strategic priorities and goals',
        lookFor: ['referenced their strategy', 'aligned to initiatives', 'understood their business', 'showed relevance'],
        redFlags: ['generic content', 'didn\'t know their goals', 'misaligned priorities']
      },
      {
        id: 'forward_plan',
        name: 'Forward-Looking Plan (70%)',
        weight: 25,
        description: 'Majority of discussion on future value and plans',
        lookFor: ['future roadmap', 'upcoming initiatives', 'joint planning', 'growth opportunities'],
        redFlags: ['all backward-looking', 'no future plan', 'reactive only']
      },
      {
        id: 'executive_presence',
        name: 'Executive Presence',
        weight: 15,
        description: 'Communicated at executive level, not in the weeds',
        lookFor: ['strategic language', 'concise points', 'confident delivery', 'business focus'],
        redFlags: ['too tactical', 'rambling', 'uncertain', 'too technical']
      },
      {
        id: 'action_items',
        name: 'Clear Action Items',
        weight: 15,
        description: 'Ended with clear, owned action items and next steps',
        lookFor: ['specific actions', 'assigned owners', 'set timelines', 'confirmed understanding'],
        redFlags: ['vague next steps', 'no ownership', 'no timeline']
      }
    ],
    minimumBar: {
      exchanges: 4,
      words: 100,
      criteriaRequired: 3
    }
  },
  'escalation': {
    name: 'Customer Escalation',
    framework: 'Escalation Matrix + De-escalation',
    criteria: [
      {
        id: 'empathy',
        name: 'Empathy & Acknowledgment',
        weight: 25,
        description: 'Showed genuine understanding of their frustration',
        lookFor: ['acknowledged impact', 'showed empathy', 'validated feelings', 'apologized appropriately'],
        redFlags: ['defensive', 'dismissive', 'minimized issue', 'blamed them']
      },
      {
        id: 'ownership',
        name: 'Clear Ownership',
        weight: 20,
        description: 'Took personal ownership without passing blame',
        lookFor: ['took responsibility', 'named themselves as owner', 'didn\'t blame others', 'committed personally'],
        redFlags: ['passed buck', 'blamed other teams', 'no clear owner']
      },
      {
        id: 'action_plan',
        name: 'Concrete Action Plan',
        weight: 25,
        description: 'Provided specific, time-bound action plan',
        lookFor: ['specific steps', 'clear timeline', 'measurable actions', 'regular updates promised'],
        redFlags: ['vague promises', 'no timeline', 'generic response']
      },
      {
        id: 'prevention',
        name: 'Prevention Commitment',
        weight: 15,
        description: 'Addressed root cause and prevention, not just symptoms',
        lookFor: ['root cause mention', 'process improvement', 'prevention plan', 'systemic fix'],
        redFlags: ['only fixed symptom', 'no prevention', 'likely to recur']
      },
      {
        id: 'relationship',
        name: 'Relationship Preservation',
        weight: 15,
        description: 'Maintained relationship and trust despite the issue',
        lookFor: ['preserved relationship', 'showed commitment', 'offered goodwill', 'ended positively'],
        redFlags: ['damaged relationship', 'adversarial', 'lost trust further']
      }
    ],
    minimumBar: {
      exchanges: 3,
      words: 60,
      criteriaRequired: 3
    }
  },
  'job-interview': {
    name: 'Job Interview',
    framework: 'STAR Method + Proof of Work',
    criteria: [
      {
        id: 'structure',
        name: 'Structured Responses',
        weight: 20,
        description: 'Used STAR method or clear structure in answers',
        lookFor: ['clear structure', 'situation-task-action-result', 'concise', 'complete answers'],
        redFlags: ['rambling', 'no structure', 'incomplete answers', 'too brief']
      },
      {
        id: 'evidence',
        name: 'Concrete Evidence',
        weight: 25,
        description: 'Provided specific examples and metrics, not generalities',
        lookFor: ['specific examples', 'metrics/numbers', 'real situations', 'verifiable claims'],
        redFlags: ['vague claims', 'hypotheticals only', 'no proof', 'buzzwords']
      },
      {
        id: 'self_awareness',
        name: 'Self-Awareness',
        weight: 20,
        description: 'Showed honest reflection on strengths and growth areas',
        lookFor: ['honest assessment', 'growth mindset', 'learned from failures', 'knows strengths'],
        redFlags: ['overconfident', 'no weaknesses', 'blame others', 'not coachable']
      },
      {
        id: 'role_fit',
        name: 'Role Understanding',
        weight: 20,
        description: 'Demonstrated understanding of the role and company',
        lookFor: ['researched company', 'understood role', 'relevant experience', 'clear motivation'],
        redFlags: ['no research', 'wrong role fit', 'generic interest', 'unclear motivation']
      },
      {
        id: 'questions',
        name: 'Quality Questions',
        weight: 15,
        description: 'Asked thoughtful questions showing genuine interest',
        lookFor: ['insightful questions', 'shows research', 'genuine curiosity', 'strategic thinking'],
        redFlags: ['no questions', 'basic questions', 'only about compensation', 'could Google it']
      }
    ],
    minimumBar: {
      exchanges: 3,
      words: 100,
      criteriaRequired: 3
    }
  }
}

// Generate scenario with clean dialogue (no stage directions in responses)
export async function generateScenario(role, simulationType, companyName, productContext) {
  const framework = SCORING_FRAMEWORKS[simulationType] || SCORING_FRAMEWORKS['discovery']
  
  const systemPrompt = `You are a scenario generator for sales training simulations.
Create a realistic, challenging scenario for a ${role} practicing ${framework.name}.

The scenario should test these skills based on ${framework.framework}:
${framework.criteria.map(c => `- ${c.name}: ${c.description}`).join('\n')}

Generate a JSON response with:
- personName: A realistic Indian business name
- personTitle: Their job title  
- personMood: Their emotional state (skeptical, busy, frustrated, interested, etc.)
- companyContext: Brief context about their company situation
- specificChallenge: The specific challenge or objection they'll present
- objective: What the student needs to achieve
- successCriteria: 3-4 specific things they must do to succeed
- openingLine: The persona's first line (natural dialogue, NO stage directions or mood indicators in brackets)

Make the scenario challenging but realistic. The persona should:
- Have realistic objections and concerns
- Not be easily convinced
- Require the student to demonstrate real skill
- Push back on weak attempts`

  const userMessage = `Create a ${simulationType} scenario for:
- Role: ${role}
- Target Company: ${companyName || 'a mid-size tech company'}
- Product/Service: ${productContext ? `${productContext.name} - ${productContext.valueProposition}` : 'B2B SaaS solution'}

Make it challenging and realistic.`

  const response = await callClaude(systemPrompt, userMessage)
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse scenario:', e)
  }

  return {
    personName: 'Priya Sharma',
    personTitle: 'Head of Operations',
    personMood: 'skeptical',
    companyContext: `${companyName || 'TechCorp'} is evaluating solutions but has been burned by vendors before`,
    specificChallenge: 'Budget constraints and past bad experiences',
    objective: 'Secure a follow-up meeting',
    successCriteria: ['Build rapport', 'Understand their situation', 'Handle skepticism', 'Get commitment'],
    openingLine: 'Yes, who is this?'
  }
}

// Get simulation response - clean dialogue only
export async function getSimulationResponse(scenario, simulationType, conversationHistory, userMessage, productContext) {
  const framework = SCORING_FRAMEWORKS[simulationType] || SCORING_FRAMEWORKS['discovery']
  
  const systemPrompt = `You are ${scenario.personName}, ${scenario.personTitle}.

Your mood: ${scenario.personMood}
Your situation: ${scenario.companyContext}
Your main concern: ${scenario.specificChallenge}

CRITICAL RULES:
1. Respond ONLY with natural dialogue - what you would actually say
2. NO stage directions, NO mood indicators, NO text in brackets or parentheses
3. NO "*sighs*" or "*pauses*" or any action descriptions
4. Keep responses concise (1-3 sentences typically)
5. Be realistic - don't cave easily, push back on weak attempts
6. If they're doing well, gradually warm up
7. If they're doing poorly, become more resistant

You are testing their ${framework.name} skills. Challenge them appropriately.

${productContext ? `They are selling: ${productContext.name} - ${productContext.valueProposition}` : ''}

Respond naturally as this persona would. Stay in character.`

  const formattedHistory = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'Sales Rep' : scenario.personName}: ${msg.content}`)
    .join('\n')

  const userPrompt = `Conversation so far:
${formattedHistory}

Sales Rep just said: "${userMessage}"

Respond as ${scenario.personName} (dialogue only, no stage directions):`

  return await callClaude(systemPrompt, userPrompt)
}

// Evaluate pre-call research
export async function evaluateResearch(research, scenario, simulationType, productContext) {
  const framework = SCORING_FRAMEWORKS[simulationType] || SCORING_FRAMEWORKS['discovery']
  
  const systemPrompt = `You are a sales coach evaluating pre-call research quality.
Be STRICT - good research is specific, actionable, and shows real preparation.

Score each dimension 0-100:
- 80-100: Excellent - specific, insightful, actionable
- 60-79: Good - solid but could be deeper
- 40-59: Adequate - surface level, generic
- 20-39: Weak - minimal effort, mostly assumptions
- 0-19: Poor - wrong, missing, or irrelevant

Return JSON with:
{
  "overall": number,
  "dimensions": {
    "persona": { "score": number, "feedback": "string" },
    "challenges": { "score": number, "feedback": "string" },
    "solution_fit": { "score": number, "feedback": "string" },
    "questions": { "score": number, "feedback": "string" },
    "objections": { "score": number, "feedback": "string" }
  },
  "idealResearch": {
    "persona": "What excellent research would include",
    "challenges": "...",
    "solution_fit": "...",
    "questions": "...",
    "objections": "..."
  }
}`

  const userMessage = `Evaluate this pre-call research for a ${framework.name} simulation:

Target Scenario:
- Person: ${scenario.personName}, ${scenario.personTitle}
- Company Context: ${scenario.companyContext}
- Product Being Sold: ${productContext?.name || 'B2B Solution'} - ${productContext?.valueProposition || 'Business software'}

Student's Research:
- Persona Notes: ${research.persona || 'Not provided'}
- Likely Challenges: ${research.challenges || 'Not provided'}
- How Product Helps: ${research.solutionFit || 'Not provided'}
- Questions to Ask: ${research.questions || 'Not provided'}
- Potential Objections: ${research.objections || 'Not provided'}

Be strict but fair. Empty or generic answers should score low.`

  const response = await callClaude(systemPrompt, userMessage)
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse research evaluation:', e)
  }

  return {
    overall: 50,
    dimensions: {
      persona: { score: 50, feedback: 'Could not evaluate' },
      challenges: { score: 50, feedback: 'Could not evaluate' },
      solution_fit: { score: 50, feedback: 'Could not evaluate' },
      questions: { score: 50, feedback: 'Could not evaluate' },
      objections: { score: 50, feedback: 'Could not evaluate' }
    }
  }
}

// Generate STRICT feedback based on course frameworks
export async function generateFeedback(setup, scenario, messages, duration, researchScore = null) {
  const framework = SCORING_FRAMEWORKS[setup.simulationType] || SCORING_FRAMEWORKS['discovery']
  
  // Check minimum bar
  const userMessages = messages.filter(m => m.role === 'user')
  const totalUserWords = userMessages.reduce((sum, m) => sum + m.content.split(' ').length, 0)
  const exchanges = userMessages.length
  
  const failedMinimumBar = exchanges < framework.minimumBar.exchanges || 
                           totalUserWords < framework.minimumBar.words

  const systemPrompt = `You are a strict sales coach evaluating a ${framework.name} simulation.
Use the ${framework.framework} framework to evaluate.

SCORING CRITERIA (be strict - this is training):
${framework.criteria.map(c => `
${c.name} (${c.weight} points):
- ${c.description}
- Look for: ${c.lookFor.join(', ')}
- Red flags: ${c.redFlags.join(', ')}`).join('\n')}

MINIMUM BAR CHECK:
- Required exchanges: ${framework.minimumBar.exchanges} (Student had: ${exchanges})
- Required words: ${framework.minimumBar.words} (Student said: ${totalUserWords} words)
- Must demonstrate at least ${framework.minimumBar.criteriaRequired} criteria
${failedMinimumBar ? '\n⚠️ STUDENT FAILED MINIMUM BAR - Score should reflect this (likely <40)' : ''}

GRADING SCALE:
- A (90-100): Exceptional - would close the deal, textbook execution
- B (75-89): Good - solid performance with minor improvements needed
- C (60-74): Adequate - got basics right but significant gaps
- D (40-59): Below expectations - major skill gaps evident
- F (0-39): Failed - did not demonstrate required skills

Return JSON:
{
  "overall": number (0-100, be strict),
  "grade": "A/B/C/D/F",
  "passed": boolean (true if score >= 60),
  "criteriaScores": [
    { "id": "criterion_id", "name": "Name", "score": number, "maxScore": number, "feedback": "specific feedback" }
  ],
  "keyMoments": [
    {
      "timestamp": "approximate time",
      "quote": "what they said",
      "type": "excellent|good|needs_work|missed_opportunity",
      "feedback": "why this matters",
      "betterAlternative": "what they should have said/done"
    }
  ],
  "topStrength": {
    "skill": "what they did well",
    "example": "specific example from conversation",
    "keepDoing": "advice to continue"
  },
  "topImprovement": {
    "skill": "biggest gap",
    "issue": "what went wrong",
    "howToFix": "specific actionable advice",
    "resource": "Mom Test / SPIN / Challenger / etc - which framework to review"
  },
  "frameworkAnalysis": "How well did they apply ${framework.framework}?",
  "nextChallenge": "What they should practice next"
}`

  const formattedConversation = messages
    .map((msg, i) => `[${Math.floor(i * duration / messages.length / 60)}:${String(Math.floor((i * duration / messages.length) % 60)).padStart(2, '0')}] ${msg.role === 'user' ? 'Student' : scenario.personName}: ${msg.content}`)
    .join('\n')

  const userMessage = `Evaluate this ${framework.name} simulation:

SETUP:
- Role: ${setup.role}
- Company: ${setup.companyName}
- Persona: ${scenario.personName}, ${scenario.personTitle}
- Persona Mood: ${scenario.personMood}
- Challenge: ${scenario.specificChallenge}
- Duration: ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}
${researchScore ? `- Pre-call Research Score: ${researchScore}/100` : ''}

CONVERSATION:
${formattedConversation}

Be strict but constructive. If the student barely participated, score accordingly (likely F or D).
If they showed effort but had gaps, score fairly (likely C or B).
Only give A for truly exceptional performance.`

  const response = await callClaude(systemPrompt, userMessage)
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const feedback = JSON.parse(jsonMatch[0])
      
      // Ensure minimum bar failure results in low score
      if (failedMinimumBar && feedback.overall > 40) {
        feedback.overall = Math.min(35, feedback.overall)
        feedback.grade = 'F'
        feedback.passed = false
        feedback.topImprovement = {
          skill: 'Active Participation',
          issue: `You only had ${exchanges} exchanges and said ${totalUserWords} words. The minimum is ${framework.minimumBar.exchanges} exchanges and ${framework.minimumBar.words} words.`,
          howToFix: 'Practice speaking up more. In a real call, silence loses deals. Prepare talking points and practice delivering them.',
          resource: 'Practice with a peer first, then try the simulation again'
        }
      }
      
      return feedback
    }
  } catch (e) {
    console.error('Failed to parse feedback:', e)
  }

  return {
    overall: failedMinimumBar ? 20 : 50,
    grade: failedMinimumBar ? 'F' : 'C',
    passed: false,
    criteriaScores: framework.criteria.map(c => ({
      id: c.id,
      name: c.name,
      score: failedMinimumBar ? 5 : 10,
      maxScore: c.weight,
      feedback: failedMinimumBar ? 'Insufficient participation to evaluate' : 'Could not evaluate'
    })),
    keyMoments: [],
    topStrength: { skill: 'N/A', example: 'N/A', keepDoing: 'Try again with more participation' },
    topImprovement: { 
      skill: 'Participation', 
      issue: 'Need more active engagement', 
      howToFix: 'Speak up more during the simulation',
      resource: 'Practice speaking your pitch out loud'
    },
    frameworkAnalysis: 'Insufficient data to analyze',
    nextChallenge: 'Try this simulation again with full participation'
  }
}

export { SCORING_FRAMEWORKS }
