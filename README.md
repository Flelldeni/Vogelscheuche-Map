# RDR2 Eventkarte – verbunden mit Supabase

Diese Version verwendet die vom Nutzer gewählte frühere Gesamtkarte und ist bereits mit der Supabase-Projekt-URL und dem **öffentlichen Publishable Key** verbunden.

## Bereits eingerichtet
- `config.js` enthält die öffentliche Projekt-URL und den Publishable Key.
- `app.js` verwendet die **tatsächlich erstellte Tabelle `public.fundorte`** mit `name`, `beschreibung`, `x`, `y`, `erstellt_am`.
- Admin-Prüfung erfolgt über `public.admins` und Supabase Authentication.
- Besucher können Fundorte ansehen, Admins können sich anmelden, Punkte setzen, bearbeiten und löschen.

## Veröffentlichung mit GitHub Pages
1. Neues **öffentliches** Repository `rdr2-event-map` auf github.com erstellen.
2. **Alle Dateien aus diesem ZIP direkt in die oberste Ebene** des Repositorys hochladen (`index.html`, `app.js`, `config.js`, `gesamtkarte.webp` usw.). Nicht die ZIP selbst hochladen.
3. `Settings` → `Pages` → `Build and deployment` → `Deploy from a branch` → Branch `main`, Folder `/(root)` → `Save`.
4. Nach der Bereitstellung die veröffentlichte URL öffnen, `Admin-Login` klicken und mit dem Supabase-Authentication-Benutzer anmelden.

## Sicherheit
Die Supabase-Tabellen müssen Row Level Security (RLS) aktiviert haben. `public.fundorte` muss öffentliche SELECT-Policies und INSERT/UPDATE/DELETE-Policies ausschließlich für die in `public.admins` eingetragenen Auth-Benutzer haben. Die Datenbankregeln wurden zuvor im Chat eingerichtet. Ein öffentlicher Publishable Key ist normal und kein Admin-Passwort. Niemals Service-Role/Secret Keys oder Passwörter ins Repository hochladen.

## Hinweise
- Die Karte ist eine aus Screenshots zusammengesetzte Bilddatei; Übergänge können optische Abweichungen enthalten.
- Diese Version setzt neue Fundorte auf der **Gesamtkarte**. Die bisherige Datenbank war laut Gespräch neu und leer.
- Die im ZIP enthaltenen älteren `supabase.sql` und `migration.sql` stammen aus dem ursprünglichen Projekt und sollen **nicht erneut ausgeführt** werden. Es gilt die bereits im Chat erstellte Tabelle `fundorte`.
