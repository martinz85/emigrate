# Story 9.3: Magic Link Email Branding (Optional)

## Story
**Als** User
**möchte ich** eine gebrandete Magic-Link-E-Mail erhalten
**damit** der Login-Prozess professionell und vertrauenswürdig wirkt

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Supabase Email Template
- [ ] Custom Email Template in Supabase Auth konfiguriert
- [ ] Branding-Farben und Logo
- [ ] Deutsche Texte

### AC2: Template Inhalt
- [ ] Betreff: "Dein Login-Link für die Auswanderer-Plattform"
- [ ] Erklärender Text zum Magic Link
- [ ] CTA-Button für Login
- [ ] Hinweis zur Gültigkeit (1 Stunde)

## Technische Details

### Supabase Dashboard
Im Supabase Dashboard unter **Authentication > Email Templates**:

#### Magic Link Template
```html
<h2>Login zur Auswanderer-Plattform</h2>

<p>Hallo,</p>

<p>klicke auf den Button unten, um dich einzuloggen:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #10B981; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 6px; display: inline-block;">
    Jetzt einloggen
  </a>
</p>

<p>Oder kopiere diesen Link in deinen Browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p><small>Dieser Link ist 1 Stunde gültig. Falls du diesen Login nicht angefordert hast, 
kannst du diese E-Mail ignorieren.</small></p>

<hr>
<p><small>Auswanderer-Plattform | support@auswanderer-plattform.de</small></p>
```

### Email Settings
- **Sender Name**: Auswanderer-Plattform
- **Sender Email**: noreply@auswanderer-plattform.de (nach Domain-Verifizierung)

## Abhängigkeiten
- Supabase Projekt konfiguriert
- Domain-Verifizierung für Custom Sender (optional)

## Schätzung
- **Aufwand**: 30 Minuten
- **Komplexität**: Niedrig

## Notes
- Kann über Supabase Dashboard konfiguriert werden (kein Code nötig)
- Für MVP: Standard Supabase Template ist akzeptabel
- Custom Sender Email benötigt Domain-Verifizierung
- Story ist OPTIONAL für MVP, aber empfohlen für Professionalität

