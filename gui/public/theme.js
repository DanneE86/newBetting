// Temaväljare: Ljust / Mörkt / Auto (följer systemet). Laddas synkront i <head> så att rätt tema
// sätts innan sidan ritas (ingen ljus blinkning i mörkt läge). Valet sparas i webbläsaren.
(function () {
  var KEY = "betting-theme";
  var THEMES = ["light", "dark", "auto"];

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return THEMES.indexOf(v) >= 0 ? v : "auto";
    } catch (e) {
      return "auto";
    }
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var buttons = document.querySelectorAll(".theme-switch [data-theme-choice]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(buttons[i].getAttribute("data-theme-choice") === theme));
    }
  }

  apply(stored());

  document.addEventListener("DOMContentLoaded", function () {
    apply(stored());
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest(".theme-switch [data-theme-choice]");
      if (!btn) return;
      var theme = btn.getAttribute("data-theme-choice");
      try { localStorage.setItem(KEY, theme); } catch (err) { /* privat läge: gäller bara den här visningen */ }
      apply(theme);
    });
  });
})();
