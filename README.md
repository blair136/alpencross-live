# Alpencross · Live-Standort

Empfänger-Seite für das Live-Standort-Teilen der Wander-App Alpencross.

Die Seite zeigt die aktuelle Position einer laufenden Wanderung, solange
deren Lese-Token im Link steht (`?t=…`). Ohne Token zeigt sie nichts.
Wird eine angekündigte Rückmeldezeit überschritten, schlägt sie Alarm und
nennt letzte Position, Höhe und die Notrufnummern.

Es liegen hier keine Geheimnisse: Der Supabase-Schlüssel ist der
öffentliche „publishable key", die Tabelle ist per RLS dicht und nur über
drei eng geschnittene Funktionen erreichbar.

## Prüfen

Die Entscheidung, ob die Seite Alarm zeigt oder Entwarnung gibt, liegt in
`urteil.js` — bewusst getrennt von der Anzeige, damit sie ohne Browser
nachrechenbar ist:

```
node --test urteil.test.mjs
```

Das ist die einzige Prüfung dieses Verzeichnisses, und sie deckt genau den
Teil ab, an dem etwas hängt: Stille, Überfälligkeit, verschobene Frist und
der Unterschied zwischen „beendet" und „ausgelaufen".
