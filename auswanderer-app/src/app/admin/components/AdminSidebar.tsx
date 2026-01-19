'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/users', label: 'User', icon: '👥' },
  { href: '/admin/prices', label: 'Preise', icon: '💰' },
  { href: '/admin/discounts', label: 'Rabattcodes', icon: '🎟️' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  { href: '/admin/ai-settings', label: 'AI-Provider', icon: '🤖' },
  { href: '/admin/settings', label: 'Einstellungen', icon: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r border-slate-200">
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    'hover:bg-slate-100',
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 font-medium' 
                      : 'text-slate-600'
                  )}
                >
                  <span className="text-xl" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-500">
          Admin Dashboard v1.0
        </p>
      </div>
    </aside>
  )
}

