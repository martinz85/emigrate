'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
}

interface AdminHeaderProps {
  // Layout header props (legacy)
  user?: User
  role?: string
  // Page header props (new)
  title?: string
  description?: string
  breadcrumbs?: Breadcrumb[]
}

export function AdminHeader({ user, role, title, description, breadcrumbs }: AdminHeaderProps) {
  // If title is provided, render page header style
  if (title) {
    return (
      <div className="space-y-2">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                {crumb.href ? (
                  <Link 
                    href={crumb.href} 
                    className="hover:text-primary-600 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        
        {/* Title and Description */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && (
            <p className="text-slate-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    )
  }

  // Otherwise render layout header style (legacy)
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-slate-800">Admin</span>
        </Link>
        {role && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
            {role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        )}
      </div>
      
      {user && (
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
      )}
    </header>
  )
}

