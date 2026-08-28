/*
 * Was die Live-Seite zeigen soll — als reine Entscheidung, ohne Dokument.
 *
 * Diese paar Zeilen sind das Ende der Sicherheitskette: Sie bestimmen, ob
 * zu Hause jemand einen Alarm sieht oder eine Entwarnung. Sie standen
 * mitten in einem 400-Zeilen-Dokument, verschränkt mit `classList`-Aufrufen,
 * und waren dadurch nur im Browser prüfbar — mit Wartezeiten, Leaflet und
 * allem, was daran wackelt. Ein Prüfstand, der flackert, ist schlimmer als
 * keiner; also liegt die Entscheidung jetzt hier, wo Node sie ohne Browser
 * und ohne Zeitfenster nachrechnen kann.
 *
 * Die Anzeige bleibt im Dokument. Hier steht nur, was gilt.
 */
(function (global) {
  'use strict';

  // Die App meldet sich jede Minute, solange sie Empfang hat.
  var STILL_HINWEIS_MIN = 45;   // Funkloch oder mehr — beides nennen.
  var STILL_ALARM_MIN = 150;    // So lange schweigt kein Funkloch mehr.

  // Wer „Teilen beenden" drückt, tut das, während er sendet. Ist das letzte
  // Signal älter, ist die Freigabe nicht beendet, sondern ausgelaufen.
  var BEENDET_FRIST_MIN = 120;

  /**
   * @param p    Zeile aus `live_lesen`, oder null/undefined
   * @param jetztMs        Zeitpunkt der Beurteilung
   * @param letztesSignalMs  zuletzt gesehenes `aktualisiert`, oder null
   * @returns {{zustand:string, alarm:boolean, grund:(string|null),
   *            stillMin:(number|null), ueberMin:(number|null)}}
   */
  function beurteile(p, jetztMs, letztesSignalMs) {
    if (!p) {
      // Keine Zeile heißt zweierlei: beendet oder ausgelaufen. Verwechselt
      // man das, gibt die Seite ausgerechnet dann Entwarnung, wenn seit
      // Stunden nichts mehr kommt.
      var alterMin =
        letztesSignalMs == null ? null : Math.round((jetztMs - letztesSignalMs) / 60000);
      if (alterMin != null && alterMin > BEENDET_FRIST_MIN) {
        return { zustand: 'verfallen', alarm: true, grund: 'verfall', stillMin: alterMin, ueberMin: null };
      }
      return { zustand: 'keine', alarm: false, grund: null, stillMin: alterMin, ueberMin: null };
    }

    var stillMin = Math.round((jetztMs - new Date(p.aktualisiert).getTime()) / 60000);
    var ueberMin = null;
    if (p.zurueck_um) {
      var restMin = Math.round((new Date(p.zurueck_um).getTime() - jetztMs) / 60000);
      if (restMin < 0) ueberMin = -restMin;
    }

    // Überfällig wiegt schwerer als still: Wer die angekündigte Zeit reißt,
    // ist der Fall, für den es die Rückmeldezeit überhaupt gibt.
    if (ueberMin != null) {
      return { zustand: 'unterwegs', alarm: true, grund: 'ueberfaellig', stillMin: stillMin, ueberMin: ueberMin };
    }
    if (stillMin >= STILL_ALARM_MIN) {
      return { zustand: 'unterwegs', alarm: true, grund: 'stille', stillMin: stillMin, ueberMin: null };
    }
    if (stillMin >= STILL_HINWEIS_MIN) {
      return { zustand: 'unterwegs', alarm: false, grund: 'stille-leise', stillMin: stillMin, ueberMin: null };
    }
    return { zustand: 'unterwegs', alarm: false, grund: null, stillMin: stillMin, ueberMin: null };
  }

  var api = {
    beurteile: beurteile,
    STILL_HINWEIS_MIN: STILL_HINWEIS_MIN,
    STILL_ALARM_MIN: STILL_ALARM_MIN,
    BEENDET_FRIST_MIN: BEENDET_FRIST_MIN
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else global.Urteil = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
