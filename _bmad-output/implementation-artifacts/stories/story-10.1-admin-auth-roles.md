# Story 10.1: Admin Auth & Roles

## Story
**Als** Plattform-Betreiber
**möchte ich** einen geschützten Admin-Bereich mit Rollen
**damit** nur autorisierte Nutzer auf sensible Daten zugreifen können

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Admin-Tabelle bereits vorhanden
- [x] `admin_users` Tabelle existiert (Epic 6)
- [ ] Admin-User kann manuell hinzugefügt werden
- [ ] Rollen: `admin`, `super_admin`

### AC2: Admin Layout
- [ ] `/admin` Route mit eigenem Layout
- [ ] Sidebar-Navigation
- [ ] Header mit User-Info und Logout

### AC3: Route Protection
- [ ] Middleware prüft Admin-Rolle (bereits implementiert in Epic 6)
- [ ] Nicht-Admins werden zu `/dashboard` redirected
- [ ] 403-Seite für unberechtigte Zugriffe

## Technische Details

### Admin hinzufügen (SQL)
```sql
-- In Supabase Dashboard > SQL Editor
INSERT INTO public.admin_users (id, role)
VALUES ('USER_UUID_FROM_AUTH', 'super_admin');
```

### Dateistruktur
```
src/app/admin/
├── layout.tsx        # Admin Layout mit Sidebar
├── page.tsx          # Dashboard Overview
├── users/
│   └── page.tsx      # User Management
├── prices/
│   └── page.tsx      # Price Management
├── discounts/
│   └── page.tsx      # Discount Codes
├── newsletter/
│   └── page.tsx      # Newsletter Export
└── components/
    ├── AdminSidebar.tsx
    ├── AdminHeader.tsx
    └── AdminCard.tsx
```

### Admin Layout
```typescript
// src/app/admin/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminHeader } from './components/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin')
  }

  // Check admin role
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminHeader user={user} role={adminUser.role} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Abhängigkeiten
- Epic 6 (Supabase Auth) ✅
- `admin_users` Tabelle ✅

## Schätzung
- **Aufwand**: 2 Stunden
- **Komplexität**: Niedrig

## Notes
- Middleware bereits in Epic 6 implementiert
- Admin-User muss manuell in DB hinzugefügt werden
- Keine Self-Service Admin-Registrierung (Sicherheit)

