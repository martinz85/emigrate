import { createAdminClient } from '@/lib/supabase/server'
import { AdminCard } from './components/AdminCard'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  // Fetch analytics data
  const [
    { count: totalAnalyses },
    { count: paidAnalyses },
    { count: totalUsers },
    { count: newsletterSubs },
  ] = await Promise.all([
    supabase.from('analyses').select('*', { count: 'exact', head: true }),
    supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('paid', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
  ])

  const revenue = (paidAnalyses || 0) * 29.99
  const conversionRate = totalAnalyses 
    ? ((paidAnalyses || 0) / totalAnalyses * 100).toFixed(1)
    : '0'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Übersicht deiner Plattform-KPIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AdminCard
          title="Umsatz (Gesamt)"
          value={`${revenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
          icon="💰"
        />
        <AdminCard
          title="Bezahlte Analysen"
          value={paidAnalyses || 0}
          subtitle={`von ${totalAnalyses || 0} gesamt`}
          icon="✅"
        />
        <AdminCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Bezahlt / Gesamt"
          icon="📈"
        />
        <AdminCard
          title="Newsletter"
          value={newsletterSubs || 0}
          subtitle="Abonnenten"
          icon="📧"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard
          title="Registrierte User"
          value={totalUsers || 0}
          icon="👥"
        />
        <AdminCard
          title="Durchschnittlicher Warenkorbwert"
          value="29,99 €"
          subtitle="Einziges Produkt"
          icon="🛒"
        />
      </div>

      <div className="mt-8 p-6 bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink href="/admin/users" icon="👥" label="User verwalten" />
          <QuickLink href="/admin/discounts" icon="🎟️" label="Rabattcode erstellen" />
          <QuickLink href="/admin/newsletter" icon="📧" label="Newsletter exportieren" />
          <QuickLink href="/admin/prices" icon="💰" label="Preise anpassen" />
        </div>
      </div>

      <div className="mt-6 p-6 bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Content Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink href="/admin/content/sections" icon="📝" label="Texte bearbeiten" />
          <QuickLink href="/admin/content/media" icon="🖼️" label="Media Manager" />
          <QuickLink href="/admin/questions" icon="❓" label="Fragen verwalten" />
          <QuickLink href="/admin/ebooks" icon="📚" label="E-Books verwalten" />
        </div>
      </div>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </a>
  )
}

