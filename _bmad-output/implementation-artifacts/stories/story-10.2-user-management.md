# Story 10.2: User Management (DSGVO)

## Story
**Als** Admin
**möchte ich** User verwalten und auf Anfrage löschen können
**damit** wir DSGVO-konform arbeiten (Art. 17 - Recht auf Löschung)

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: User-Liste
- [ ] Tabelle mit allen Usern (Email, Registrierungsdatum, Anzahl Analysen)
- [ ] Pagination (50 User pro Seite)
- [ ] Such-/Filterung nach Email

### AC2: User-Details
- [ ] Klick auf User zeigt Details
- [ ] Anzahl Analysen, davon bezahlt
- [ ] Letzter Login

### AC3: User löschen (DSGVO Art. 17)
- [ ] "Löschen" Button mit Bestätigungsdialog
- [ ] Löscht: Auth-User, Profil, Analysen
- [ ] Audit-Log-Eintrag (wer hat wann gelöscht)
- [ ] Bestätigungs-Toast nach Löschung

### AC4: Daten-Export (DSGVO Art. 20)
- [ ] "Daten exportieren" Button
- [ ] JSON-Download mit allen User-Daten
- [ ] Analysen, Profil, Käufe

## Technische Details

### API Route: User löschen
```typescript
// src/app/api/admin/users/[id]/route.ts
import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id
  const supabase = createAdminClient()

  // 1. Delete analyses
  await supabase
    .from('analyses')
    .delete()
    .eq('user_id', userId)

  // 2. Delete profile (triggers cascade to auth.users)
  await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  // 3. Delete auth user
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 4. Log deletion (audit trail)
  console.log(`[AUDIT] User ${userId} deleted by admin at ${new Date().toISOString()}`)

  return NextResponse.json({ success: true })
}
```

### User-Liste Komponente
```typescript
// src/app/admin/users/page.tsx
export default async function UsersPage() {
  const supabase = createAdminClient()
  
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      created_at,
      analyses:analyses(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1>User-Verwaltung</h1>
      <UserTable users={users} />
    </div>
  )
}
```

## UI/UX Details
- Rote "Löschen"-Buttons mit Warnung
- Bestätigungsdialog: "Diese Aktion kann nicht rückgängig gemacht werden"
- Toast: "User erfolgreich gelöscht"

## Abhängigkeiten
- Story 10.1 (Admin Auth)
- Supabase Admin Client

## Schätzung
- **Aufwand**: 4 Stunden
- **Komplexität**: Mittel

## Notes
- DSGVO-Löschung muss vollständig sein (keine Soft-Delete für diese Funktion)
- Audit-Log ist Pflicht für Compliance
- Admin darf sich nicht selbst löschen

