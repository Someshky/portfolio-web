import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Home' },
  { to: '/plans', label: 'Plans' },
  { to: '/holdings', label: 'Investments' },
  { to: '/settings', label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-xs font-medium ${
                isActive ? 'text-brand-600' : 'text-slate-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
