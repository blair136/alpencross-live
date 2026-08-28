/*
 * Was über das Gelände einer geteilten Etappe dasteht.
 *
 * Die Seite nannte Strecke und Höhenmeter. Wer eingeladen wird, ist oft der
 * Unerfahrenere — und erfuhr nichts darüber, worauf er sich einlässt. Der
 * Nutzer-Research nennt Hangneigungs-Overlays als unverzichtbar und
 * beschreibt die Kausalkette: Werkzeuge, die Machbarkeit suggerieren,
 * verleiten dazu, Gelände zu planen, dem man nicht gewachsen ist.
 *
 * Drei Zahlen kommen aus der App, jede mit einem Zweck:
 *   sm  größte gefundene Hangneigung in Grad
 *   ss  Anteil der Strecke in Hängen ab 30°, in Prozent
 *   sg  wie viel der Strecke geprüft werden konnte, in Prozent
 *
 * Die dritte ist die wichtigste. Ohne sie sieht eine Auskunft über ein
 * Drittel der Tour aus wie eine über die ganze — und „nichts Steiles
 * gefunden" wird zur gefährlichsten Auskunft, die diese Seite geben kann.
 *
 * Die Schwellen stehen genauso in der App (`src/app/index.tsx`, Anzeige der
 * Steilheit). Sie hier noch einmal zu führen ist der Preis dafür, dass die
 * Seite ohne die App auskommt; wer eine ändert, muss die andere mitnehmen.
 */
(function (global) {
  'use strict';

  var STEIL_AB_GRAD = 30;      // ab hier lawinenfähiges Gelände
  var DEUTLICH_GRAD = 35;      // ab hier hervorgehoben
  var NENNENSWERT_ANTEIL = 15; // darunter ist der Anteil kein eigener Satz
  var VOLLSTAENDIG = 98;       // darüber gilt die Strecke als ganz geprüft
  var ZU_WENIG = 80;           // darunter ist „nichts gefunden" wertlos

  function gradSatz(e) {
    var teile = ['Gelände bis ' + e.sm + '° steil'];
    if (e.ss > NENNENSWERT_ANTEIL) {
      teile.push(e.ss + ' % der Strecke in Hängen ab ' + STEIL_AB_GRAD + '°');
    }
    var satz = teile.join(' · ') + ' — im Winter lawinenrelevant. Lagebericht prüfen.';
    if (e.sg < VOLLSTAENDIG) {
      // Eine Auskunft über einen Teil der Tour darf nicht aussehen wie eine
      // über die ganze.
      satz += ' Geprüft: ' + e.sg + ' % der Strecke.';
    }
    return satz;
  }

  /**
   * @param e Etappe aus der geteilten Planung
   * @returns {{stufe:string, text:string, deutlich:boolean}|null}
   */
  function gelaendeHinweis(e) {
    if (!e || typeof e.sm !== 'number' || typeof e.sg !== 'number') return null;
    var ss = typeof e.ss === 'number' ? e.ss : 0;
    if (e.sm >= STEIL_AB_GRAD) {
      return {
        stufe: 'steil',
        text: gradSatz({ sm: e.sm, ss: ss, sg: e.sg }),
        deutlich: e.sm >= DEUTLICH_GRAD
      };
    }
    if (e.sg < ZU_WENIG) {
      return {
        stufe: 'luecke',
        text: 'Steilheit nur für ' + e.sg + ' % der Strecke geprüft — für den Rest ' +
          'fehlte dem Planer das Höhenmodell. Diese Etappe ist also nicht als ' +
          'flach belegt, sondern ungeprüft.',
        deutlich: false
      };
    }
    return null;
  }

  var api = {
    gelaendeHinweis: gelaendeHinweis,
    STEIL_AB_GRAD: STEIL_AB_GRAD,
    DEUTLICH_GRAD: DEUTLICH_GRAD,
    NENNENSWERT_ANTEIL: NENNENSWERT_ANTEIL,
    VOLLSTAENDIG: VOLLSTAENDIG,
    ZU_WENIG: ZU_WENIG
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else global.Gelaende = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
