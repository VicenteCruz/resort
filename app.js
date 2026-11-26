(function () {
  'use strict';

  const STORAGE_KEY = 'pyp_stay_pt_v2';

  function loadState() {
    const base = JSON.parse(JSON.stringify(window.DEFAULT_TRIP_DATA));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      return {
        ...base,
        ...saved,
        wallet: { ...base.wallet, ...(saved.wallet || {}) },
        rates: { ...base.rates, ...(saved.rates || {}) }
      };
    } catch {
      return base;
    }
  }

  let state = loadState();
  let activeView = 'overview';
  let activeFlightDir = 'outbound';
  let activeDayIndex = 0;
  let activeVenueCategory = 'all';

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('toast-message');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
  }

  function formatTzTime(tz) {
    try {
      return new Intl.DateTimeFormat('pt-PT', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    } catch {
      return '--:--';
    }
  }

  function parseHm(hm) {
    const [h, m] = hm.split(':').map(Number);
    return h * 60 + m;
  }

  function getCancunMinutesNow(overrideHm) {
    const hm = overrideHm && overrideHm !== 'live' ? overrideHm : formatTzTime('America/Cancun');
    return parseHm(hm);
  }

  function evaluateVenueStatus(venue, nowMins) {
    if (!venue.openIntervals || !venue.openIntervals.length) return { state: 'closed', label: 'Fechado' };
    for (const iv of venue.openIntervals) {
      if (iv.start === '00:00' && iv.end === '24:00') return { state: 'open', label: 'Aberto 24h' };
      const s = parseHm(iv.start);
      const e = parseHm(iv.end);
      const open = e > s ? nowMins >= s && nowMins < e : nowMins >= s || nowMins < e;
      if (open) {
        const left = e > s ? e - nowMins : nowMins >= s ? 1440 - nowMins + e : e - nowMins;
        if (left <= 45) return { state: 'soon', label: `Fecha em ${left}m` };
        return { state: 'open', label: `Até às ${iv.end}` };
      }
    }
    for (const iv of venue.openIntervals) {
      const s = parseHm(iv.start);
      const diff = s >= nowMins ? s - nowMins : 1440 - nowMins + s;
      if (diff > 0 && diff <= 60) return { state: 'soon', label: `Abre às ${iv.start}` };
    }
    return { state: 'closed', label: 'Fechado' };
  }

  function updateClocksAndCountdown() {
    const lis = formatTzTime('Europe/Lisbon');
    const yyz = formatTzTime('America/Toronto');
    const cun = formatTzTime('America/Cancun');
    document.getElementById('clock-lis').textContent = lis;
    document.getElementById('clock-yyz').textContent = yyz;
    document.getElementById('clock-cun').textContent = cun;
    const ovCun = document.getElementById('overview-cun-time');
    if (ovCun) ovCun.textContent = `${cun} EST`;

    const depMs = Date.parse('2026-11-28T10:55:00Z');
    const retMs = Date.parse('2026-12-08T20:10:00Z');
    const now = Date.now();
    const lbl = document.getElementById('countdown-label');
    const val = document.getElementById('countdown-value');
    if (lbl && val) {
      if (now < depMs) {
        const diff = depMs - now;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        lbl.textContent = 'Partida em';
        val.textContent = `${d}d ${h}h`;
      } else if (now <= retMs) {
        const day = Math.min(10, Math.floor((now - depMs) / 86400000) + 1);
        lbl.textContent = 'Estadia';
        val.textContent = `Dia ${day} de 10`;
      } else {
        lbl.textContent = 'Estado';
        val.textContent = 'Concluída';
      }
    }
  }

  function switchView(viewName) {
    activeView = viewName;
    document.querySelectorAll('.view-panel').forEach((p) => p.classList.toggle('is-active', p.id === `view-${viewName}`));
    document.querySelectorAll('[data-view-target]').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-view-target') === viewName));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderOverview() {
    const donePack = state.packing.filter((p) => p.checked).length;
    document.getElementById('hero-pack-progress').textContent = `${donePack} / ${state.packing.length}`;
    document.getElementById('wallet-summary-line').textContent = state.wallet.airCanadaPnr
      ? `PNR Air Canada: ${state.wallet.airCanadaPnr}`
      : 'Guarde o vosso PNR e código de reserva na Carteira';

    const outLegs = state.flights.outbound.legs;
    const inLegs = state.flights.inbound.legs;
    const fmtRouteCodes = (legs) => {
      if (!legs.length) return '---';
      const codes = [legs[0].fromCode, ...legs.map((l) => l.toCode)];
      return codes.map((c) => `<span class="iata-code">${escapeHtml(c)}</span>`).join(' → ');
    };
    const fmtNums = (legs) => legs.map((l) => escapeHtml(l.flightNumber)).join(' · ');
    const fmtTimes = (legs) => (legs.length ? `${escapeHtml(legs[0].depTime)} ${escapeHtml(legs[0].fromCode)} → ${escapeHtml(legs[legs.length - 1].arrTime)} ${escapeHtml(legs[legs.length - 1].toCode)}` : '');

    document.getElementById('overview-flight-summary').innerHTML = `
      <div class="flight-mini-route">
        <div>
          <div style="font-size: 0.74rem; color: var(--ink-muted); font-weight: 600;">IDA · ${escapeHtml(state.flights.outbound.dateLabel)}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:2px;flex-wrap:wrap;">
            ${fmtRouteCodes(outLegs)}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="mono" style="font-weight: 700; font-size: 0.86rem;">${fmtNums(outLegs)}</div>
          <div class="mono" style="font-size: 0.78rem; color: var(--ink-secondary);">${fmtTimes(outLegs)}</div>
        </div>
      </div>
      <div class="flight-mini-route">
        <div>
          <div style="font-size: 0.74rem; color: var(--ink-muted); font-weight: 600;">REGRESSO · ${escapeHtml(state.flights.inbound.dateLabel)}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:2px;flex-wrap:wrap;">
            ${fmtRouteCodes(inLegs)}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="mono" style="font-weight: 700; font-size: 0.86rem;">${fmtNums(inLegs)}</div>
          <div class="mono" style="font-size: 0.78rem; color: var(--ink-secondary);">${fmtTimes(inLegs)}</div>
        </div>
      </div>
    `;

    document.getElementById('overview-doc-badges').innerHTML = `
      <span class="tag ${state.wallet.canadaEta === 'Pronto' ? 'tag-open' : 'tag-soon'}">eTA Canadá: ${escapeHtml(state.wallet.canadaEta)}</span>
      <span class="tag ${state.wallet.mexicoVisitax === 'Pronto' ? 'tag-open' : 'tag-soon'}">Visitax: ${escapeHtml(state.wallet.mexicoVisitax)}</span>
      <span class="tag tag-cenote">${escapeHtml(state.wallet.suiteBuilding)}</span>
    `;

    const nowMins = getCancunMinutesNow('live');
    const openVenues = state.venues
      .map((v) => ({ v, st: evaluateVenueStatus(v, nowMins) }))
      .filter((x) => x.st.state === 'open' || x.st.state === 'soon')
      .slice(0, 4);

    document.getElementById('overview-open-venues').innerHTML = openVenues
      .map(
        ({ v, st }) => `
        <div class="open-venue-row">
          <div>
            <div style="font-weight: 600; font-size: 0.88rem;">${escapeHtml(v.name)}</div>
            <div style="font-size: 0.76rem; color: var(--ink-secondary);">${escapeHtml(v.cuisine)}</div>
          </div>
          <span class="tag ${st.state === 'open' ? 'tag-open' : 'tag-soon'}">${escapeHtml(st.label)}</span>
        </div>`
      )
      .join('');
  }

  function getFlightIata(flightNumber) {
    return String(flightNumber || '').replace(/\s+/g, '').toUpperCase();
  }

  function getIcaoCallsign(flightNumber) {
    const clean = getFlightIata(flightNumber);
    const map = { AC: 'ACA', TP: 'TAP', TS: 'TSC', WS: 'WJA', AM: 'AMX', UA: 'UAL', AA: 'AAL', DL: 'DAL', LH: 'DLH', IB: 'IBE', AF: 'AFR' };
    const m = clean.match(/^([A-Z]{2})(\d+.*)$/);
    if (m && map[m[1]]) return map[m[1]] + m[2];
    return clean;
  }

  function formatStatusBadge(live) {
    if (!live) return `<span class="tag">Programado</span>`;
    if (live.active && live.onGround) return `<span class="tag tag-soon">No Solo / Taxi</span>`;
    if (live.active) return `<span class="tag tag-open">✈ Em Voo (ADS-B)</span>`;
    return `<span class="tag">Sem sinal ADS-B agora</span>`;
  }

  async function fetchAdsbLive(legId) {
    const allLegs = [...state.flights.outbound.legs, ...state.flights.inbound.legs];
    const targetLegs = legId ? allLegs.filter((l) => l.id === legId) : state.flights[activeFlightDir].legs;

    showToast('A consultar radar api.adsb.lol...');
    let airborneCount = 0;

    for (const leg of targetLegs) {
      const callsign = getIcaoCallsign(leg.flightNumber);
      try {
        const res = await fetch(`https://api.adsb.lol/v2/callsign/${encodeURIComponent(callsign)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const ac = Array.isArray(json.ac) && json.ac.length > 0 ? json.ac[0] : null;
        const updatedAt = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

        if (ac) {
          const onGround = ac.alt_baro === 'ground' || ac.alt_baro === 0;
          const altFt = typeof ac.alt_baro === 'number' ? ac.alt_baro : null;
          const speedKmh = typeof ac.gs === 'number' ? Math.round(ac.gs * 1.852) : null;
          leg.liveStatus = {
            active: true,
            onGround,
            hex: ac.hex || '',
            reg: ac.r || '',
            type: ac.t || '',
            altFt,
            speedKmh,
            track: typeof ac.track === 'number' ? Math.round(ac.track) : null,
            lat: typeof ac.lat === 'number' ? ac.lat.toFixed(3) : null,
            lon: typeof ac.lon === 'number' ? ac.lon.toFixed(3) : null,
            updatedAt
          };
          airborneCount++;
        } else {
          leg.liveStatus = {
            active: false,
            updatedAt
          };
        }
      } catch (err) {
        console.warn('ADSB.lol fetch error:', err);
        showToast('Erro de rede ao contactar api.adsb.lol');
        return;
      }
    }

    saveState();
    renderFlights();
    showToast(
      airborneCount > 0
        ? `Avião detetado no radar ADS-B (${airborneCount})!`
        : 'Sem sinal ADS-B ativo agora (o avião ainda não descolou).'
    );
  }

  function renderFlights() {
    const dir = state.flights[activeFlightDir];
    const blocks = [
      `<div class="surface" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;">
        <div>
          <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--ink-muted);font-weight:700;">${escapeHtml(dir.dateLabel)}</div>
          <div style="font-size:1.06rem;font-weight:700;margin-top:2px;">${escapeHtml(dir.summary)}</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
          <button type="button" class="btn btn-primary btn-sm" id="btn-refresh-all-flights">
            ↻ Seguir no Radar (adsb.lol)
          </button>
        </div>
      </div>`
    ];

    const pre = dir.layovers.find((l) => l.beforeFirstLeg);
    if (pre) blocks.push(renderLayover(pre));

    dir.legs.forEach((leg) => {
      const iata = getFlightIata(leg.flightNumber).toLowerCase();
      const icao = getIcaoCallsign(leg.flightNumber);
      const live = leg.liveStatus;

      blocks.push(`
        <article class="boarding-pass">
          <div class="bp-header">
            <div class="bp-flight-badge">
              <span class="bp-flight-num">${escapeHtml(leg.flightNumber)}</span>
              <span>${escapeHtml(leg.airline)} · Callsign <strong class="mono">${escapeHtml(icao)}</strong></span>
              ${formatStatusBadge(live)}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn btn-ghost-light btn-sm" data-refresh-leg="${escapeHtml(leg.id)}">↻ Radar</button>
            </div>
          </div>
          <div class="bp-body">
            <div class="bp-route-grid">
              <div>
                <div class="bp-city-code">${escapeHtml(leg.fromCode)}</div>
                <div class="bp-city-name">${escapeHtml(leg.fromCity)}</div>
                <div class="bp-time">${escapeHtml(leg.depTime)} <span style="font-size:0.74rem;color:var(--ink-muted);">${escapeHtml(leg.depTz)}</span></div>
              </div>
              <div class="bp-duration-track">
                <span class="mono" style="font-size:0.76rem;color:var(--ink-muted);">${escapeHtml(leg.duration)}</span>
                <div class="bp-duration-line"></div>
              </div>
              <div class="bp-endpoint-right">
                <div class="bp-city-code">${escapeHtml(leg.toCode)}</div>
                <div class="bp-city-name">${escapeHtml(leg.toCity)}</div>
                <div class="bp-time">${escapeHtml(leg.arrTime)} <span style="font-size:0.74rem;color:var(--ink-muted);">${escapeHtml(leg.arrTz)}</span></div>
              </div>
            </div>
            <div class="bp-details-row">
              <div><div class="bp-field-label">Terminal Partida</div><div class="bp-field-val">${escapeHtml(leg.fromTerminal)}</div></div>
              <div><div class="bp-field-label">Terminal Chegada</div><div class="bp-field-val">${escapeHtml(leg.toTerminal)}</div></div>
              <div><div class="bp-field-label">Porta (Gate)</div><div class="bp-field-val">${escapeHtml(leg.gate)}</div></div>
              <div><div class="bp-field-label">Lugar (Seat)</div><div class="bp-field-val">${escapeHtml(leg.seat)}</div></div>
              <div><div class="bp-field-label">PNR Air Canada</div><div class="bp-field-val">${escapeHtml(state.wallet.airCanadaPnr || '---')}</div></div>
            </div>

            ${live ? (live.active ? `
              <div style="margin-top:12px;padding:10px 12px;border-radius:8px;background:var(--agave-100);color:var(--agave-700);font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <div>
                  <strong>ADSB.lol Ao Vivo:</strong>
                  ${live.reg ? `${escapeHtml(live.reg)} (${escapeHtml(live.type || 'Avião')}) · ` : ''}
                  ${live.onGround ? 'No solo' : `Altitude ${live.altFt ? live.altFt.toLocaleString('pt-PT') + ' ft' : '--'} · ${live.speedKmh || '--'} km/h`}
                  ${live.lat && live.lon ? ` · Posição ${live.lat}, ${live.lon}` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  ${live.hex ? `<a href="https://globe.adsb.lol/?icao=${encodeURIComponent(live.hex)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="text-decoration:none;">Ver no Mapa ↗</a>` : ''}
                  <span class="mono" style="font-size:0.74rem;">${escapeHtml(live.updatedAt)}</span>
                </div>
              </div>
            ` : `
              <div style="margin-top:12px;padding:8px 12px;border-radius:8px;background:var(--bg-canvas);font-size:0.78rem;color:var(--ink-secondary);display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                <span><strong>ADSB.lol (${escapeHtml(icao)}):</strong> Avião sem sinal de transponder ativo neste momento (aguarda descolagem).</span>
                <span class="mono">Verificado às ${escapeHtml(live.updatedAt)}</span>
              </div>
            `) : ''}

            <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line-soft);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
              <p style="font-size:0.81rem;color:var(--ink-secondary);"><strong>Nota:</strong> ${escapeHtml(leg.baggageNote)}</p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                <a href="https://globe.adsb.lol/?find_callsign=${encodeURIComponent(icao)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="text-decoration:none;">Mapa adsb.lol ↗</a>
                <a href="https://www.flightradar24.com/data/flights/${encodeURIComponent(iata)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="text-decoration:none;">Flightradar24 ↗</a>
              </div>
            </div>
          </div>
        </article>
      `);
      const after = dir.layovers.find((l) => l.afterLegId === leg.id);
      if (after) blocks.push(renderLayover(after));
    });

    const el = document.getElementById('flights-container');
    el.innerHTML = blocks.join('');
    document.getElementById('btn-refresh-all-flights')?.addEventListener('click', () => fetchAdsbLive());
    el.querySelectorAll('[data-refresh-leg]').forEach((b) => b.addEventListener('click', () => fetchAdsbLive(b.getAttribute('data-refresh-leg'))));
    el.querySelectorAll('[data-edit-leg]').forEach((b) => b.addEventListener('click', () => openLegModal(b.getAttribute('data-edit-leg'))));
    updateFlightMap();
  }

  let flightMap = null;
  let planeLayer = null;

  function updateFlightMap() {
    const mapEl = document.getElementById('flight-live-map');
    if (!mapEl || typeof window.L === 'undefined') return;

    const airports = {
      LIS: [38.7742, -9.1342],
      YYZ: [43.6777, -79.6248],
      CUN: [21.0365, -86.8771]
    };

    if (!flightMap) {
      flightMap = window.L.map(mapEl, { scrollWheelZoom: false }).setView([36, -45], 3);
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(flightMap);

      window.L.polyline([airports.LIS, airports.YYZ, airports.CUN], {
        color: '#166970',
        weight: 2.5,
        dashArray: '6, 8',
        opacity: 0.75
      }).addTo(flightMap);

      Object.entries(airports).forEach(([code, coords]) => {
        window.L.circleMarker(coords, {
          radius: 6,
          fillColor: '#166970',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        })
          .bindTooltip(code, { permanent: true, direction: 'top', offset: [0, -6] })
          .addTo(flightMap);
      });

      planeLayer = window.L.layerGroup().addTo(flightMap);
    }

    setTimeout(() => flightMap && flightMap.invalidateSize(), 120);
    planeLayer.clearLayers();

    const dirLegs = state.flights[activeFlightDir].legs;
    let activePlanes = 0;

    dirLegs.forEach((leg) => {
      const lv = leg.liveStatus;
      if (lv && lv.active && lv.lat && lv.lon) {
        activePlanes++;
        const deg = lv.track || 0;
        const icon = window.L.divIcon({
          className: 'plane-marker',
          html: `<div style="transform:rotate(${deg}deg);font-size:24px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">✈</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        window.L.marker([Number(lv.lat), Number(lv.lon)], { icon })
          .bindPopup(
            `<strong>${escapeHtml(leg.flightNumber)} (${escapeHtml(getIcaoCallsign(leg.flightNumber))})</strong><br/>` +
            `${lv.reg ? `${escapeHtml(lv.reg)} · ` : ''}${lv.onGround ? 'No solo' : `${lv.altFt || '--'} ft · ${lv.speedKmh || '--'} km/h`}`
          )
          .addTo(planeLayer);
        flightMap.setView([Number(lv.lat), Number(lv.lon)], 6);
      }
    });

    const statusEl = document.getElementById('map-live-status');
    if (statusEl) {
      statusEl.textContent = activePlanes > 0
        ? `✈ ${activePlanes} avião ao vivo no mapa`
        : 'Rota LIS ↔ YYZ ↔ CUN (sem sinal ADS-B agora)';
    }
  }

  function renderLayover(l) {
    return `<div class="layover-banner">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <strong style="font-size:0.93rem;">${escapeHtml(l.title)}</strong>
        <span class="tag tag-cenote">${escapeHtml(l.badge)}</span>
      </div>
      <ol class="layover-steps">${l.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
    </div>`;
  }

  function renderPlanner() {
    const strip = document.getElementById('day-selector-strip');
    strip.innerHTML = state.days
      .map(
        (d, idx) => `
        <button type="button" class="day-pill ${idx === activeDayIndex ? 'is-active' : ''}" data-day-idx="${idx}">
          <span class="day-pill-num">${d.dayNumber <= 10 ? `Noite ${d.dayNumber}` : 'Regresso'}</span>
          <span class="day-pill-date">${escapeHtml(d.shortDate)}</span>
          <span class="day-pill-tag">${escapeHtml(d.dinnerChoice !== 'Sem restaurante marcado' ? d.dinnerChoice : d.theme)}</span>
        </button>`
      )
      .join('');

    strip.querySelectorAll('[data-day-idx]').forEach((b) =>
      b.addEventListener('click', () => {
        activeDayIndex = Number(b.getAttribute('data-day-idx'));
        renderPlanner();
      })
    );

    const day = state.days[activeDayIndex];
    document.getElementById('planner-day-badge').textContent = day.dayNumber <= 10 ? `Noite ${day.dayNumber} de 10` : 'Dia de Regresso';
    document.getElementById('planner-day-title').textContent = `${day.shortDate} — ${day.theme}`;

    const sel = document.getElementById('planner-dinner-select');
    if (!Array.from(sel.options).some((o) => o.value === day.dinnerChoice)) {
      const opt = document.createElement('option');
      opt.value = day.dinnerChoice;
      opt.textContent = day.dinnerChoice;
      sel.appendChild(opt);
    }
    sel.value = day.dinnerChoice;
    document.getElementById('planner-day-notes').value = day.notes || '';

    const listEl = document.getElementById('planner-agenda-list');
    if (!day.items.length) {
      listEl.innerHTML = `<p style="color:var(--ink-muted);font-size:0.88rem;padding:8px 0;">Dia livre — sem planos pré-inventados. Clique em "+ Adicionar Plano" ou agende um restaurante a partir do guia.</p>`;
    } else {
      listEl.innerHTML = day.items
        .map(
          (it) => `
          <div class="agenda-item ${it.done ? 'is-done' : ''}">
            <label class="agenda-left" style="cursor:pointer;flex:1;">
              <input type="checkbox" class="check-circle" data-toggle-ag="${escapeHtml(it.id)}" ${it.done ? 'checked' : ''} />
              <div>
                <span class="agenda-time">${escapeHtml(it.time)}</span>
                <div class="agenda-title">${escapeHtml(it.title)}</div>
                ${it.note ? `<div class="agenda-note">${escapeHtml(it.note)}</div>` : ''}
              </div>
            </label>
            <button type="button" class="icon-btn" data-del-ag="${escapeHtml(it.id)}">✕</button>
          </div>`
        )
        .join('');

      listEl.querySelectorAll('[data-toggle-ag]').forEach((c) =>
        c.addEventListener('change', () => {
          const t = day.items.find((x) => x.id === c.getAttribute('data-toggle-ag'));
          if (t) { t.done = c.checked; saveState(); renderPlanner(); }
        })
      );
      listEl.querySelectorAll('[data-del-ag]').forEach((b) =>
        b.addEventListener('click', () => {
          day.items = day.items.filter((x) => x.id !== b.getAttribute('data-del-ag'));
          saveState(); renderPlanner();
        })
      );
    }
  }

  function getVenueAvg(v) {
    const r = v.ratings;
    if (!r) return 0;
    return (Number(r.food || 0) + Number(r.vibe || 0) + Number(r.service || 0) + Number(r.quality || 0)) / 4;
  }

  function openRateVenueModal(venueId) {
    const v = state.venues.find((x) => x.id === venueId);
    if (!v) return;
    const defaultBy = sbUser?.email ? sbUser.email.split('@')[0] : '';
    const r = v.ratings || { food: 5, vibe: 5, service: 5, quality: 5, comment: '', by: defaultBy };
    const opts = (val) =>
      [5, 4, 3, 2, 1]
        .map((n) => `<option value="${n}" ${Number(val) === n ? 'selected' : ''}>${'★'.repeat(n)}${'☆'.repeat(5 - n)} (${n})</option>`)
        .join('');

    openModal(`Avaliar ${v.name}`, `
      <form id="f-rate-venue" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Comida</label><select id="rv-food" class="select">${opts(r.food)}</select></div>
          <div><label class="field-label">Ambiente</label><select id="rv-vibe" class="select">${opts(r.vibe)}</select></div>
          <div><label class="field-label">Serviço</label><select id="rv-serv" class="select">${opts(r.service)}</select></div>
          <div><label class="field-label">Qualidade / Pratos</label><select id="rv-qual" class="select">${opts(r.quality)}</select></div>
        </div>
        <div class="form-grid form-grid-2">
          <div>
            <label class="field-label">Avaliado por</label>
            <input id="rv-by" class="input" value="${escapeHtml(r.by || defaultBy)}" placeholder="O seu nome..." />
          </div>
          <div>
            <label class="field-label">Comentário / Prato Favorito</label>
            <input id="rv-note" class="input" value="${escapeHtml(r.comment || '')}" placeholder="Ex: Melhor bife da viagem..." />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
          <button type="submit" class="btn btn-primary">Guardar Avaliação</button>
        </div>
      </form>
    `);

    document.getElementById('f-rate-venue').addEventListener('submit', (e) => {
      e.preventDefault();
      v.ratings = {
        food: Number(document.getElementById('rv-food').value),
        vibe: Number(document.getElementById('rv-vibe').value),
        service: Number(document.getElementById('rv-serv').value),
        quality: Number(document.getElementById('rv-qual').value),
        by: document.getElementById('rv-by').value.trim() || defaultBy || 'Casal',
        comment: document.getElementById('rv-note').value.trim()
      };
      v.visited = true;
      saveState();
      renderResortVenues();
      closeModal();
      showToast(`${v.name} avaliado (${getVenueAvg(v).toFixed(1)}★)!`);
    });
  }

  function syncCustomBarsToCocktailSelect() {
    const sel = document.getElementById('ck-bar');
    if (!sel) return;
    const existing = new Set(Array.from(sel.options).map((o) => o.value));
    state.venues
      .filter((v) => v.custom && v.category === 'bars')
      .forEach((v) => {
        if (!existing.has(v.name)) {
          const opt = document.createElement('option');
          opt.value = v.name;
          opt.textContent = v.name;
          sel.appendChild(opt);
        }
      });
  }

  function renderSettings() {
    const flList = document.getElementById('settings-flights-list');
    if (flList) {
      const renderGroup = (dirKey, label) => {
        const legs = state.flights[dirKey].legs;
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
            <strong style="font-size:0.8rem;color:var(--cenote-700);">${label} (${legs.length} voo${legs.length === 1 ? '' : 's'})</strong>
            <button type="button" class="btn btn-sm" data-add-leg-dir="${dirKey}">+ Adicionar Voo</button>
          </div>
          ${legs
            .map(
              (l) => `
              <div class="open-venue-row">
                <div>
                  <strong class="mono">${escapeHtml(l.flightNumber)}</strong> · ${escapeHtml(l.fromCode)} → ${escapeHtml(l.toCode)}
                  <span class="mono" style="font-size:0.78rem;color:var(--ink-secondary);">(${escapeHtml(l.depTime)} – ${escapeHtml(l.arrTime)})</span>
                </div>
                <div style="display:flex;gap:6px;align-items:center;">
                  <button type="button" class="btn btn-sm" data-set-edit-leg="${escapeHtml(l.id)}">Alterar</button>
                  ${legs.length > 1 ? `<button type="button" class="icon-btn" data-del-leg-dir="${dirKey}" data-del-leg-id="${escapeHtml(l.id)}" title="Remover voo">✕</button>` : ''}
                </div>
              </div>`
            )
            .join('')}
        `;
      };

      flList.innerHTML = renderGroup('outbound', 'Ida') + renderGroup('inbound', 'Regresso');

      flList.querySelectorAll('[data-set-edit-leg]').forEach((b) =>
        b.addEventListener('click', () => openLegModal(b.getAttribute('data-set-edit-leg')))
      );

      flList.querySelectorAll('[data-add-leg-dir]').forEach((b) =>
        b.addEventListener('click', () => {
          const dirKey = b.getAttribute('data-add-leg-dir');
          const legs = state.flights[dirKey].legs;
          const prev = legs[legs.length - 1];
          const newId = `leg-${Date.now()}`;
          legs.push({
            id: newId,
            flightNumber: 'AC 000',
            airline: 'Air Canada',
            aircraft: 'Voo Adicional',
            fromCode: prev ? prev.toCode : 'LIS',
            fromCity: prev ? prev.toCity : 'Origem',
            fromTerminal: 'Terminal 1',
            depTime: '12:00',
            depTz: 'EST',
            toCode: dirKey === 'outbound' ? 'CUN' : 'LIS',
            toCity: dirKey === 'outbound' ? 'Cancún Internacional' : 'Lisboa',
            toTerminal: 'Terminal 1',
            arrTime: '15:00',
            arrTz: 'EST',
            duration: '--',
            gate: 'A definir',
            seat: 'A definir',
            baggageNote: 'Voo adicionado manualmente.'
          });
          saveState();
          renderFlights();
          renderSettings();
          renderOverview();
          openLegModal(newId);
        })
      );

      flList.querySelectorAll('[data-del-leg-id]').forEach((b) =>
        b.addEventListener('click', () => {
          const dirKey = b.getAttribute('data-del-leg-dir');
          const id = b.getAttribute('data-del-leg-id');
          state.flights[dirKey].legs = state.flights[dirKey].legs.filter((l) => l.id !== id);
          saveState();
          renderFlights();
          renderSettings();
          renderOverview();
          showToast('Voo removido');
        })
      );
    }
  }

  document.getElementById('f-settings-add-venue')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sav-name').value.trim();
    const category = document.getElementById('sav-cat').value;
    const cuisine = document.getElementById('sav-cuisine').value.trim() || (category === 'bars' ? 'Bar / Bebidas' : 'Restaurante');
    const hoursLabel = document.getElementById('sav-hours').value.trim() || 'Consultar horário local';
    const description = document.getElementById('sav-desc').value.trim() || 'Adicionado em Configuração.';
    if (!name) return;

    state.venues.push({
      id: `custom-v-${Date.now()}`,
      name,
      category,
      cuisine,
      included: category !== 'extra',
      reservationRequired: false,
      dressCode: category === 'bars' ? 'Casual' : 'Smart Casual / Casual',
      hoursLabel,
      openIntervals: [{ start: '00:00', end: '24:00' }],
      description,
      visited: false,
      custom: true
    });
    document.getElementById('sav-name').value = '';
    document.getElementById('sav-cuisine').value = '';
    document.getElementById('sav-hours').value = '';
    document.getElementById('sav-desc').value = '';
    saveState();
    syncCustomBarsToCocktailSelect();
    renderResortVenues();
    showToast(`${name} adicionado!`);
  });

  document.getElementById('btn-settings-wallet')?.addEventListener('click', openWalletModal);

  function renderResortVenues() {
    const sim = document.getElementById('resort-time-sim').value;
    const nowMins = getCancunMinutesNow(sim);

    // Render Top Restaurants Podium
    const rankBox = document.getElementById('restaurants-ranking-box');
    if (rankBox) {
      const rated = state.venues
        .filter((v) => v.ratings)
        .sort((a, b) => getVenueAvg(b) - getVenueAvg(a))
        .slice(0, 5);
      if (rated.length) {
        const medals = ['🥇', '🥈', '🥉', '4º', '5º'];
        rankBox.innerHTML = `
          <div class="surface">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <h3 style="font-size:1.1rem;">🏆 Ranking dos Melhores Restaurantes</h3>
              <span class="tag tag-cenote">${rated.length} avaliado${rated.length === 1 ? '' : 's'}</span>
            </div>
            <div class="open-now-list">
              ${rated
                .map(
                  (v, i) => `
                  <div class="open-venue-row">
                    <div>
                      <strong>${medals[i]} ${escapeHtml(v.name)}</strong>
                      <span style="font-size:0.78rem;color:var(--ink-secondary);margin-left:6px;">${escapeHtml(v.cuisine)}</span>
                    </div>
                    <span class="tag tag-cenote mono">★ ${getVenueAvg(v).toFixed(1)} / 5</span>
                  </div>`
                )
                .join('')}
            </div>
          </div>
        `;
      } else {
        rankBox.innerHTML = '';
      }
    }

    let list = state.venues.filter((v) => {
      if (activeVenueCategory === 'all') return true;
      if (activeVenueCategory === 'ranking') return Boolean(v.ratings);
      if (activeVenueCategory === 'open') {
        const s = evaluateVenueStatus(v, nowMins).state;
        return s === 'open' || s === 'soon';
      }
      return v.category === activeVenueCategory;
    });

    // Always sort rated venues higher when in ranking mode
    if (activeVenueCategory === 'ranking') {
      list = [...list].sort((a, b) => getVenueAvg(b) - getVenueAvg(a));
    }

    const grid = document.getElementById('venue-cards-grid');
    if (!list.length) {
      grid.innerHTML = `<div class="surface"><p style="font-size:0.88rem;color:var(--ink-secondary);">Ainda nenhum restaurante avaliado. Clique em "★ Avaliar" em qualquer restaurante para criar o vosso Top Ranking!</p></div>`;
      return;
    }

    grid.innerHTML = list
      .map((v, idx) => {
        const st = evaluateVenueStatus(v, nowMins);
        const cls = st.state === 'open' ? 'tag-open' : st.state === 'soon' ? 'tag-soon' : 'tag-closed';
        const avg = getVenueAvg(v);
        const r = v.ratings;

        return `
          <article class="venue-card">
            <div>
              <div class="venue-top">
                <div>
                  <h3 class="venue-name">${activeVenueCategory === 'ranking' ? `#${idx + 1} ` : ''}${escapeHtml(v.name)}</h3>
                  <div class="venue-cuisine">${escapeHtml(v.cuisine)}</div>
                </div>
                ${avg > 0
                  ? `<span class="tag tag-cenote mono">★ ${avg.toFixed(1)} / 5</span>`
                  : `<span class="tag ${cls}">${escapeHtml(st.label)}</span>`}
              </div>
              <p class="venue-desc">${escapeHtml(v.description)}</p>
              ${r ? `
                <div style="margin-top:10px;padding:8px 10px;border-radius:8px;background:var(--bg-canvas);font-size:0.76rem;color:var(--ink-secondary);">
                  <div class="mono" style="display:flex;flex-wrap:wrap;gap:6px 10px;">
                    <span>Comida <strong>${r.food}★</strong></span>
                    <span>Ambiente <strong>${r.vibe}★</strong></span>
                    <span>Serviço <strong>${r.service}★</strong></span>
                    <span>Qualidade <strong>${r.quality}★</strong></span>
                  </div>
                  ${r.comment ? `<div style="margin-top:4px;font-style:italic;">"${escapeHtml(r.comment)}"</div>` : ''}
                  ${r.by ? `<div style="margin-top:4px;font-size:0.72rem;color:var(--ink-muted);">Avaliado por <strong>${escapeHtml(r.by)}</strong></div>` : ''}
                </div>
              ` : ''}
            </div>
            <div>
              <div class="venue-meta-list">
                <div><strong>Horário:</strong> ${escapeHtml(v.hoursLabel)}</div>
                <div><strong>Dress Code:</strong> ${escapeHtml(v.dressCode)}</div>
                <div><strong>Acesso:</strong> ${v.included ? 'Incluído' : 'Pago à parte'} · ${v.reservationRequired ? 'Requer Reserva' : 'Sem Reserva'}</div>
              </div>
              <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">
                <button type="button" class="btn btn-primary btn-sm" data-rate-v="${escapeHtml(v.id)}">${r ? '★ Editar Nota' : '★ Avaliar'}</button>
                <button type="button" class="btn btn-sm" data-sched="${escapeHtml(v.id)}">+ Agendar</button>
              </div>
            </div>
          </article>`;
      })
      .join('');

    grid.querySelectorAll('[data-rate-v]').forEach((b) =>
      b.addEventListener('click', () => openRateVenueModal(b.getAttribute('data-rate-v')))
    );
    grid.querySelectorAll('[data-sched]').forEach((b) =>
      b.addEventListener('click', () => openSchedModal(b.getAttribute('data-sched')))
    );
  }

  function renderPacking() {
    const total = state.packing.length;
    const done = state.packing.filter((p) => p.checked).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById('packing-progress-bar').style.width = `${pct}%`;
    document.getElementById('packing-status-text').textContent = `${done} de ${total} prontos (${pct}%)`;

    const el = document.getElementById('packing-items-container');
    el.innerHTML = state.packing
      .map(
        (p) => `
        <div class="pack-item ${p.checked ? 'is-checked' : ''}">
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1;">
            <input type="checkbox" class="check-circle" style="margin-top:0;" data-pack="${escapeHtml(p.id)}" ${p.checked ? 'checked' : ''} />
            <div>
              <span style="font-size:0.87rem;font-weight:500;">${escapeHtml(p.item)}</span>
              <div style="font-size:0.72rem;color:var(--ink-muted);">${escapeHtml(p.category)}</div>
            </div>
          </label>
          <button type="button" class="icon-btn" data-del-pack="${escapeHtml(p.id)}">✕</button>
        </div>`
      )
      .join('');

    el.querySelectorAll('[data-pack]').forEach((c) =>
      c.addEventListener('change', () => {
        const p = state.packing.find((x) => x.id === c.getAttribute('data-pack'));
        if (p) { p.checked = c.checked; saveState(); renderPacking(); renderOverview(); }
      })
    );
    el.querySelectorAll('[data-del-pack]').forEach((b) =>
      b.addEventListener('click', () => {
        state.packing = state.packing.filter((x) => x.id !== b.getAttribute('data-del-pack'));
        saveState(); renderPacking(); renderOverview();
      })
    );
  }

  function updateCurrency(src, raw) {
    const v = parseFloat(raw);
    if (Number.isNaN(v)) return;
    const { eurToMxn, eurToUsd, eurToCad } = state.rates;
    const eur = src === 'EUR' ? v : src === 'MXN' ? v / eurToMxn : src === 'USD' ? v / eurToUsd : v / eurToCad;
    if (src !== 'MXN') document.getElementById('conv-mxn').value = (eur * eurToMxn).toFixed(0);
    if (src !== 'EUR') document.getElementById('conv-eur').value = eur.toFixed(2);
    if (src !== 'USD') document.getElementById('conv-usd').value = (eur * eurToUsd).toFixed(2);
    if (src !== 'CAD') document.getElementById('conv-cad').value = (eur * eurToCad).toFixed(2);
  }

  function renderExpenses() {
    const listEl = document.getElementById('expenses-list');
    const totEl = document.getElementById('expenses-total-eur');
    const toEur = (a, c) => (c === 'EUR' ? a : c === 'USD' ? a / state.rates.eurToUsd : a / state.rates.eurToMxn);
    const total = state.expenses.reduce((s, e) => s + toEur(Number(e.amount) || 0, e.currency), 0);
    totEl.textContent = `€${total.toFixed(2)}`;

    if (!state.expenses.length) {
      listEl.innerHTML = `<p style="font-size:0.82rem;color:var(--ink-muted);">Sem despesas registadas.</p>`;
      return;
    }
    listEl.innerHTML = state.expenses
      .map(
        (e) => `
        <div class="open-venue-row" style="padding:8px 10px;">
          <span style="font-size:0.84rem;font-weight:500;">${escapeHtml(e.label)}</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="mono" style="font-size:0.82rem;font-weight:600;">${e.amount} ${escapeHtml(e.currency)}</span>
            <button type="button" class="icon-btn" data-del-exp="${escapeHtml(e.id)}">✕</button>
          </div>
        </div>`
      )
      .join('');
    listEl.querySelectorAll('[data-del-exp]').forEach((b) =>
      b.addEventListener('click', () => {
        state.expenses = state.expenses.filter((x) => x.id !== b.getAttribute('data-del-exp'));
        saveState(); renderExpenses();
      })
    );
  }

  function openModal(title, html) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-backdrop').classList.add('is-open');
  }
  function closeModal() { document.getElementById('modal-backdrop').classList.remove('is-open'); }

  function openWalletModal() {
    const w = state.wallet;
    openModal('Carteira & Códigos da Viagem', `
      <form id="f-wallet" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label">PNR Air Canada</label><input id="w-pnr" class="input mono" value="${escapeHtml(w.airCanadaPnr)}" placeholder="Ex: K8M4QX" /></div>
          <div><label class="field-label">Reserva do Hotel</label><input id="w-ref" class="input mono" value="${escapeHtml(w.resortBookingRef)}" /></div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Suite / Edifício</label><input id="w-suite" class="input" value="${escapeHtml(w.suiteBuilding)}" /></div>
          <div><label class="field-label">Transfer Aeroporto–Hotel</label><input id="w-tr" class="input" value="${escapeHtml(w.transferProvider)}" /></div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">eTA Canadá</label><select id="w-eta" class="select"><option value="Pendente" ${w.canadaEta==='Pendente'?'selected':''}>Pendente</option><option value="Pronto" ${w.canadaEta==='Pronto'?'selected':''}>Pronto</option></select></div>
          <div><label class="field-label">Visitax Quintana Roo</label><select id="w-vis" class="select"><option value="Pendente" ${w.mexicoVisitax==='Pendente'?'selected':''}>Pendente</option><option value="Pronto" ${w.mexicoVisitax==='Pronto'?'selected':''}>Pronto</option></select></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `);
    document.getElementById('f-wallet').addEventListener('submit', (e) => {
      e.preventDefault();
      w.airCanadaPnr = document.getElementById('w-pnr').value.trim().toUpperCase();
      w.resortBookingRef = document.getElementById('w-ref').value.trim();
      w.suiteBuilding = document.getElementById('w-suite').value.trim() || 'Suite a definir';
      w.transferProvider = document.getElementById('w-tr').value.trim();
      w.canadaEta = document.getElementById('w-eta').value;
      w.mexicoVisitax = document.getElementById('w-vis').value;
      saveState(); renderOverview(); renderFlights(); closeModal(); showToast('Guardado!');
    });
  }

  async function lookupFlightRoute(flightNumber) {
    const clean = getFlightIata(flightNumber);
    const callsign = getIcaoCallsign(clean);
    const airlines = {
      AC: 'Air Canada', TP: 'TAP Air Portugal', TS: 'Air Transat', WS: 'WestJet',
      AM: 'Aeroméxico', UA: 'United Airlines', AA: 'American Airlines', DL: 'Delta Air Lines',
      LH: 'Lufthansa', IB: 'Iberia', AF: 'Air France', BA: 'British Airways', KL: 'KLM'
    };
    const prefix = clean.slice(0, 2);
    const result = { airline: airlines[prefix] || '', fromCode: '', toCode: '' };

    try {
      const res = await fetch('https://api.adsb.lol/api/0/routeset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planes: [{ callsign, lat: 0, lng: 0 }] })
      });
      if (res.ok) {
        const arr = await res.json();
        const entry = Array.isArray(arr) && arr[0];
        if (entry && Array.isArray(entry._airports) && entry._airports.length >= 2) {
          result.fromCode = (entry._airports[0].iata || '').toUpperCase();
          result.toCode = (entry._airports[entry._airports.length - 1].iata || '').toUpperCase();
        }
      }
    } catch (err) {
      console.warn('routeset lookup failed:', err);
    }
    return result;
  }

  function openLegModal(id) {
    const isOut = state.flights.outbound.legs.some((l) => l.id === id);
    const dirObj = isOut ? state.flights.outbound : state.flights.inbound;
    const leg = dirObj.legs.find((l) => l.id === id);
    if (!leg) return;
    openModal(`Alterar Voo ${leg.flightNumber}`, `
      <form id="f-leg" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Nº do Voo (ex: AC 811)</label><input id="l-num" class="input mono" value="${escapeHtml(leg.flightNumber)}" required /></div>
          <div><label class="field-label">Data da Viagem</label><input id="l-date" class="input" value="${escapeHtml(dirObj.dateLabel)}" /></div>
        </div>
        <div style="display:flex;justify-content:flex-start;">
          <button type="button" class="btn btn-sm" id="btn-auto-route">🔍 Preencher Companhia &amp; Rota (adsb.lol)</button>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Companhia Aérea</label><input id="l-air" class="input" value="${escapeHtml(leg.airline)}" /></div>
          <div><label class="field-label">Origem → Destino (IATA)</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <input id="l-from" class="input mono" value="${escapeHtml(leg.fromCode)}" maxlength="3" placeholder="LIS" />
              <input id="l-to" class="input mono" value="${escapeHtml(leg.toCode)}" maxlength="3" placeholder="YYZ" />
            </div>
          </div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Hora Partida</label><input id="l-dep" class="input mono" value="${escapeHtml(leg.depTime)}" /></div>
          <div><label class="field-label">Hora Chegada</label><input id="l-arr" class="input mono" value="${escapeHtml(leg.arrTime)}" /></div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Porta (Gate)</label><input id="l-gate" class="input mono" value="${escapeHtml(leg.gate)}" /></div>
          <div><label class="field-label">Lugar (Seat)</label><input id="l-seat" class="input mono" value="${escapeHtml(leg.seat)}" /></div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:6px;"><button type="submit" class="btn btn-primary">Guardar Alterações</button></div>
      </form>
    `);

    document.getElementById('btn-auto-route').addEventListener('click', async () => {
      const num = document.getElementById('l-num').value.trim().toUpperCase();
      if (!num) return;
      showToast('A procurar rota na adsb.lol...');
      const info = await lookupFlightRoute(num);
      if (info.airline) document.getElementById('l-air').value = info.airline;
      if (info.fromCode) document.getElementById('l-from').value = info.fromCode;
      if (info.toCode) document.getElementById('l-to').value = info.toCode;
      showToast(info.fromCode && info.toCode ? `Rota encontrada: ${info.fromCode} → ${info.toCode}!` : 'Companhia preenchida (rota não disponível na adsb.lol).');
    });

    document.getElementById('f-leg').addEventListener('submit', (e) => {
      e.preventDefault();
      const newNum = document.getElementById('l-num').value.trim().toUpperCase();
      const newFrom = document.getElementById('l-from').value.trim().toUpperCase();
      const newTo = document.getElementById('l-to').value.trim().toUpperCase();

      const validFlight = /^([A-Z]{2}|[A-Z]\d|\d[A-Z]|[A-Z]{3})\s?\d{1,4}[A-Z]?$/;
      const validIata = /^[A-Z]{3}$/;

      if (!validFlight.test(newNum)) {
        showToast('Nº de voo inválido! Use formato tipo AC 811, TP 257 ou ACA811.');
        return;
      }
      if (!validIata.test(newFrom) || !validIata.test(newTo)) {
        showToast('Origem e Destino devem ser códigos de 3 letras (ex: LIS, YYZ, CUN).');
        return;
      }

      dirObj.dateLabel = document.getElementById('l-date').value.trim() || dirObj.dateLabel;
      if (newNum !== leg.flightNumber) {
        leg.flightNumber = newNum;
        leg.liveStatus = null;
      }
      leg.airline = document.getElementById('l-air').value.trim() || leg.airline;
      leg.fromCode = newFrom;
      leg.toCode = newTo;
      leg.depTime = document.getElementById('l-dep').value.trim() || leg.depTime;
      leg.arrTime = document.getElementById('l-arr').value.trim() || leg.arrTime;
      leg.gate = document.getElementById('l-gate').value.trim() || 'A definir';
      leg.seat = document.getElementById('l-seat').value.trim() || 'A definir';
      saveState(); renderFlights(); renderSettings(); renderOverview(); closeModal(); showToast(`Voo ${leg.flightNumber} atualizado!`);
    });
  }

  function openAddAgendaModal() {
    const day = state.days[activeDayIndex];
    openModal(`Adicionar a ${day.shortDate}`, `
      <form id="f-ag" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Hora</label><input type="time" id="a-time" class="input mono" value="19:30" required /></div>
          <div><label class="field-label">Plano / Reserva</label><input id="a-title" class="input" placeholder="Ex: Jantar Kotatsu" required /></div>
        </div>
        <div><label class="field-label">Nota opcional</label><input id="a-note" class="input" /></div>
        <div style="display:flex;justify-content:flex-end;margin-top:6px;"><button type="submit" class="btn btn-primary">Adicionar</button></div>
      </form>
    `);
    document.getElementById('f-ag').addEventListener('submit', (e) => {
      e.preventDefault();
      day.items.push({ id: `ag-${Date.now()}`, time: document.getElementById('a-time').value, title: document.getElementById('a-title').value.trim(), note: document.getElementById('a-note').value.trim(), done: false });
      day.items.sort((a, b) => a.time.localeCompare(b.time));
      saveState(); renderPlanner(); closeModal(); showToast('Adicionado!');
    });
  }

  function openSchedModal(venueId) {
    const v = state.venues.find((x) => x.id === venueId);
    if (!v) return;
    openModal(`Agendar ${v.name}`, `
      <form id="f-sv" class="form-grid">
        <div><label class="field-label">Escolher Dia</label><select id="sv-d" class="select">${state.days.map((d, i) => `<option value="${i}" ${i===activeDayIndex?'selected':''}>${escapeHtml(d.shortDate)}</option>`).join('')}</select></div>
        <div><label class="field-label">Hora</label><input type="time" id="sv-t" class="input mono" value="19:30" required /></div>
        <div style="display:flex;justify-content:flex-end;margin-top:6px;"><button type="submit" class="btn btn-primary">Agendar</button></div>
      </form>
    `);
    document.getElementById('f-sv').addEventListener('submit', (e) => {
      e.preventDefault();
      const idx = Number(document.getElementById('sv-d').value);
      const d = state.days[idx];
      d.items.push({ id: `v-${Date.now()}`, time: document.getElementById('sv-t').value, title: v.name, note: v.cuisine, done: false });
      d.dinnerChoice = v.name;
      activeDayIndex = idx;
      saveState(); renderPlanner(); closeModal(); showToast(`Agendado em ${d.shortDate}`);
    });
  }

  document.querySelectorAll('[data-view-target]').forEach((b) => b.addEventListener('click', () => switchView(b.getAttribute('data-view-target'))));
  document.getElementById('brand-home-link')?.addEventListener('click', (e) => { e.preventDefault(); switchView('overview'); });
  document.getElementById('hero-btn-flights')?.addEventListener('click', () => switchView('flights'));
  document.getElementById('hero-btn-resort')?.addEventListener('click', () => switchView('resort'));
  document.getElementById('overview-all-dining-btn')?.addEventListener('click', () => switchView('resort'));
  document.getElementById('btn-open-wallet')?.addEventListener('click', openWalletModal);
  document.getElementById('overview-edit-wallet-btn')?.addEventListener('click', openWalletModal);
  document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', (e) => { if (e.target.id === 'modal-backdrop') closeModal(); });

  document.querySelectorAll('[data-flight-dir]').forEach((b) =>
    b.addEventListener('click', () => {
      activeFlightDir = b.getAttribute('data-flight-dir');
      document.querySelectorAll('[data-flight-dir]').forEach((x) => x.classList.toggle('is-active', x.getAttribute('data-flight-dir') === activeFlightDir));
      renderFlights();
    })
  );

  document.getElementById('btn-add-agenda-item')?.addEventListener('click', openAddAgendaModal);
  document.getElementById('planner-dinner-select')?.addEventListener('change', (e) => { state.days[activeDayIndex].dinnerChoice = e.target.value; saveState(); renderPlanner(); });
  document.getElementById('planner-day-notes')?.addEventListener('input', (e) => { state.days[activeDayIndex].notes = e.target.value; saveState(); });

  document.querySelectorAll('[data-venue-cat]').forEach((c) =>
    c.addEventListener('click', () => {
      activeVenueCategory = c.getAttribute('data-venue-cat');
      document.querySelectorAll('[data-venue-cat]').forEach((x) => x.classList.toggle('is-active', x.getAttribute('data-venue-cat') === activeVenueCategory));
      renderResortVenues();
    })
  );
  document.getElementById('resort-time-sim')?.addEventListener('change', renderResortVenues);

  document.getElementById('form-add-pack-item')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = document.getElementById('input-new-pack-item');
    if (inp.value.trim()) {
      state.packing.push({ id: `p-${Date.now()}`, category: 'Personalizado', item: inp.value.trim(), checked: false });
      inp.value = '';
      saveState(); renderPacking(); renderOverview();
    }
  });

  [['conv-mxn', 'MXN'], ['conv-eur', 'EUR'], ['conv-usd', 'USD'], ['conv-cad', 'CAD']].forEach(([id, c]) =>
    document.getElementById(id)?.addEventListener('input', (e) => updateCurrency(c, e.target.value))
  );
  document.querySelectorAll('[data-mxn-preset]').forEach((b) =>
    b.addEventListener('click', () => {
      const m = b.getAttribute('data-mxn-preset');
      document.getElementById('conv-mxn').value = m;
      updateCurrency('MXN', m);
    })
  );

  document.getElementById('form-add-expense')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const l = document.getElementById('exp-label');
    const a = document.getElementById('exp-amount');
    const c = document.getElementById('exp-currency');
    if (l.value.trim() && a.value) {
      state.expenses.push({ id: `e-${Date.now()}`, label: l.value.trim(), amount: parseFloat(a.value), currency: c.value });
      l.value = ''; a.value = '';
      saveState(); renderExpenses();
    }
  });

  /* ========================================================================
     Cocktails Rating (Privado)
     ======================================================================== */

  function renderCocktails() {
    const grid = document.getElementById('cocktails-list-grid');
    const badge = document.getElementById('cocktails-count-badge');
    const rankBox = document.getElementById('cocktails-ranking-box');
    if (!grid) return;

    const list = Array.isArray(state.cocktails) ? state.cocktails : [];
    if (badge) badge.textContent = `${list.length} avaliado${list.length === 1 ? '' : 's'}`;

    const getAvg = (c) => {
      if (c.aspects) {
        return (c.aspects.flavor + c.aspects.fresh + c.aspects.strength + c.aspects.look) / 4;
      }
      return Number(c.rating || 5);
    };

    const sorted = [...list].sort((a, b) => getAvg(b) - getAvg(a));

    if (rankBox) {
      if (sorted.length) {
        const medals = ['🥇', '🥈', '🥉', '4º', '5º'];
        rankBox.innerHTML = `
          <div class="surface">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <h3 style="font-size:1.1rem;">🏆 Top Melhores Cocktails</h3>
              <span class="tag tag-cenote">Top ${Math.min(5, sorted.length)}</span>
            </div>
            <div class="open-now-list">
              ${sorted
                .slice(0, 5)
                .map(
                  (c, i) => `
                  <div class="open-venue-row">
                    <div style="display:flex;align-items:center;gap:10px;">
                      ${c.photoUrl ? `<img src="${escapeHtml(c.photoUrl)}" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:8px;" />` : ''}
                      <div>
                        <strong>${medals[i]} ${escapeHtml(c.name)}</strong>
                        <span style="font-size:0.78rem;color:var(--ink-secondary);margin-left:6px;">${escapeHtml(c.bar)}</span>
                      </div>
                    </div>
                    <span class="tag tag-cenote mono">★ ${getAvg(c).toFixed(1)} / 5</span>
                  </div>`
                )
                .join('')}
            </div>
          </div>
        `;
      } else {
        rankBox.innerHTML = '';
      }
    }

    if (!sorted.length) {
      grid.innerHTML = `<div class="surface"><p style="font-size:0.86rem;color:var(--ink-secondary);">Ainda nenhum cocktail avaliado. Registe o primeiro acima!</p></div>`;
      return;
    }

    grid.innerHTML = sorted
      .map((c, idx) => {
        const avg = getAvg(c).toFixed(1);
        const a = c.aspects;
        return `
          <article class="venue-card">
            <div>
              ${c.photoUrl ? `<img src="${escapeHtml(c.photoUrl)}" alt="${escapeHtml(c.name)}" style="width:100%;height:190px;object-fit:cover;border-radius:10px;margin-bottom:10px;" loading="lazy" />` : ''}
              <div class="venue-top">
                <div>
                  <h3 class="venue-name">#${idx + 1} ${escapeHtml(c.name)}</h3>
                  <div class="venue-cuisine">${escapeHtml(c.bar)}</div>
                </div>
                <span class="tag tag-cenote mono">★ ${avg} / 5</span>
              </div>
              ${a ? `
                <div style="margin-top:10px;padding:8px 10px;border-radius:8px;background:var(--bg-canvas);font-size:0.76rem;color:var(--ink-secondary);">
                  <div class="mono" style="display:flex;flex-wrap:wrap;gap:6px 10px;">
                    <span>Sabor <strong>${a.flavor}★</strong></span>
                    <span>Frescura <strong>${a.fresh}★</strong></span>
                    <span>Álcool <strong>${a.strength}★</strong></span>
                    <span>Visual <strong>${a.look}★</strong></span>
                  </div>
                </div>
              ` : ''}
              ${c.note ? `<p class="venue-desc" style="margin-top:8px;">"${escapeHtml(c.note)}"</p>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--line-soft);font-size:0.76rem;color:var(--ink-muted);">
              <span>Avaliado por <strong>${escapeHtml(c.by || 'Casal')}</strong></span>
              <button type="button" class="icon-btn" data-del-ck="${escapeHtml(c.id)}" title="Remover">✕</button>
            </div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-del-ck]').forEach((b) =>
      b.addEventListener('click', () => {
        state.cocktails = (state.cocktails || []).filter((x) => x.id !== b.getAttribute('data-del-ck'));
        saveState();
        renderCocktails();
      })
    );
  }

  document.getElementById('form-add-cocktail')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('ck-name').value.trim();
    const bar = document.getElementById('ck-bar').value;
    const flavor = Number(document.getElementById('ck-flavor').value) || 4;
    const fresh = Number(document.getElementById('ck-fresh').value) || 4;
    const strength = Number(document.getElementById('ck-strength').value) || 4;
    const look = Number(document.getElementById('ck-look').value) || 4;
    const byInput = document.getElementById('ck-by')?.value.trim();
    const note = document.getElementById('ck-note').value.trim();
    const photoInput = document.getElementById('ck-photo');
    const photoFile = photoInput?.files?.[0];
    if (!name) return;

    let photoUrl = '';
    if (photoFile && sbClient && sbUser) {
      showToast('A carregar foto do cocktail...');
      const ext = (photoFile.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `cocktails/${Date.now()}.${ext}`;
      const { error: upErr } = await sbClient.storage.from('trip-photos').upload(path, photoFile, { upsert: false });
      if (!upErr) {
        const { data: pub } = sbClient.storage.from('trip-photos').getPublicUrl(path);
        photoUrl = pub?.publicUrl || '';
      }
    }

    const avg = (flavor + fresh + strength + look) / 4;
    if (!Array.isArray(state.cocktails)) state.cocktails = [];
    state.cocktails.push({
      id: `ck-${Date.now()}`,
      name,
      bar,
      rating: avg,
      aspects: { flavor, fresh, strength, look },
      photoUrl,
      note,
      by: byInput || (sbUser?.email ? sbUser.email.split('@')[0] : 'Casal'),
      createdAt: new Date().toISOString()
    });
    document.getElementById('ck-name').value = '';
    document.getElementById('ck-note').value = '';
    if (photoInput) photoInput.value = '';
    saveState();
    renderCocktails();
    showToast(`Cocktail avaliado (${avg.toFixed(1)}★)!`);
  });

  /* ========================================================================
     Supabase Cloud Sync, Public Photos & Private Sections Gate
     ======================================================================== */

  const PUBLIC_VIEWS = new Set(['flights', 'photos']);
  let sbClient = null;
  let sbUser = null;
  let syncTimer = null;

  function openLoginModal() {
    openModal('Área Privada do Casal', `
      <form id="form-modal-login" class="form-grid">
        <p style="font-size:0.84rem;color:var(--ink-secondary);">
          Os <strong>Voos &amp; Radar</strong> e as <strong>Fotos</strong> são públicos. Inicie sessão para aceder ao Plano dos 10 Dias, Restaurantes, Avaliação de Cocktails e Mala.
        </p>
        <div><label class="field-label">Email</label><input id="ml-email" type="email" class="input" required /></div>
        <div><label class="field-label">Password</label><input id="ml-pass" type="password" class="input" required /></div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;">
          <button type="submit" class="btn btn-primary">Entrar</button>
        </div>
      </form>
    `);
    document.getElementById('form-modal-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!sbClient) { showToast('Supabase não configurado'); return; }
      const email = document.getElementById('ml-email').value.trim();
      const password = document.getElementById('ml-pass').value;
      const { error } = await sbClient.auth.signInWithPassword({ email, password });
      if (error) showToast(`Erro de login: ${error.message}`);
      else {
        closeModal();
        showToast('Bem-vindos! Área privada desbloqueada.');
      }
    });
  }

  function updateAuthVisibility() {
    const isLoggedIn = Boolean(sbUser);
    document.querySelectorAll('[data-private-only="true"]').forEach((el) => {
      el.style.display = isLoggedIn ? '' : 'none';
    });

    const authBtn = document.getElementById('btn-header-auth');
    if (authBtn) {
      authBtn.textContent = isLoggedIn ? 'Sair' : 'Entrar (Privado)';
      authBtn.className = isLoggedIn ? 'btn btn-sm' : 'btn btn-primary btn-sm';
    }

    if (!isLoggedIn && !PUBLIC_VIEWS.has(activeView)) {
      switchView('flights');
    }
    renderPhotosAndSync();
  }

  document.getElementById('btn-header-auth')?.addEventListener('click', () => {
    if (sbUser && sbClient) {
      sbClient.auth.signOut();
      showToast('Sessão terminada');
    } else {
      openLoginModal();
    }
  });

  function initSupabase() {
    const cfg = window.SUPABASE_CONFIG || {};
    if (window.supabase && cfg.url && cfg.anonKey) {
      sbClient = window.supabase.createClient(cfg.url, cfg.anonKey);
      sbClient.auth.getSession().then(({ data }) => {
        sbUser = data?.session?.user || null;
        updateAuthVisibility();
        loadPhotosGallery();
        if (sbUser) pullStateFromSupabase();
      });
      sbClient.auth.onAuthStateChange((_evt, session) => {
        sbUser = session?.user || null;
        updateAuthVisibility();
        loadPhotosGallery();
        if (sbUser) pullStateFromSupabase();
      });
    } else {
      updateAuthVisibility();
    }
  }

  function queueCloudSave() {
    if (!sbClient || !sbUser) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      try {
        await sbClient.from('trip_state').upsert({
          id: 'main-trip',
          data: state,
          updated_at: new Date().toISOString()
        });
        const badge = document.getElementById('sync-status-badge');
        if (badge) {
          badge.className = 'tag tag-open';
          badge.textContent = '✓ Sincronizado na Nuvem';
        }
      } catch (err) {
        console.warn('Supabase sync failed:', err);
      }
    }, 600);
  }

  async function pullStateFromSupabase() {
    if (!sbClient || !sbUser) return;
    const { data, error } = await sbClient.from('trip_state').select('data').eq('id', 'main-trip').maybeSingle();
    if (!error && data && data.data) {
      state = { ...JSON.parse(JSON.stringify(window.DEFAULT_TRIP_DATA)), ...data.data };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
      renderOverview();
      renderFlights();
      renderPlanner();
      renderResortVenues();
      renderCocktails();
      renderPacking();
      renderExpenses();
    }
  }

  async function loadPhotosGallery() {
    const grid = document.getElementById('photos-gallery-grid');
    if (!grid || !sbClient) return;
    grid.innerHTML = `<p style="font-size:0.85rem;color:var(--ink-secondary);">A carregar álbum de fotografias...</p>`;

    const { data: rows, error } = await sbClient
      .from('trip_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !rows || !rows.length) {
      grid.innerHTML = `<div class="surface"><p style="font-size:0.86rem;color:var(--ink-secondary);">Ainda sem fotografias publicadas.</p></div>`;
      return;
    }

    const cards = [];
    for (const row of rows) {
      const { data: pub } = sbClient.storage.from('trip-photos').getPublicUrl(row.storage_path);
      const imgUrl = pub?.publicUrl || '';
      cards.push(`
        <article class="venue-card" style="padding:12px;gap:10px;">
          ${imgUrl ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(row.caption || 'Foto da viagem')}" style="width:100%;height:230px;object-fit:cover;border-radius:10px;" loading="lazy" />` : ''}
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div>
              <span class="tag tag-cenote">Dia ${row.day_number}</span>
              <div style="font-size:0.85rem;font-weight:600;margin-top:4px;">${escapeHtml(row.caption || '')}</div>
            </div>
            ${sbUser ? `<button type="button" class="icon-btn" data-del-photo="${escapeHtml(row.id)}" data-del-path="${escapeHtml(row.storage_path)}" title="Apagar foto">✕</button>` : ''}
          </div>
        </article>
      `);
    }
    grid.innerHTML = cards.join('');
    grid.querySelectorAll('[data-del-photo]').forEach((b) =>
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-del-photo');
        const path = b.getAttribute('data-del-path');
        await sbClient.storage.from('trip-photos').remove([path]);
        await sbClient.from('trip_photos').delete().eq('id', id);
        showToast('Foto removida');
        loadPhotosGallery();
      })
    );
  }

  function renderPhotosAndSync() {
    const panel = document.getElementById('supabase-auth-panel');
    const uploadPanel = document.getElementById('photos-upload-panel');
    const badge = document.getElementById('sync-status-badge');
    if (!panel) return;

    if (!sbUser) {
      if (badge) { badge.className = 'tag tag-cenote'; badge.textContent = 'Álbum Público'; }
      if (uploadPanel) uploadPanel.style.display = 'none';
      panel.style.display = 'none';
      return;
    }

    panel.style.display = 'block';
    if (badge) { badge.className = 'tag tag-open'; badge.textContent = '✓ Sessão Privada Ativa'; }
    if (uploadPanel) uploadPanel.style.display = 'block';
    panel.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
        <div>
          <strong>Sessão ativa:</strong> <span class="mono">${escapeHtml(sbUser.email)}</span>
          <div style="font-size:0.8rem;color:var(--ink-secondary);">Podem carregar fotografias abaixo e todas as secções privadas estão desbloqueadas.</div>
        </div>
        <button type="button" class="btn btn-sm" id="btn-sb-pull">↻ Sincronizar Agora</button>
      </div>
    `;
    document.getElementById('btn-sb-pull').addEventListener('click', () => { pullStateFromSupabase(); loadPhotosGallery(); showToast('Sincronizado!'); });
  }

  document.getElementById('form-upload-photo')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!sbClient || !sbUser) return;
    const fileInput = document.getElementById('photo-file-input');
    const file = fileInput?.files?.[0];
    if (!file) return;

    const dayNum = Number(document.getElementById('photo-day-select').value) || 1;
    const caption = document.getElementById('photo-caption-input').value.trim();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const storagePath = `day-${dayNum}/${Date.now()}.${ext}`;

    showToast('A carregar fotografia...');
    const { error: upErr } = await sbClient.storage.from('trip-photos').upload(storagePath, file, { upsert: false });
    if (upErr) { showToast(`Erro ao carregar: ${upErr.message}`); return; }

    const { error: dbErr } = await sbClient.from('trip_photos').insert({
      day_number: dayNum,
      caption,
      storage_path: storagePath,
      uploaded_by: sbUser.email || ''
    });
    if (dbErr) { showToast(`Erro na base de dados: ${dbErr.message}`); return; }

    fileInput.value = '';
    document.getElementById('photo-caption-input').value = '';
    showToast('Fotografia publicada!');
    loadPhotosGallery();
  });

  const _origSave = saveState;
  saveState = function () {
    _origSave();
    queueCloudSave();
  };

  activeView = 'flights';
  updateClocksAndCountdown();
  renderOverview();
  renderFlights();
  renderSettings();
  syncCustomBarsToCocktailSelect();
  renderPlanner();
  renderResortVenues();
  renderCocktails();
  renderPacking();
  updateCurrency('MXN', '400');
  renderExpenses();
  initSupabase();
  setInterval(updateClocksAndCountdown, 30000);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
