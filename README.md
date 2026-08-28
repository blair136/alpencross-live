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
node --test urteil.test.mjs gelaende.test.mjs
```

`urteil.js` deckt die Live-Seite ab: Stille, Überfälligkeit, verschobene
Frist und der Unterschied zwischen „beendet" und „ausgelaufen".
`gelaende.js` deckt die geteilte Tour ab: wann Steilheit genannt wird,
wann hervorgehoben — und wann eine halb geprüfte Strecke als ungeprüft
dastehen muss statt als flach.

Beide Dateien liegen getrennt von der Anzeige, damit genau die Stellen
ohne Browser nachrechenbar sind, an denen etwas hängt.
