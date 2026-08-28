import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const G = createRequire(import.meta.url)('./gelaende.js');
const { gelaendeHinweis, STEIL_AB_GRAD, ZU_WENIG, VOLLSTAENDIG } = G;

test('flache, ganz geprüfte Etappe sagt nichts', () => {
  assert.equal(gelaendeHinweis({ sm: 18, ss: 0, sg: 100 }), null);
});

test('steiles Gelände wird genannt', () => {
  const h = gelaendeHinweis({ sm: STEIL_AB_GRAD, ss: 4, sg: 100 });
  assert.equal(h.stufe, 'steil');
  assert.match(h.text, /30° steil/);
  assert.match(h.text, /Lagebericht/);
});

test('erst ab 35° hervorgehoben', () => {
  assert.equal(gelaendeHinweis({ sm: 34, ss: 5, sg: 100 }).deutlich, false);
  assert.equal(gelaendeHinweis({ sm: 35, ss: 5, sg: 100 }).deutlich, true);
});

test('ein kleiner Steilanteil bekommt keinen eigenen Satz', () => {
  assert.doesNotMatch(gelaendeHinweis({ sm: 40, ss: 15, sg: 100 }).text, /% der Strecke in Hängen/);
  assert.match(gelaendeHinweis({ sm: 40, ss: 16, sg: 100 }).text, /16 % der Strecke in Hängen/);
});

test('eine ganz geprüfte Strecke nennt keine Prüfquote', () => {
  assert.doesNotMatch(gelaendeHinweis({ sm: 40, ss: 20, sg: VOLLSTAENDIG }).text, /Geprüft/);
  assert.match(gelaendeHinweis({ sm: 40, ss: 20, sg: VOLLSTAENDIG - 1 }).text, /Geprüft: 97 %/);
});

test('nichts gefunden bei halb geprüfter Strecke ist ein Hinweis, keine Entwarnung', () => {
  /*
   Der gefährlichste Fall. Ohne diesen Zweig liest sich das Schweigen der
   Seite wie „flach" — obwohl in Wahrheit die Hälfte nie angesehen wurde.
  */
  const h = gelaendeHinweis({ sm: 12, ss: 0, sg: ZU_WENIG - 1 });
  assert.equal(h.stufe, 'luecke');
  assert.match(h.text, /nicht als flach belegt/);
  // Und die Gegenprobe: knapp darüber schweigt sie wieder.
  assert.equal(gelaendeHinweis({ sm: 12, ss: 0, sg: ZU_WENIG }), null);
});

test('ältere Links ohne Geländefelder ändern nichts', () => {
  assert.equal(gelaendeHinweis({ k: 7.7, u: 980 }), null);
  assert.equal(gelaendeHinweis(null), null);
  // Halbe Angaben zählen nicht als Angabe.
  assert.equal(gelaendeHinweis({ sm: 40 }), null);
});
