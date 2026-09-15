const STACK = ['React', 'FastAPI', 'PyTorch', 'ResNet18', 'SQLite']

export default function TechBadges() {
  return (
    <div className="tech-badges">
      {STACK.map((name) => (
        <span key={name} className="tech-badge">
          {name}
        </span>
      ))}
    </div>
  )
}
