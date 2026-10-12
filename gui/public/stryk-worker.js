// Kupongmotorn (stryk-engine.js) i en bakgrundstråd så att sidan går att använda medan kupongerna räknas.
import { generateCoupons } from "./stryk-engine.js";

self.onmessage = ({ data: { p, krav } }) => {
  try {
    self.postMessage({ result: generateCoupons(p, krav) });
  } catch (e) {
    self.postMessage({ error: String(e?.message || e) });
  }
};
