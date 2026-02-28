export function FloatingBlob({ className, color = '#E0E7FF' }) {
  return (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path
        fill={color}
        d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,73.1,42.1C64.8,55.1,53.8,66.5,40.4,73.6C27,80.7,11.2,83.5,-3.8,88.8C-18.8,94.2,-37.6,102,-52.6,97.3C-67.6,92.6,-78.8,75.3,-85.4,57.3C-92,39.3,-94,20.7,-91.5,3.5C-89,-13.7,-82,-27.3,-73.3,-39.7C-64.6,-52.1,-54.2,-63.2,-41.6,-71.2C-29,-79.2,-14.5,-84.1,0.6,-85.1C15.7,-86.1,31.4,-83.3,44.7,-76.4Z"
        transform="translate(100 100)"
      />
    </svg>
  )
}

export function FloatingDots() {
  return (
    <>
      <div className="absolute top-20 left-10 w-3 h-3 bg-indigo-400 rounded-full opacity-40 animate-bounce-subtle" />
      <div className="absolute top-40 right-20 w-2 h-2 bg-blue-400 rounded-full opacity-30" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-emerald-400 rounded-full opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-amber-400 rounded-full opacity-30" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-10 w-2 h-2 bg-rose-400 rounded-full opacity-40" />
    </>
  )
}

export function GradientOrb({ className, colors = ['from-indigo-400', 'to-purple-500'] }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-20 bg-gradient-to-br ${colors.join(' ')} ${className}`} />
  )
}

export function LoadingSpinner({ size = 'md', color = 'indigo' }) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <div className={`animate-spin rounded-full border-2 border-${color}-200 border-t-${color}-600 ${sizeClasses[size]}`} />
  )
}

export function ScoreRing({ score, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  
  const getColor = (score) => {
    if (score >= 80) return '#10B981' // emerald
    if (score >= 60) return '#3B82F6' // blue
    if (score >= 40) return '#F59E0B' // amber
    return '#EF4444' // red
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: getColor(score) }}>{score}</span>
      </div>
    </div>
  )
}

export function Badge({ type, children }) {
  const styles = {
    gold: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200',
    silver: 'bg-gradient-to-r from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-200',
    bronze: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-200',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[type] || styles.info}`}>
      {children}
    </span>
  )
}

export function XPBar({ current, max, level }) {
  const percentage = (current / max) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-indigo-600">Level {level}</span>
        <span className="text-gray-500">{current} / {max} XP</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
