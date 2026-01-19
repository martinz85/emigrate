# Story 11.1: Audit Logs Persistierung

## Story
**Als** Plattform-Betreiber
**möchte ich** alle Admin-Aktionen in einer Datenbank-Tabelle protokollieren
**damit** DSGVO-Anforderungen für Nachweisbarkeit erfüllt sind

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Audit Logs Tabelle
- [ ] Neue `audit_logs` Tabelle in Supabase
- [ ] Felder: action, target_id, admin_id, timestamp, metadata
- [ ] RLS: Nur Admins können lesen, System kann schreiben

### AC2: Audit Log Utility
- [ ] `logAuditEvent()` Funktion in `src/lib/audit/`
- [ ] Typisierte Actions (USER_DELETED, USER_EXPORTED, DISCOUNT_CREATED, etc.)

### AC3: Integration
- [ ] User-Löschung loggen
- [ ] User-Export loggen
- [ ] Discount-Erstellung/Löschung loggen

## Technische Details

### Migration
```sql
-- auswanderer-app/supabase/migrations/003_audit_logs.sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  admin_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- System kann via service_role schreiben (keine Policy nötig)
```

### Utility
```typescript
// src/lib/audit/index.ts
import { createAdminClient } from '@/lib/supabase/server'

type AuditAction = 
  | 'USER_DELETED'
  | 'USER_EXPORTED'
  | 'DISCOUNT_CREATED'
  | 'DISCOUNT_DELETED'
  | 'NEWSLETTER_EXPORTED'

interface AuditLogEntry {
  action: AuditAction
  targetId?: string
  targetType?: string
  adminId: string
  metadata?: Record<string, unknown>
}

export async function logAuditEvent(entry: AuditLogEntry) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      action: entry.action,
      target_id: entry.targetId,
      target_type: entry.targetType,
      admin_id: entry.adminId,
      metadata: entry.metadata,
    })

  if (error) {
    console.error('[Audit] Failed to log event:', error)
  }
}
```

## Abhängigkeiten
- Supabase Admin Client

## Schätzung
- **Aufwand**: 1 Stunde
- **Komplexität**: Niedrig

