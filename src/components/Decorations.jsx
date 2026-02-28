export function FloatingBlob({ className, color = '#FED7AA' }) {
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
      <div className="absolute top-20 left-10 w-4 h-4 bg-violet-400 rounded-full opacity-60" />
      <div className="absolute top-40 right-20 w-3 h-3 bg-rose-400 rounded-full opacity-50" />
      <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-emerald-400 rounded-full opacity-70" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-amber-400 rounded-full opacity-40" />
      <div className="absolute bottom-1/4 right-10 w-2 h-2 bg-blue-400 rounded-full opacity-50" />
    </>
  )
}
