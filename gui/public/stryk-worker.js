// Kupongmotorn (stryk-engine.js) i en bakgrundstråd så att sidan går att använda medan kupongerna räknas.
// Testvarianter (?spikx=...) följer med i workerns adress, se VARIANT i motorn.
// onlyDE: bara D/E/F (när A/B/C redan finns och kraven är oförändrade).
import { generateCoupons } from "./stryk-engine.js";

self.onmessage = ({ data: { p, krav, onlyDE, rowsD, rowsE } }) => {
  try {
    self.postMessage({ result: generateCoupons(p, krav, { onlyDE: !!onlyDE, rowsD, rowsE }) });
  } catch (e) {
    self.postMessage({ error: String(e?.message || e) });
  }
};
