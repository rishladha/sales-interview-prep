const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

async function callClaude(messages, maxTokens = 1000) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('Anthropic API key not found')
    return null
  }

  try {
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
        max_tokens: maxTokens,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('Claude API error:', error)
    return null
  }
}

function extractJSON(text) {
  try {
    // Try to find JSON in the response
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
  } catch (e) {
    console.error('JSON parse error:', e)
  }
  return null
}

// Generate scenario with full context for both sides
export async function generateScenario(setupData) {
  const { roleType, roleName, simulationType, typeName, companyName, productContext } = setupData

  const prompt = `Generate a detailed sales simulation scenario. Return ONLY valid JSON, no other text.

STUDENT CONTEXT:
- Role: ${roleName}
- Simulation type: ${typeName}
- Target company: ${companyName || 'a tech company'}
- Product/Service being sold: ${productContext.productName || 'B2B software solution'}
- Value proposition: ${productContext.valueProposition || 'Improves efficiency and reduces costs'}
- Key features: ${productContext.keyFeatures || 'Not specified'}

This is a 5-minute simulation practice.

Return this exact JSON structure:
{
  "personName": "realistic Indian business name",
  "personRole": "their job title at ${companyName || 'the company'}",
  "personMood": "their initial disposition (e.g., busy, skeptical, curious, frustrated)",
  "companyContext": "2-3 sentences about the company's current situation, challenges, and priorities",
  "personBackground": "brief background about this person's priorities and concerns",
  "objective": "specific measurable goal for the student in this simulation",
  "hiddenConcerns": ["concern 1", "concern 2"],
  "successCriteria": ["what good looks like 1", "what good looks like 2", "what good looks like 3"],
  "openingLine": "The first thing the prospect says when answering (1-2 sentences, stay in character)"
}`

  const response = await callClaude([{ role: 'user', content: prompt }])
  
  if (response) {
    const parsed = extractJSON(response)
    if (parsed) return parsed
  }

  // Fallback scenario
  return {
    personName: 'Priya Sharma',
    personRole: `VP Operations at ${companyName || 'TechCorp'}`,
    personMood: 'Busy but willing to listen briefly',
    companyContext: `${companyName || 'The company'} is scaling rapidly and facing operational challenges. They're evaluating solutions to improve efficiency but are cautious about adding new vendors.`,
    personBackground: 'Has been burned by overpromising vendors before. Values concrete ROI and quick implementation.',
    objective: 'Book a follow-up discovery meeting',
    hiddenConcerns: ['Budget has been cut this quarter', 'Previous solution failed to deliver'],
    successCriteria: ['Asked about their current challenges', 'Listened more than talked', 'Proposed clear next step'],
    openingLine: 'Hello? Yes, this is Priya speaking. I only have a few minutes.',
  }
}

// Evaluate pre-call research
export async function evaluateResearch(setupData, researchData) {
  const prompt = `Evaluate this student's pre-call research for a ${setupData.typeName} simulation.

TARGET COMPANY: ${setupData.companyName || 'Tech Company'}
PRODUCT BEING SOLD: ${setupData.productContext?.productName || 'B2B Solution'}

STUDENT'S RESEARCH:
- Target Persona: ${researchData.persona || 'Not provided'}
- Likely Challenges: ${researchData.challenges || 'Not provided'}
- How Product Helps: ${researchData.howProductHelps || 'Not provided'}
- Questions to Ask: ${researchData.questionsToAsk || 'Not provided'}
- Potential Objections: ${researchData.objections || 'Not provided'}

Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "personaScore": <0-100>,
  "challengesScore": <0-100>,
  "solutionFitScore": <0-100>,
  "questionsScore": <0-100>,
  "objectionsScore": <0-100>,
  "feedback": {
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "idealResearch": {
      "persona": "What ideal persona research looks like",
      "challenges": "What ideal challenge identification looks like",
      "howProductHelps": "How to better connect product to challenges",
      "questionsToAsk": "Better discovery questions to ask",
      "objections": "Common objections they should prepare for"
    }
  },
  "readyForCall": true or false,
  "tip": "One key tip before starting the call"
}`

  const response = await callClaude([{ role: 'user', content: prompt }])
  
  if (response) {
    const parsed = extractJSON(response)
    if (parsed) return parsed
  }

  return {
    overallScore: 70,
    personaScore: 70,
    challengesScore: 70,
    solutionFitScore: 70,
    questionsScore: 70,
    objectionsScore: 70,
    feedback: {
      strengths: ['Completed the research section'],
      improvements: ['Add more specific details'],
      idealResearch: {
        persona: 'Research the specific decision-maker profile',
        challenges: 'Identify 2-3 specific business challenges',
        howProductHelps: 'Connect features to their pain points',
        questionsToAsk: 'Prepare open-ended discovery questions',
        objections: 'Anticipate budget, timing, and competition objections'
      }
    },
    readyForCall: true,
    tip: 'Focus on asking questions rather than pitching'
  }
}

// Get interviewer response during simulation
export async function getSimulationResponse(scenario, simulationType, conversationHistory, userMessage, productContext) {
  const history = conversationHistory
    .map((m) => (m.role === 'ai' ? `${scenario.personName}: ${m.content}` : `Student: ${m.content}`))
    .join('\n')

  const systemPrompt = `You are ${scenario.personName}, ${scenario.personRole}.

CONTEXT ABOUT YOU:
${scenario.companyContext}
${scenario.personBackground}

YOUR MOOD: ${scenario.personMood}
YOUR HIDDEN CONCERNS (raise naturally): ${JSON.stringify(scenario.hiddenConcerns)}

WHAT THE STUDENT IS SELLING: ${productContext?.productName || 'A B2B solution'}
VALUE PROP: ${productContext?.valueProposition || 'Business improvement'}

SIMULATION RULES:
- This is a 5-minute practice session
- Stay completely in character as ${scenario.personName}
- Respond naturally in 2-3 sentences max
- If they pitch too early without understanding your needs, seem disinterested
- If they ask good questions about your challenges, warm up gradually
- Raise your concerns when appropriate
- Be realistic - don't make it too easy or too hard
- React authentically to what they say`

  const prompt = `${systemPrompt}

CONVERSATION SO FAR:
${history}

Student just said: "${userMessage}"

Respond as ${scenario.personName} (2-3 sentences, stay in character):`

  const response = await callClaude([{ role: 'user', content: prompt }], 200)
  
  return response?.trim() || "I see. Tell me more about that."
}

// Generate comprehensive feedback
export async function generateFeedback(setupData, scenario, messages, researchScore, duration) {
  const transcript = messages
    .map((m) => (m.role === 'ai' ? `${scenario.personName}: ${m.content}` : `Student: ${m.content}`))
    .join('\n\n')

  const dimensionsByType = {
    cold_call: ['Opening Hook', 'Building Curiosity', 'Handling Resistance', 'Call to Action', 'Active Listening'],
    discovery: ['Situation Questions', 'Problem Discovery', 'Impact Questions', 'Need-Payoff', 'Active Listening'],
    discovery_basic: ['Opening', 'Asking Questions', 'Listening', 'Next Steps'],
    objection: ['Stay Calm', 'Acknowledge Concern', 'Reframe Value', 'Confirm Resolution'],
    negotiation: ['Value Defense', 'Trade-offs', 'Creative Options', 'Closing'],
    csm_renewal: ['ROI Review', 'Future Value', 'Commercial Discussion', 'Commitment'],
    csm_escalation: ['Acknowledgment', 'Taking Ownership', 'Solution Options', 'De-escalation'],
    qbr: ['Structure', 'Value Delivered', 'Insights Shared', 'Forward Plan'],
    hiring: ['Introduction', 'Relevant Experience', 'Problem Solving', 'Questions Asked'],
  }

  const dimensions = dimensionsByType[setupData.simulationType] || ['Overall Performance']

  const prompt = `Evaluate this ${setupData.typeName} sales simulation. Be specific and actionable.

CONTEXT:
- Student role: ${setupData.roleName}
- Product sold: ${setupData.productContext?.productName || 'B2B Solution'}
- Target: ${scenario.personName}, ${scenario.personRole}
- Pre-call research score: ${researchScore || 'N/A'}
- Call duration: ${Math.round(duration / 60)} minutes

SUCCESS CRITERIA FOR THIS SIMULATION:
${JSON.stringify(scenario.successCriteria)}

TRANSCRIPT:
${transcript}

SCORING DIMENSIONS: ${dimensions.join(', ')}

Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "grade": "A/B/C/D/F",
  "headline": "One impactful sentence summarizing performance",
  "dimensionScores": [
    {"name": "dimension", "score": <0-100>, "emoji": "relevant emoji", "note": "specific feedback"}
  ],
  "keyMoments": [
    {
      "quote": "exact short quote from student",
      "timestamp": "approximate time like 'Early in call'",
      "type": "excellent/good/needs-work/missed-opportunity",
      "feedback": "specific coaching note",
      "betterAlternative": "what they could have said instead (if needs improvement)"
    }
  ],
  "topStrength": {
    "title": "Their biggest strength",
    "description": "Why this was good",
    "keepDoing": "Specific advice to reinforce this"
  },
  "topImprovement": {
    "title": "Priority area to improve",
    "description": "Why this matters",
    "actionItem": "Specific thing to practice",
    "resource": "Concept or framework to review"
  },
  "xpEarned": <50-150 based on performance>,
  "badges": ["badge names earned like 'Good Listener' or 'Quick Thinker'"],
  "nextChallenge": "Suggested next simulation to try"
}`

  const response = await callClaude([{ role: 'user', content: prompt }], 2000)

  if (response) {
    const parsed = extractJSON(response)
    if (parsed) {
      return { ...parsed, transcript, duration }
    }
  }

  // Fallback feedback
  return {
    overallScore: 65,
    grade: 'C',
    headline: 'Solid effort with room for improvement',
    dimensionScores: dimensions.map((d) => ({
      name: d,
      score: 60 + Math.floor(Math.random() * 20),
      emoji: '📊',
      note: 'Review this area',
    })),
    keyMoments: [],
    topStrength: {
      title: 'Completed the simulation',
      description: 'You practiced, which is the first step',
      keepDoing: 'Keep practicing regularly'
    },
    topImprovement: {
      title: 'Review the transcript',
      description: 'Self-reflection is valuable',
      actionItem: 'Identify one thing to do differently',
      resource: 'Active Listening techniques'
    },
    xpEarned: 50,
    badges: [],
    nextChallenge: 'Try the same simulation type again',
    transcript,
    duration,
  }
}
