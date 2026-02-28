import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FloatingBlob, FloatingDots } from '../components/Decorations'

// Role to Interview Type mapping
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
    description: 'Complex, multi-stakeholder deals',
    types: ['discovery', 'negotiation', 'multi_stakeholder', 'hiring'],
  },
}

const INTERVIEW_TYPES = {
  cold_call: { name: 'Cold Call', emoji: '📞', desc: 'Outbound prospecting' },
  discovery_basic: { name: 'Discovery (Basic)', emoji: '🔍', desc: 'Initial needs analysis' },
  discovery: { name: 'Discovery Call', emoji: '🔍', desc: 'Deep needs analysis' },
  objection: { name: 'Objection Handling', emoji: '🛡️', desc: 'Handle pushback' },
  negotiation: { name: 'Negotiation', emoji: '🤝', desc: 'Commercial discussion' },
  csm_renewal: { name: 'Renewal Call', emoji: '🔄', desc: 'Secure the renewal' },
  csm_escalation: { name: 'Escalation', emoji: '🚨', desc: 'Upset customer' },
  qbr: { name: 'QBR', emoji: '📊', desc: 'Quarterly review' },
  hiring: { name: 'Job Interview', emoji: '💼', desc: 'Get hired' },
  multi_stakeholder: { name: 'Multi-Stakeholder', emoji: '👥', desc: 'Multiple decision makers' },
  team_scenario: { name: 'Team Scenario', emoji: '👔', desc: 'Leadership situation' },
}

export default function Setup() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [interviewType, setInterviewType] = useState(null)
  
  const navigate = useNavigate()

  const roleConfig = selectedRole ? ROLE_CONFIG[selectedRole] : null
  const availableTypes = roleConfig
    ? roleConfig.types.map((t) => ({ id: t, ...INTERVIEW_TYPES[t] }))
    : []

  const handleContinue = () => {
    if (!selectedRole || !interviewType) return

    // Store setup in sessionStorage for next pages
    sessionStorage.setItem('interviewSetup', JSON.stringify({
      roleType: selectedRole,
      roleName: roleConfig.name,
      interviewType,
      interviewTypeName: INTERVIEW_TYPES[interviewType].name,
      companyName: companyName.trim() || null,
    }))

    navigate('/ready')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      <FloatingBlob className="absolute -top-20 -right-20 w-96 h-96 opacity-30" color="#C4B5FD" />
      <FloatingBlob className="absolute -bottom-20 -left-20 w-72 h-72 opacity-20" color="#FED7AA" />
      <FloatingDots />

      <div className="relative max-w-lg mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-700 transition-colors">
          <span>←</span> Back
        </Link>

        {/* Step 1: Role */}
        <div className="mb-8 animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-900 mb-2">What's your role?</h2>
          <p className="text-gray-500 text-sm mb-4">We'll show relevant practice scenarios</p>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(ROLE_CONFIG).map(([key, role]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedRole(key)
                  setInterviewType(null) // Reset interview type when role changes
                }}
                className={`p-4 rounded-2xl text-left transition-all ${
                  selectedRole === key
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'bg-white/80 hover:bg-white text-gray-800 shadow-sm'
                }`}
              >
                <div className="font-medium text-sm">{role.name}</div>
                <div className={`text-xs mt-1 ${selectedRole === key ? 'text-white/70' : 'text-gray-500'}`}>
                  {role.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Company (optional) */}
        {selectedRole && (
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Target company</h2>
            <p className="text-gray-500 text-sm mb-4">Optional — makes scenarios more realistic</p>

            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Razorpay, Freshworks, Swiggy..."
              className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-violet-300 focus:outline-none text-gray-800 placeholder-gray-400 shadow-sm"
            />
          </div>
        )}

        {/* Step 3: Interview Type */}
        {selectedRole && (
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Practice type</h2>
            <p className="text-gray-500 text-sm mb-4">Choose based on what you need to work on</p>

            <div className="space-y-3">
              {availableTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setInterviewType(type.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${
                    interviewType === type.id
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-white/80 hover:bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{type.name}</div>
                    <div className={`text-sm ${interviewType === type.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {type.desc}
                    </div>
                  </div>
                  <div className={`text-sm px-3 py-1 rounded-full ${interviewType === type.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    5m
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        {interviewType && (
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all animate-fadeIn"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}
