/* Coquille « Outils techniques EAS » : routage et navigation.
   Routes : #/            accueil
            #/<outil>     outil (onglet par défaut de l'outil)
            #/<outil>/<onglet>  outil sur un onglet donné (ex. #/pertes-de-charge/eau)
   Chaque outil tourne dans son propre iframe (même origine, sans sandbox) :
   CSS, JS global, localStorage et location.hash restent ceux de l'outil.
   Les iframes déjà ouverts sont conservés (masqués) pour garder l'état en cours. */
(function(){
  "use strict";

  var TOOLS = {
    "acoustique":       { name: "Études acoustiques", src: "outils/acoustique.html" },
    "pertes-de-charge": { name: "Pertes de charge",   src: "outils/pertes-de-charge.html" },
    "dimensionnement":  { name: "Dimensionnement Ø",  src: "outils/dimensionnement.html" }
  };
  var APP = "Outils techniques EAS";

  var home = document.getElementById("home");
  var framesBox = document.getElementById("frames");
  var current = document.getElementById("current");
  var links = document.querySelectorAll(".appnav a[data-route]");
  var frames = {};

  function parse(){
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/");
    var id = decodeURIComponent(parts[0] || "");
    var sub = decodeURIComponent(parts.slice(1).join("/") || "");
    return TOOLS[id] ? { id: id, sub: sub } : { id: "", sub: "" };
  }

  /* Garde l'onglet interne de l'outil dans l'adresse de la coquille (adresse partageable) */
  function syncFromFrame(id){
    var f = frames[id];
    if (!f || parse().id !== id) return;
    try {
      var sub = f.contentWindow.location.hash.replace(/^#/, "");
      var want = "#/" + id + (sub ? "/" + sub : "");
      if (location.hash !== want) history.replaceState(null, "", want);
    } catch (e) { /* ne devrait pas arriver en même origine */ }
  }

  function getFrame(id, sub){
    if (frames[id]) return frames[id];
    var f = document.createElement("iframe");
    f.title = TOOLS[id].name;
    f.setAttribute("allow", "clipboard-write");
    f.src = TOOLS[id].src + (sub ? "#" + sub : "");
    f.addEventListener("load", function(){
      try { f.contentWindow.addEventListener("hashchange", function(){ syncFromFrame(id); }); } catch (e) {}
      syncFromFrame(id);
    });
    framesBox.appendChild(f);
    frames[id] = f;
    return f;
  }

  function render(){
    var r = parse();
    links.forEach(function(a){
      if (a.getAttribute("data-route") === r.id) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    if (!r.id){
      home.hidden = false;
      framesBox.hidden = true;
      current.textContent = "";
      document.title = APP;
      return;
    }

    home.hidden = true;
    framesBox.hidden = false;
    current.textContent = TOOLS[r.id].name;
    document.title = TOOLS[r.id].name + " – " + APP;

    var isNew = !frames[r.id];
    var f = getFrame(r.id, r.sub);
    Object.keys(frames).forEach(function(k){ frames[k].hidden = (k !== r.id); });

    if (!isNew && r.sub){
      try {
        if (f.contentWindow.location.hash.replace(/^#/, "") !== r.sub) f.contentWindow.location.hash = r.sub;
      } catch (e) {}
    } else if (!isNew) {
      syncFromFrame(r.id);
    }
    try { f.focus(); } catch (e) {}
  }

  window.addEventListener("hashchange", render);
  render();
})();
