const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

async function callClaude(prompt, maxTokens = 500) {
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
        messages: [{ role: 'user', content: prompt }],
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
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
  } catch (e) {
    console.error('JSON parse error:', e)
  }
  return null
}

export async function generateScenario(roleType, roleName, interviewType, typeName, companyName) {
  const prompt = `Generate a sales interview scenario. Return ONLY valid JSON, no other text.

CONTEXT:
- Student role: ${roleName}
- Target company: ${companyName || 'a growing tech company'}
- Interview type: ${typeName}
- Duration: This is a quick 5-minute practice session

Return this exact JSON structure:
{
  "personName": "realistic Indian name",
  "personRole": "their job title at the company",
  "personMood": "their disposition (busy, skeptical, friendly, etc)",
  "context": "2-3 sentences about the current situation",
  "objective": "what the student should try to achieve",
  "hiddenConcerns": "1-2 objections they will raise"
}`

  const response = await callClaude(prompt)
  
  if (response) {
    const parsed = extractJSON(response)
    if (parsed) return parsed
  }

  // Fallback scenario
  return {
    personName: 'Priya Sharma',
    personRole: `VP Operations at ${companyName || 'TechCorp'}`,
    personMood: 'Busy but willing to listen briefly',
    context: `${companyName || 'The company'} is scaling rapidly and evaluating solutions to improve efficiency.`,
    objective: 'Book a follow-up meeting',
    hiddenConcerns: 'Budget constraints and timing',
  }
}

export async function getInterviewerOpening(scenario, interviewType) {
  const openingStyle = {
    cold_call: 'Answer the phone briefly: "Hello?" or "Yes, speaking?" Keep it very short.',
    discovery_basic: 'Brief professional greeting, mention you have about 5 minutes.',
    discovery: 'Professional greeting, you agreed to this call but are evaluating if worth your time.',
    objection: 'Start with a skeptical tone, you\'ve heard many pitches.',
    negotiation: 'Professional but firm, you want a good deal.',
    csm_renewal: 'Professional greeting, you have some concerns to discuss.',
    csm_escalation: 'Frustrated tone, something went wrong and you\'re upset.',
    qbr: 'Professional, waiting to hear the quarterly review.',
    hiring: 'Welcoming: "Thanks for coming in today. Tell me a bit about yourself."',
    multi_stakeholder: 'Professional, introduce that there are others on the call.',
    team_scenario: 'As a team member bringing up a concern.',
  }

  const prompt = `You are ${scenario.personName}, ${scenario.personRole}.
Context: ${scenario.context}
Mood: ${scenario.personMood}
This is a 5-minute ${interviewType.replace('_', ' ')} practice.

${openingStyle[interviewType] || 'Give a brief professional greeting.'}

Respond with ONLY 1-2 sentences as ${scenario.personName}. Stay in character. No explanations.`

  const response = await callClaude(prompt, 100)
  
  if (response) return response.trim()

  // Fallback openings
  const fallbacks = {
    cold_call: 'Hello?',
    hiring: 'Thanks for coming in. Tell me about yourself.',
    csm_escalation: 'I hope you have an update for me. This situation is unacceptable.',
    default: 'Hi, thanks for connecting. What can I help you with?',
  }

  return fallbacks[interviewType] || fallbacks.default
}

export async function getInterviewerResponse(scenario, interviewType, conversationHistory, userMessage) {
  const history = conversationHistory
    .map((m) => (m.role === 'ai' ? `${scenario.personName}: ${m.content}` : `Student: ${m.content}`))
    .join('\n')

  const prompt = `You are ${scenario.personName}, ${scenario.personRole}.
Context: ${scenario.context}
Mood: ${scenario.personMood}
Hidden concerns (raise naturally): ${scenario.hiddenConcerns}
This is a 5-minute practice session.

CONVERSATION SO FAR:
${history}
Student: ${userMessage}

Respond naturally as ${scenario.personName}. 2-3 sentences max. Stay in character.
- If they pitch too early without understanding your needs, seem disinterested
- If they acknowledge your concerns well, warm up slightly
- Raise your hidden concerns naturally when appropriate
- Keep responses concise (this is a quick 5-minute call)`

  const response = await callClaude(prompt, 200)
  
  return response?.trim() || "I see. Can you tell me more about that?"
}

export async function generateFeedback(scenario, interviewType, typeName, messages, duration) {
  const transcript = messages
    .map((m) => (m.role === 'ai' ? `${scenario.personName}: ${m.content}` : `You: ${m.content}`))
    .join('\n\n')

  const dimensionsByType = {
    cold_call: 'Opening Hook, Problem Awareness, Active Listening, Objection Handling, Call to Action',
    discovery_basic: 'Situation Questions, Problem Questions, Listening, Next Steps',
    discovery: 'Situation Questions, Problem Questions, Implication Questions, Need-Payoff, Listening',
    objection: 'Composure, Acknowledgment, Reframe Quality, Recovery',
    negotiation: 'Preparation, Value Framing, Trade-offs, Closing',
    csm_renewal: 'ROI Narrative, Commercial Framing, Stakeholder Management, Next Steps',
    csm_escalation: 'Acknowledgment, Ownership Language, Options Provided, De-escalation',
    qbr: 'Structure, Value Delivered, Forward Plan, Engagement',
    hiring: 'Structure, Relevant Examples, Self-Awareness, Role Fit, Questions Asked',
    multi_stakeholder: 'Stakeholder Read, Message Tailoring, Consensus Building, Control',
    team_scenario: 'Leadership, Clarity, Empathy, Decision Making',
  }

  const dimensions = dimensionsByType[interviewType] || 'Overall Performance'

  const prompt = `Evaluate this ${typeName} practice interview. Return ONLY valid JSON.

TRANSCRIPT:
${transcript}

SCORING DIMENSIONS: ${dimensions}

Return this exact JSON structure:
{
  "overallScore": <number 0-100>,
  "dimensionScores": [
    {"name": "<dimension>", "score": <0-100>, "note": "<1 sentence feedback>"}
  ],
  "strengths": [
    {"point": "<what they did well>", "framework": "<relevant concept>"}
  ],
  "improvements": [
    {"point": "<what to improve>", "framework": "<concept to review>", "tip": "<specific actionable advice>"}
  ],
  "annotatedMoments": [
    {"quote": "<exact short quote from transcript>", "type": "good", "note": "<why this was good>"},
    {"quote": "<exact short quote from transcript>", "type": "warning", "note": "<what could be better>"}
  ],
  "summary": "<2-3 sentence overall assessment>"
}

Include 3-5 annotated moments. Be specific and constructive.`

  const response = await callClaude(prompt, 1500)

  if (response) {
    const parsed = extractJSON(response)
    if (parsed) {
      return { ...parsed, transcript, duration }
    }
  }

  // Fallback feedback
  return {
    overallScore: 65,
    dimensionScores: dimensions.split(', ').map((d) => ({
      name: d.trim(),
      score: 60 + Math.floor(Math.random() * 20),
      note: 'Review this area for improvement',
    })),
    strengths: [{ point: 'Completed the practice session', framework: 'Consistency' }],
    improvements: [{ point: 'Review the transcript below', framework: 'Self-reflection', tip: 'Identify specific moments you could improve' }],
    annotatedMoments: [],
    summary: 'Practice completed. Review the transcript for self-assessment.',
    transcript,
    duration,
  }
}
