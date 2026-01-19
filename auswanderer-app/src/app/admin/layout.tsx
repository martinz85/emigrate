import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminHeader } from './components/AdminHeader'

export const metadata = {
  title: 'Admin Dashboard | Auswanderer-Plattform',
  robots: 'noindex, nofollow', // Don't index admin pages
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin-login')
  }

  // Check admin role
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!adminUser) {
    redirect('/dashboard')
  }

  const role = adminUser.role

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminHeader user={user} role={role} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

