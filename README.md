# Alpencross · Live-Standort

Empfänger-Seite für das Live-Standort-Teilen der Wander-App Alpencross.

Die Seite zeigt die aktuelle Position einer laufenden Wanderung, solange
deren Lese-Token im Link steht (`?t=…`). Ohne Token zeigt sie nichts.
Wird eine angekündigte Rückmeldezeit überschritten, schlägt sie Alarm und
nennt letzte Position, Höhe und die Notrufnummern.

Es liegen hier keine Geheimnisse: Der Supabase-Schlüssel ist der
öffentliche „publishable key", die Tabelle ist per RLS dicht und nur über
drei eng geschnittene Funktionen erreichbar.
