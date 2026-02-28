import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GradientOrb } from '../components/Decorations'

// Role to Simulation Type mapping
const ROLE_CONFIG = {
  sdr: {
    name: 'SDR / BDR',
    description: 'Sales Development Representative',
    types: ['cold_call', 'discovery_basic', 'hiring'],
  },
  ae: {
    name: 'Account Executive',
    description: 'Full-cycle sales',
    types: ['cold_call', 'discovery', 'objection', 'negotiation', 'hiring'],
  },
  csm: {
    name: 'Customer Success Manager',
    description: 'Post-sales & renewals',
    types: ['csm_renewal', 'csm_escalation', 'discovery', 'qbr', 'hiring'],
  },
  sales_leader: {
    name: 'Sales Leader',
    description: 'Manager / Director',
    types: ['hiring', 'negotiation', 'team_scenario'],
  },
  enterprise_ae: {
    name: 'Enterprise AE',
    description: 'Complex deals',
    types: ['discovery', 'negotiation', 'multi_stakeholder', 'hiring'],
  },
}

const SIMULATION_TYPES = {
  cold_call: { name: 'Cold Call', emoji: '📞', desc: 'Outbound prospecting call' },
  discovery_basic: { name: 'Discovery (Basic)', emoji: '🔍', desc: 'Initial needs analysis' },
  discovery: { name: 'Discovery Call', emoji: '🔍', desc: 'Deep needs analysis' },
  objection: { name: 'Objection Handling', emoji: '🛡️', desc: 'Handle pushback' },
  negotiation: { name: 'Negotiation', emoji: '🤝', desc: 'Commercial discussion' },
  csm_renewal: { name: 'Renewal Call', emoji: '🔄', desc: 'Secure the renewal' },
  csm_escalation: { name: 'Escalation', emoji: '🚨', desc: 'Handle upset customer' },
  qbr: { name: 'QBR', emoji: '📊', desc: 'Quarterly business review' },
  hiring: { name: 'Sales Interview', emoji: '💼', desc: 'Get the job' },
  multi_stakeholder: { name: 'Multi-Stakeholder', emoji: '👥', desc: 'Multiple decision makers' },
  team_scenario: { name: 'Team Scenario', emoji: '👔', desc: 'Leadership situation' },
}

export default function Setup() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState(null)
  const [simulationType, setSimulationType] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [productContext, setProductContext] = useState({
    productName: '',
    valueProposition: '',
    keyFeatures: '',
  })
  
  const navigate = useNavigate()

  const roleConfig = selectedRole ? ROLE_CONFIG[selectedRole] : null
  const availableTypes = roleConfig
    ? roleConfig.types.map((t) => ({ id: t, ...SIMULATION_TYPES[t] }))
    : []

  const handleContinue = () => {
    if (!selectedRole || !simulationType) return

    sessionStorage.setItem('simulationSetup', JSON.stringify({
      roleType: selectedRole,
      roleName: roleConfig.name,
      simulationType,
      typeName: SIMULATION_TYPES[simulationType].name,
      companyName: companyName.trim() || 'A growing tech company',
      productContext,
    }))

    navigate('/research')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden pb-8">
      <GradientOrb className="w-96 h-96 -top-48 -right-48" colors={['from-indigo-400', 'to-purple-500']} />
      <GradientOrb className="w-80 h-80 -bottom-40 -left-40" colors={['from-blue-400', 'to-cyan-500']} />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 mb-6 hover:text-gray-600 transition-colors">
          <span>←</span> Back
        </Link>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-indigo-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your role?</h2>
            <p className="text-gray-500 mb-6">We'll show relevant simulation scenarios</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(ROLE_CONFIG).map(([key, role]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRole(key)}
                  className={`p-4 rounded-2xl text-left transition-all ${
                    selectedRole === key
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]'
                      : 'bg-white/80 hover:bg-white text-gray-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="font-medium">{role.name}</div>
                  <div className={`text-xs mt-1 ${selectedRole === key ? 'text-white/70' : 'text-gray-400'}`}>
                    {role.description}
                  </div>
                </button>
              ))}
            </div>

            {selectedRole && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {/* Step 2: Scenario Type + Company */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your scenario</h2>
            <p className="text-gray-500 mb-6">Select simulation type and target company</p>

            {/* Company Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Company <span className="text-gray-400">(who are you calling?)</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Razorpay, Freshworks, Swiggy..."
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {/* Simulation Types */}
            <div className="space-y-3 mb-6">
              {availableTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSimulationType(type.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${
                    simulationType === type.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white/80 hover:bg-white text-gray-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{type.name}</div>
                    <div className={`text-sm ${simulationType === type.id ? 'text-white/80' : 'text-gray-400'}`}>
                      {type.desc}
                    </div>
                  </div>
                  <div className={`text-sm px-3 py-1 rounded-full ${simulationType === type.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    5m
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => simulationType && setStep(3)}
                disabled={!simulationType}
                className="flex-1 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Product Context */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What are you selling?</h2>
            <p className="text-gray-500 mb-6">Give context about your product/service</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service Name
                </label>
                <input
                  type="text"
                  value={productContext.productName}
                  onChange={(e) => setProductContext({ ...productContext, productName: e.target.value })}
                  placeholder="e.g., CloudSync CRM, MarketPro Analytics..."
                  className="w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value Proposition <span className="text-gray-400">(what problem does it solve?)</span>
                </label>
                <textarea
                  value={productContext.valueProposition}
                  onChange={(e) => setProductContext({ ...productContext, valueProposition: e.target.value })}
                  placeholder="e.g., Reduces sales cycle by 40% through AI-powered lead scoring..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={productContext.keyFeatures}
                  onChange={(e) => setProductContext({ ...productContext, keyFeatures: e.target.value })}
                  placeholder="e.g., AI automation, real-time analytics, integrations with Salesforce..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Quick templates */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Or use a template:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'SaaS CRM', value: 'Cloud-based CRM that helps sales teams close deals faster' },
                  { name: 'HR Tech', value: 'AI recruiting platform that reduces time-to-hire by 50%' },
                  { name: 'FinTech', value: 'Payment processing solution with lower fees and faster settlements' },
                ].map((template) => (
                  <button
                    key={template.name}
                    onClick={() => setProductContext({
                      ...productContext,
                      productName: template.name + ' Solution',
                      valueProposition: template.value,
                    })}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
              >
                Continue to Research →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
