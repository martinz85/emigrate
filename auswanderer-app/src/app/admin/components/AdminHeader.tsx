import Link from 'next/link'
import { User } from '@supabase/supabase-js'

interface AdminHeaderProps {
  user: User
  role: string
}

export function AdminHeader({ user, role }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-slate-800">Admin</span>
        </Link>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
          {role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">
            {user.email}
          </p>
          <p className="text-xs text-slate-500">
            {role}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Zur Website
          </Link>
          
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

