// ─── Router ───────────────────────────────────────────────────────────────────

function route() {
  const hash = location.hash.replace("#", "") || "tijdlijn";
  const parts = hash.split("/");
  const view = parts[0];
  const app = document.getElementById("app");

  switch (view) {
    case "tijdlijn":
      app.innerHTML = renderShell(renderTijdlijn(), false);
      break;
    case "nu":
      app.innerHTML = renderShell(renderNu(), false);
      break;
    case "kaart":
      app.innerHTML = renderShell(renderKaart(), false);
      initKaart();
      return; // geen scrollTo — kaart heeft volledige hoogte nodig
    case "locatie":
      app.innerHTML = renderShell(renderLocatieDetail(parts[1], parts[2] || "info"), true);
      break;
    default:
      app.innerHTML = renderShell(renderTijdlijn(), false);
  }

  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
window.addEventListener("load", route);

// ─── Datum helpers ────────────────────────────────────────────────────────────

function vandaag() {
  return new Date().toISOString().slice(0, 10);
}

function getHuidigeLocatie() {
  const t = vandaag();
  return REIS.locaties.find((l) => l.datums.aankomst <= t && t < l.datums.vertrek);
}

function getVolgendeLocatie() {
  const t = vandaag();
  return REIS.locaties.find((l) => l.datums.aankomst > t);
}

function getLocatie(id) {
  return REIS.locaties.find((l) => l.id === id);
}

function dagenverschil(van, naar) {
  return Math.round((new Date(naar) - new Date(van)) / 86400000);
}

function formatDatum(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatDatumLang(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTijd(iso) {
  return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

function formatDatumTijd(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) +
    " om " +
    d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
  );
}

function locatieStatus(loc) {
  const t = vandaag();
  if (t >= loc.datums.aankomst && t < loc.datums.vertrek) return "huidig";
  if (t >= loc.datums.vertrek) return "verleden";
  return "toekomst";
}

function vervoerIcon(type) {
  const icons = { vlucht: "✈️", ferry: "⛴️", auto: "🚗", bus: "🚌", trein: "🚂" };
  return icons[type] || "🚌";
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function renderShell(inhoud, isDetail) {
  const hash = location.hash.replace("#", "").split("/")[0] || "tijdlijn";
  return `
    <header class="app-header">
      ${
        isDetail
          ? `<a href="#tijdlijn" class="terug-knop">‹ Terug</a>`
          : `<span class="header-titel">${REIS.meta.titel}</span>`
      }
    </header>
    <main class="hoofd-inhoud">${inhoud}</main>
    <nav class="bottom-nav">
      <a href="#tijdlijn" class="nav-item ${hash === "tijdlijn" ? "actief" : ""}">
        <span class="nav-icoon">📅</span>
        <span class="nav-label">Tijdlijn</span>
      </a>
      <a href="#nu" class="nav-item ${hash === "nu" ? "actief" : ""}">
        <span class="nav-icoon">📍</span>
        <span class="nav-label">Nu</span>
      </a>
      <a href="#kaart" class="nav-item ${hash === "kaart" ? "actief" : ""}">
        <span class="nav-icoon">🗺️</span>
        <span class="nav-label">Kaart</span>
      </a>
    </nav>
  `;
}

// ─── Tijdlijn ─────────────────────────────────────────────────────────────────

function renderTijdlijn() {
  const kaarten = REIS.locaties
    .map((loc) => {
      const status = locatieStatus(loc);
      const nachten = dagenverschil(loc.datums.aankomst, loc.datums.vertrek);
      return `
        <a href="#locatie/${loc.id}" class="locatie-kaart ${status}">
          <span class="kaart-emoji">${loc.emoji}</span>
          <div class="kaart-inhoud">
            <div class="kaart-rij-1">
              <span class="kaart-stad">${loc.stad}</span>
              ${status === "huidig" ? `<span class="badge-huidig">JE BENT HIER</span>` : ""}
              ${status === "verleden" ? `<span class="badge-verleden">Geweest</span>` : ""}
            </div>
            <span class="kaart-hotel">${loc.hotel.naam}</span>
            <span class="kaart-datums">${formatDatum(loc.datums.aankomst)} → ${formatDatum(loc.datums.vertrek)} · ${nachten} nachten</span>
          </div>
          <span class="kaart-pijl">›</span>
        </a>
      `;
    })
    .join("");
  return `<div class="tijdlijn">${kaarten}</div>`;
}

// ─── Nu scherm ────────────────────────────────────────────────────────────────

function renderNu() {
  const huidig = getHuidigeLocatie();
  const volgend = getVolgendeLocatie();
  const t = vandaag();

  if (!huidig && !volgend) {
    return `
      <div class="nu-leeg">
        <div class="nu-groot-emoji">🏠</div>
        <h2>Welkom thuis!</h2>
        <p>De reis is voorbij. Hopelijk was het fantastisch.</p>
      </div>`;
  }

  if (!huidig && volgend) {
    const dagenTot = dagenverschil(t, volgend.datums.aankomst);
    return `
      <div class="nu-leeg">
        <div class="nu-groot-emoji">✈️</div>
        <h2>Nog ${dagenTot} ${dagenTot === 1 ? "dag" : "dagen"} tot vertrek!</h2>
        <p>Eerste bestemming: <strong>${volgend.stad}</strong></p>
        <a href="#locatie/${volgend.id}" class="knop-primair">Bekijk details →</a>
      </div>`;
  }

  const dagenNog = dagenverschil(t, huidig.datums.vertrek);
  const v = huidig.vervoer;

  return `
    <div class="nu-scherm">
      <div class="nu-top">
        <div class="nu-emoji">${huidig.emoji}</div>
        <h1 class="nu-stad">${huidig.stad}</h1>
        <p class="nu-land">${huidig.land}</p>
        <p class="nu-teller">
          ${dagenNog === 0 ? "Vandaag is het vertrekdag!" : `Nog ${dagenNog} ${dagenNog === 1 ? "dag" : "dagen"} hier`}
        </p>
      </div>

      <div class="nu-blokken">
        <div class="nu-blok">
          <h3>🏨 Hotel</h3>
          <p><strong>${huidig.hotel.naam}</strong></p>
          <p>Check-out: <strong>${huidig.hotel.checkOut}</strong> op ${formatDatum(huidig.datums.vertrek)}</p>
          ${huidig.hotel.boekingsnummer !== "VUL-IN" ? `<p class="nu-ref">Boeking: ${huidig.hotel.boekingsnummer}</p>` : ""}
          ${huidig.hotel.opmerkingen ? `<p class="nu-opmerking">💡 ${huidig.hotel.opmerkingen}</p>` : ""}
        </div>

        ${
          v?.vertrek
            ? `
          <div class="nu-blok">
            <h3>${vervoerIcon(v.vertrek.type)} Volgende reis</h3>
            ${v.vertrek.vluchtnummer && v.vertrek.vluchtnummer !== "VLUCHT-NR" ? `<p><strong>Vlucht ${v.vertrek.vluchtnummer}</strong></p>` : ""}
            <p>Naar: <strong>${v.vertrek.naar}</strong></p>
            ${v.vertrek.vertrekTijd ? `<p>Vertrek: <strong>${formatTijd(v.vertrek.vertrekTijd)}</strong> op ${formatDatum(huidig.datums.vertrek)}</p>` : ""}
            ${v.vertrek.opmerkingen ? `<p class="nu-opmerking">💡 ${v.vertrek.opmerkingen}</p>` : ""}
          </div>`
            : ""
        }
      </div>

      <div class="nu-acties">
        <a href="#locatie/${huidig.id}/activiteiten" class="knop-primair">🗺️ Activiteiten in ${huidig.stad}</a>
        <a href="#locatie/${huidig.id}/restaurants" class="knop-secundair">🍽️ Restaurants in ${huidig.stad}</a>
        <a href="#locatie/${huidig.id}" class="knop-ghost">Hotel & vervoer →</a>
        ${volgend ? `<a href="#locatie/${volgend.id}" class="knop-ghost">Volgende stop: ${volgend.emoji} ${volgend.stad} →</a>` : ""}
      </div>
    </div>
  `;
}

// ─── Locatie detail ───────────────────────────────────────────────────────────

function renderLocatieDetail(id, tab) {
  const loc = getLocatie(id);
  if (!loc) return `<p class="fout-bericht">Locatie niet gevonden.</p>`;
  const status = locatieStatus(loc);
  const nachten = dagenverschil(loc.datums.aankomst, loc.datums.vertrek);

  const tabs = [
    { id: "info", label: "🏨 Hotel & Reis" },
    { id: "activiteiten", label: "🗺️ Activiteiten" },
    { id: "restaurants", label: "🍽️ Restaurants" },
  ];

  const tabNav = `
    <div class="tab-nav">
      ${tabs.map((t) => `<a href="#locatie/${id}/${t.id}" class="tab-item ${tab === t.id ? "actief" : ""}">${t.label}</a>`).join("")}
    </div>`;

  let tabInhoud = "";
  if (tab === "activiteiten") tabInhoud = renderActiviteitenTab(loc);
  else if (tab === "restaurants") tabInhoud = renderRestaurantsTab(loc);
  else tabInhoud = renderInfoTab(loc);

  return `
    <div class="detail-header ${status}">
      <div class="detail-emoji">${loc.emoji}</div>
      <h1 class="detail-stad">${loc.stad}</h1>
      <p class="detail-sub">${loc.land} · ${nachten} nachten</p>
      <p class="detail-datums">${formatDatumLang(loc.datums.aankomst)} t/m ${formatDatumLang(loc.datums.vertrek)}</p>
      ${status === "huidig" ? `<span class="badge-huidig-groot">JE BENT HIER</span>` : ""}
    </div>
    ${tabNav}
    <div class="tab-inhoud">${tabInhoud}</div>
  `;
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

function renderInfoTab(loc) {
  const h = loc.hotel;
  const v = loc.vervoer;

  function rijen(data) {
    return data
      .filter((r) => r.waarde)
      .map(
        (r) => `
        <div class="info-rij">
          <span class="info-label">${r.label}</span>
          ${
            r.link
              ? `<a href="${r.link}" target="_blank" class="info-waarde link">${r.waarde}</a>`
              : `<span class="info-waarde ${r.mono ? "mono" : ""}">${r.waarde}</span>`
          }
        </div>`
      )
      .join("");
  }

  return `
    <section class="sectie">
      <h2 class="sectie-titel">🏨 Hotel</h2>
      <div class="info-kaart">
        <p class="info-naam">${h.naam}</p>
        <div class="info-rijen">
          ${rijen([
            { label: "Adres", waarde: h.adres, link: h.mapsUrl },
            { label: "Check-in", waarde: `${h.checkIn} op ${formatDatum(loc.datums.aankomst)}` },
            { label: "Check-out", waarde: `${h.checkOut} op ${formatDatum(loc.datums.vertrek)}` },
            { label: "Boeking", waarde: h.boekingsnummer !== "VUL-IN" ? h.boekingsnummer : null, mono: true },
            { label: "Bron", waarde: h.bron },
            { label: "Telefoon", waarde: h.telefoon, link: `tel:${h.telefoon}` },
          ])}
        </div>
        ${h.opmerkingen ? `<p class="info-opmerking">💡 ${h.opmerkingen}</p>` : ""}
        <a href="${h.mapsUrl}" target="_blank" class="knop-kaart">📍 Open in Maps</a>
      </div>
    </section>

    ${
      v?.aankomst
        ? `
      <section class="sectie">
        <h2 class="sectie-titel">${vervoerIcon(v.aankomst.type)} Aankomst</h2>
        <div class="info-kaart">
          ${rijen([
            { label: "Van", waarde: v.aankomst.van },
            { label: "Vlucht", waarde: v.aankomst.vluchtnummer !== "VLUCHT-NR" ? v.aankomst.vluchtnummer : null, mono: true },
            { label: "Terminal", waarde: v.aankomst.terminal },
            { label: "Aankomst", waarde: v.aankomst.aankomstTijd ? formatDatumTijd(v.aankomst.aankomstTijd) : null },
            { label: "Referentie", waarde: v.aankomst.boekingsnummer !== "VLUCHT-REF" ? v.aankomst.boekingsnummer : null, mono: true },
          ])}
          ${v.aankomst.opmerkingen ? `<p class="info-opmerking">💡 ${v.aankomst.opmerkingen}</p>` : ""}
        </div>
      </section>`
        : ""
    }

    ${
      v?.vertrek
        ? `
      <section class="sectie">
        <h2 class="sectie-titel">${vervoerIcon(v.vertrek.type)} Vertrek</h2>
        <div class="info-kaart">
          ${rijen([
            { label: "Naar", waarde: v.vertrek.naar },
            { label: "Vlucht", waarde: v.vertrek.vluchtnummer !== "VLUCHT-NR" ? v.vertrek.vluchtnummer : null, mono: true },
            { label: "Terminal", waarde: v.vertrek.terminal },
            { label: "Vertrek", waarde: v.vertrek.vertrekTijd ? formatDatumTijd(v.vertrek.vertrekTijd) : null },
            { label: "Referentie", waarde: v.vertrek.boekingsnummer !== "VLUCHT-REF" ? v.vertrek.boekingsnummer : null, mono: true },
          ])}
          ${v.vertrek.opmerkingen ? `<p class="info-opmerking">💡 ${v.vertrek.opmerkingen}</p>` : ""}
        </div>
      </section>`
        : ""
    }
  `;
}

// ─── Activiteiten tab ─────────────────────────────────────────────────────────

const CATEGORIE_ICOON = {
  bezienswaardigheden: "🏛️",
  eten: "🍽️",
  natuur: "🌿",
  winkelen: "🛍️",
  cultuur: "🎭",
  avontuur: "🧗",
};

function renderActiviteitenTab(loc) {
  if (!loc.activiteiten?.length) return `<p class="leeg">Nog geen activiteiten toegevoegd.</p>`;
  return `
    <div class="activiteiten-lijst">
      ${loc.activiteiten
        .map(
          (act) => `
        <div class="activiteit-kaart">
          <div class="act-icoon">${CATEGORIE_ICOON[act.categorie] || "📌"}</div>
          <div class="act-inhoud">
            <h3 class="act-naam">${act.naam}</h3>
            <div class="chips">
              ${act.duur ? `<span class="chip">⏱️ ${act.duur}</span>` : ""}
              ${act.kosten ? `<span class="chip">💰 ${act.kosten}</span>` : ""}
            </div>
            ${act.tip ? `<p class="act-tip">${act.tip}</p>` : ""}
            ${act.mapsUrl ? `<a href="${act.mapsUrl}" target="_blank" class="knop-kaart klein">📍 Open in Maps</a>` : ""}
          </div>
        </div>`
        )
        .join("")}
    </div>`;
}

// ─── Restaurants tab ──────────────────────────────────────────────────────────

const SFEER_ICOON = {
  "fine dining": "👨‍🍳",
  authentiek: "🥘",
  lokaal: "🏪",
  casual: "🍴",
  historisch: "🏛️",
  romantisch: "🕯️",
  overig: "🍴",
};

const SFEER_VOLGORDE = ["fine dining", "romantisch", "authentiek", "lokaal", "historisch", "casual", "overig"];

function renderRestaurantsTab(loc) {
  if (!loc.restaurants?.length) return `<p class="leeg">Nog geen restaurants toegevoegd.</p>`;

  const groepen = {};
  loc.restaurants.forEach((r) => {
    const sfeer = r.sfeer || "overig";
    (groepen[sfeer] = groepen[sfeer] || []).push(r);
  });

  let html = "";
  SFEER_VOLGORDE.forEach((sfeer) => {
    if (!groepen[sfeer]) return;
    const label = sfeer.charAt(0).toUpperCase() + sfeer.slice(1);
    html += `<h2 class="rest-categorie">${SFEER_ICOON[sfeer]} ${label}</h2>`;
    html += groepen[sfeer]
      .map(
        (r) => `
      <div class="restaurant-kaart">
        <div class="rest-top">
          <div>
            <h3 class="rest-naam">${r.naam}</h3>
            <p class="rest-keuken">${r.keuken}</p>
          </div>
          <div class="rest-rechts">
            <span class="rest-prijs">${r.prijsniveau}</span>
            ${r.michelin > 0 ? `<span class="rest-michelin">${"⭐".repeat(r.michelin)}</span>` : ""}
          </div>
        </div>
        <div class="chips">
          ${r.reservering ? `<span class="chip chip-waarschuwing">📋 Reservering vereist</span>` : `<span class="chip">Walk-in</span>`}
          ${r.openingstijden ? `<span class="chip">🕐 ${r.openingstijden}</span>` : ""}
        </div>
        ${r.tip ? `<p class="rest-tip">${r.tip}</p>` : ""}
        <div class="rest-acties">
          ${r.mapsUrl ? `<a href="${r.mapsUrl}" target="_blank" class="knop-kaart klein">📍 Maps</a>` : ""}
          ${r.telefoon ? `<a href="tel:${r.telefoon}" class="knop-kaart klein">📞 Bel</a>` : ""}
        </div>
      </div>`
      )
      .join("");
  });

  return `<div class="restaurants-lijst">${html}</div>`;
}

// ─── Kaart ────────────────────────────────────────────────────────────────────

function renderKaart() {
  return `<div id="kaart-map"></div>`;
}

function initKaart() {
  const map = L.map("kaart-map", { zoomControl: true });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 18,
  }).addTo(map);

  const coords = REIS.locaties.map((l) => [l.coordinaten.lat, l.coordinaten.lng]);

  // Stippellijn langs alle stops
  L.polyline(coords, {
    color: "#00796b",
    weight: 3,
    dashArray: "8, 12",
    opacity: 0.85,
  }).addTo(map);

  // Markers per locatie
  REIS.locaties.forEach((loc, i) => {
    const status = locatieStatus(loc);
    const vulKleur = status === "huidig" ? "#2E7D32" : status === "verleden" ? "#9E9E9E" : "#00796b";
    const randKleur = status === "huidig" ? "#fff" : "#fff";

    const marker = L.circleMarker([loc.coordinaten.lat, loc.coordinaten.lng], {
      radius: 11,
      fillColor: vulKleur,
      color: randKleur,
      weight: 2.5,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(map);

    // Nummer in de marker via tooltip die altijd zichtbaar is
    const nrLabel = L.divIcon({
      className: "kaart-nr-label",
      html: `<span>${i + 1}</span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([loc.coordinaten.lat, loc.coordinaten.lng], { icon: nrLabel, interactive: false }).addTo(map);

    marker.bindPopup(
      `<div class="kaart-popup">
        <strong>${loc.emoji} ${loc.stad}</strong><br>
        <span>${loc.hotel.naam}</span><br>
        <span class="kaart-popup-datums">${formatDatum(loc.datums.aankomst)} → ${formatDatum(loc.datums.vertrek)}</span>
      </div>`,
      { maxWidth: 200 }
    );

    marker.on("click", () => {
      marker.openPopup();
    });

    // Knop in popup om naar detail te gaan
    marker.on("popupopen", () => {
      const btn = document.querySelector(".kaart-popup-link");
      if (btn) btn.onclick = () => { location.hash = `#locatie/${loc.id}`; };
    });
  });

  // Zoom zodat alle stops zichtbaar zijn
  map.fitBounds(coords, { padding: [24, 24] });
}
