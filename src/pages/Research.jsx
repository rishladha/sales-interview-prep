import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { evaluateResearch } from '../lib/ai'
import { GradientOrb } from '../components/Decorations'

export default function Research() {
  const [setup, setSetup] = useState(null)
  const [research, setResearch] = useState({
    persona: '',
    challenges: '',
    howProductHelps: '',
    questionsToAsk: '',
    objections: '',
  })
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showIdeal, setShowIdeal] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const storedSetup = sessionStorage.getItem('simulationSetup')
    if (!storedSetup) {
      navigate('/setup')
      return
    }
    setSetup(JSON.parse(storedSetup))
  }, [navigate])

  const handleEvaluate = async () => {
    setLoading(true)
    const result = await evaluateResearch(setup, research)
    setEvaluation(result)
    setLoading(false)
  }

  const handleProceed = () => {
    // Store research and evaluation for later
    sessionStorage.setItem('researchData', JSON.stringify(research))
    sessionStorage.setItem('researchScore', JSON.stringify(evaluation))
    navigate('/ready')
  }

  const handleSkip = () => {
    sessionStorage.setItem('researchData', JSON.stringify({}))
    sessionStorage.setItem('researchScore', JSON.stringify({ overallScore: 0, skipped: true }))
    navigate('/ready')
  }

  if (!setup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden pb-8">
      <GradientOrb className="w-80 h-80 -top-40 -right-40" colors={['from-emerald-400', 'to-teal-500']} />
      <GradientOrb className="w-60 h-60 -bottom-30 -left-30" colors={['from-blue-400', 'to-indigo-500']} />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        <Link to="/setup" className="inline-flex items-center gap-2 text-gray-400 mb-6 hover:text-gray-600 transition-colors">
          <span>←</span> Back to setup
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg shadow-emerald-200 mb-3">
            <span className="text-2xl">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Pre-Call Research</h1>
          <p className="text-gray-500 text-sm">
            Calling <span className="font-medium text-gray-700">{setup.companyName}</span> • {setup.typeName}
          </p>
        </div>

        {!evaluation ? (
          <>
            {/* Research Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Fill in your research before the call. This tests your preparation skills.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Who are you calling? <span className="text-gray-400">(persona)</span>
                  </label>
                  <textarea
                    value={research.persona}
                    onChange={(e) => setResearch({ ...research, persona: e.target.value })}
                    placeholder="e.g., VP of Sales, 10+ years experience, likely focused on revenue growth and team efficiency..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-emerald-400 focus:bg-white focus:outline-none resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What challenges might they face?
                  </label>
                  <textarea
                    value={research.challenges}
                    onChange={(e) => setResearch({ ...research, challenges: e.target.value })}
                    placeholder="e.g., Scaling the team, improving win rates, reducing sales cycle length..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-emerald-400 focus:bg-white focus:outline-none resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How does your product help?
                  </label>
                  <textarea
                    value={research.howProductHelps}
                    onChange={(e) => setResearch({ ...research, howProductHelps: e.target.value })}
                    placeholder="e.g., Our AI lead scoring helps prioritize high-value prospects, typically improving win rates by 25%..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-emerald-400 focus:bg-white focus:outline-none resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Questions you'll ask <span className="text-gray-400">(discovery)</span>
                  </label>
                  <textarea
                    value={research.questionsToAsk}
                    onChange={(e) => setResearch({ ...research, questionsToAsk: e.target.value })}
                    placeholder="e.g., How are you currently qualifying leads? What does your sales process look like?..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-emerald-400 focus:bg-white focus:outline-none resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Possible objections to prepare for
                  </label>
                  <textarea
                    value={research.objections}
                    onChange={(e) => setResearch({ ...research, objections: e.target.value })}
                    placeholder="e.g., We already use Salesforce, budget is tight, need to involve other stakeholders..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-emerald-400 focus:bg-white focus:outline-none resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Skip Research
              </button>
              <button
                onClick={handleEvaluate}
                disabled={loading || !research.persona}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Evaluating...' : 'Check My Research'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Evaluation Results */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-6 animate-fadeIn">
              {/* Score */}
              <div className="text-center mb-6">
                <div className={`text-5xl font-bold mb-1 ${
                  evaluation.overallScore >= 80 ? 'text-emerald-500' :
                  evaluation.overallScore >= 60 ? 'text-blue-500' :
                  evaluation.overallScore >= 40 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {evaluation.overallScore}
                </div>
                <p className="text-gray-500 text-sm">Research Score</p>
              </div>

              {/* Dimension Scores */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {[
                  { name: 'Persona', score: evaluation.personaScore },
                  { name: 'Challenges', score: evaluation.challengesScore },
                  { name: 'Solution', score: evaluation.solutionFitScore },
                  { name: 'Questions', score: evaluation.questionsScore },
                  { name: 'Objections', score: evaluation.objectionsScore },
                ].map((dim) => (
                  <div key={dim.name} className="text-center">
                    <div className={`text-lg font-semibold ${
                      dim.score >= 70 ? 'text-emerald-500' : dim.score >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {dim.score}
                    </div>
                    <div className="text-xs text-gray-400">{dim.name}</div>
                  </div>
                ))}
              </div>

              {/* Feedback */}
              {evaluation.feedback?.strengths?.length > 0 && (
                <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                  <p className="font-medium text-emerald-700 mb-2">✓ What you did well</p>
                  <ul className="space-y-1">
                    {evaluation.feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-emerald-600">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.feedback?.improvements?.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4 mb-4">
                  <p className="font-medium text-amber-700 mb-2">↑ Areas to improve</p>
                  <ul className="space-y-1">
                    {evaluation.feedback.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-amber-600">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tip */}
              {evaluation.tip && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-indigo-700">
                    <span className="font-medium">💡 Before you start:</span> {evaluation.tip}
                  </p>
                </div>
              )}
            </div>

            {/* Show Ideal Research */}
            {!showIdeal ? (
              <button
                onClick={() => setShowIdeal(true)}
                className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors mb-4"
              >
                Show Ideal Research Example
              </button>
            ) : (
              <div className="bg-blue-50/80 backdrop-blur-sm rounded-3xl p-6 mb-6 animate-fadeIn">
                <h3 className="font-semibold text-blue-800 mb-4">📚 Ideal Research Example</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-blue-700">Persona:</p>
                    <p className="text-blue-600">{evaluation.feedback?.idealResearch?.persona}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Challenges:</p>
                    <p className="text-blue-600">{evaluation.feedback?.idealResearch?.challenges}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Solution Fit:</p>
                    <p className="text-blue-600">{evaluation.feedback?.idealResearch?.howProductHelps}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Questions:</p>
                    <p className="text-blue-600">{evaluation.feedback?.idealResearch?.questionsToAsk}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Objections:</p>
                    <p className="text-blue-600">{evaluation.feedback?.idealResearch?.objections}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Continue */}
            <button
              onClick={handleProceed}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
            >
              Continue to Simulation →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
