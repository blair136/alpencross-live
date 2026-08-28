import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const { beurteile, STILL_ALARM_MIN, BEENDET_FRIST_MIN } = createRequire(import.meta.url)('./urteil.js');

const JETZT = Date.parse('2026-08-28T12:00:00Z');
const vor = (min) => new Date(JETZT - min * 60000).toISOString();
const nach = (min) => new Date(JETZT + min * 60000).toISOString();
const zeile = (o = {}) => ({ lat: 47.1, lng: 10.2, ele: 2100, gestartet: vor(300), aktualisiert: vor(1), zurueck_um: null, ...o });

test('frisches Signal ohne Frist ist ruhig', () => {
  const u = beurteile(zeile(), JETZT, null);
  assert.equal(u.alarm, false);
  assert.equal(u.grund, null);
});

test('lange Stille schlägt Alarm — auch ohne angekündigte Rückkehr', () => {
  assert.equal(beurteile(zeile({ aktualisiert: vor(STILL_ALARM_MIN - 1) }), JETZT, null).alarm, false);
  const u = beurteile(zeile({ aktualisiert: vor(STILL_ALARM_MIN) }), JETZT, null);
  assert.equal(u.alarm, true);
  assert.equal(u.grund, 'stille');
});

test('und der Alarm endet, sobald wieder etwas ankommt', () => {
  /*
   Der Fehler, um den es ging: Weggeräumt wurde der Alarm nur im Zweig mit
   Rückmeldezeit. Wer ohne teilte, behielt den roten Kasten für immer — und
   ein Fehlalarm bringt dem Empfänger bei, den nächsten zu ignorieren.
  */
  assert.equal(beurteile(zeile({ aktualisiert: vor(180) }), JETZT, null).alarm, true);
  assert.equal(beurteile(zeile({ aktualisiert: vor(1) }), JETZT, null).alarm, false);
});

test('überfällig schlägt Alarm und nennt die Verspätung', () => {
  const u = beurteile(zeile({ zurueck_um: vor(30) }), JETZT, null);
  assert.equal(u.alarm, true);
  assert.equal(u.grund, 'ueberfaellig');
  assert.equal(u.ueberMin, 30);
});

test('eine verschobene Frist räumt den Alarm wieder weg', () => {
  assert.equal(beurteile(zeile({ zurueck_um: vor(30) }), JETZT, null).alarm, true);
  assert.equal(beurteile(zeile({ zurueck_um: nach(120) }), JETZT, null).alarm, false);
});

test('überfällig wiegt schwerer als frisch gemeldet', () => {
  // Wer sendet, aber die Zeit gerissen hat, bleibt der Fall, für den es
  // die Rückmeldezeit gibt.
  const u = beurteile(zeile({ aktualisiert: vor(1), zurueck_um: vor(5) }), JETZT, null);
  assert.equal(u.grund, 'ueberfaellig');
});

test('beendetes Teilen gibt keine Warnung', () => {
  const u = beurteile(null, JETZT, JETZT - 60_000);
  assert.equal(u.zustand, 'keine');
  assert.equal(u.alarm, false);
});

test('ausgelaufene Freigabe nach langer Stille gibt keine Entwarnung', () => {
  /*
   `!p` heißt zweierlei. Die Seite sagte in beiden Fällen „Die Wanderung
   ist beendet" — auch für jemanden, dessen Telefon seit Stunden schweigt.
  */
  const u = beurteile(null, JETZT, JETZT - (BEENDET_FRIST_MIN + 1) * 60000);
  assert.equal(u.zustand, 'verfallen');
  assert.equal(u.alarm, true);
  assert.equal(u.grund, 'verfall');
});

test('ohne Gedächtnis bleibt die Seite bei der schwächeren Aussage', () => {
  // Wer den Link erstmals nach Ablauf öffnet, hat kein letztes Signal
  // gesehen. Dann darf die Seite nichts behaupten, was sie nicht weiß.
  const u = beurteile(null, JETZT, null);
  assert.equal(u.zustand, 'keine');
  assert.equal(u.alarm, false);
});
