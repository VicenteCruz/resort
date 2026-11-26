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

    const o1 = state.flights.outbound.legs[0];
    const o2 = state.flights.outbound.legs[1];
    const i1 = state.flights.inbound.legs[0];
    const i2 = state.flights.inbound.legs[1];

    document.getElementById('overview-flight-summary').innerHTML = `
      <div class="flight-mini-route">
        <div>
          <div style="font-size: 0.74rem; color: var(--ink-muted); font-weight: 600;">IDA · SÁB 28 NOV</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
            <span class="iata-code">${escapeHtml(o1.fromCode)}</span> → <span class="iata-code">${escapeHtml(o1.toCode)}</span> → <span class="iata-code">${escapeHtml(o2.toCode)}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="mono" style="font-weight: 700; font-size: 0.86rem;">${escapeHtml(o1.flightNumber)} · ${escapeHtml(o2.flightNumber)}</div>
          <div class="mono" style="font-size: 0.78rem; color: var(--ink-secondary);">${escapeHtml(o1.depTime)} LIS → ${escapeHtml(o2.arrTime)} CUN</div>
        </div>
      </div>
      <div class="flight-mini-route">
        <div>
          <div style="font-size: 0.74rem; color: var(--ink-muted); font-weight: 600;">REGRESSO · TER 8 DEZ</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
            <span class="iata-code">${escapeHtml(i1.fromCode)}</span> → <span class="iata-code">${escapeHtml(i1.toCode)}</span> → <span class="iata-code">${escapeHtml(i2.toCode)}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="mono" style="font-weight: 700; font-size: 0.86rem;">${escapeHtml(i1.flightNumber)} · ${escapeHtml(i2.flightNumber)}</div>
          <div class="mono" style="font-size: 0.78rem; color: var(--ink-secondary);">${escapeHtml(i1.depTime)} CUN → ${escapeHtml(i2.arrTime)} LIS</div>
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
    return getFlightIata(flightNumber).replace(/^AC/, 'ACA');
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
              <button type="button" class="btn btn-ghost-light btn-sm" data-edit-leg="${escapeHtml(leg.id)}">Editar</button>
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

  function renderResortVenues() {
    const sim = document.getElementById('resort-time-sim').value;
    const nowMins = getCancunMinutesNow(sim);
    const list = state.venues.filter((v) => {
      if (activeVenueCategory === 'all') return true;
      if (activeVenueCategory === 'open') {
        const s = evaluateVenueStatus(v, nowMins).state;
        return s === 'open' || s === 'soon';
      }
      return v.category === activeVenueCategory;
    });

    const grid = document.getElementById('venue-cards-grid');
    grid.innerHTML = list
      .map((v) => {
        const st = evaluateVenueStatus(v, nowMins);
        const cls = st.state === 'open' ? 'tag-open' : st.state === 'soon' ? 'tag-soon' : 'tag-closed';
        return `
          <article class="venue-card">
            <div>
              <div class="venue-top">
                <div>
                  <h3 class="venue-name">${escapeHtml(v.name)}</h3>
                  <div class="venue-cuisine">${escapeHtml(v.cuisine)}</div>
                </div>
                <span class="tag ${cls}">${escapeHtml(st.label)}</span>
              </div>
              <p class="venue-desc">${escapeHtml(v.description)}</p>
            </div>
            <div>
              <div class="venue-meta-list">
                <div><strong>Horário:</strong> ${escapeHtml(v.hoursLabel)}</div>
                <div><strong>Dress Code:</strong> ${escapeHtml(v.dressCode)}</div>
                <div><strong>Acesso:</strong> ${v.included ? 'Incluído' : 'Pago à parte'} · ${v.reservationRequired ? 'Requer Reserva' : 'Sem Reserva'}</div>
              </div>
              <div style="display:flex;gap:6px;margin-top:12px;">
                <button type="button" class="btn btn-sm ${v.visited ? 'btn-primary' : ''}" data-visit="${escapeHtml(v.id)}">${v.visited ? '✓ Visitado' : 'Marcar Visitado'}</button>
                <button type="button" class="btn btn-sm" data-sched="${escapeHtml(v.id)}">+ Agendar Dia</button>
              </div>
            </div>
          </article>`;
      })
      .join('');

    grid.querySelectorAll('[data-visit]').forEach((b) =>
      b.addEventListener('click', () => {
        const v = state.venues.find((x) => x.id === b.getAttribute('data-visit'));
        if (v) { v.visited = !v.visited; saveState(); renderResortVenues(); }
      })
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

  function openLegModal(id) {
    const leg = [...state.flights.outbound.legs, ...state.flights.inbound.legs].find((l) => l.id === id);
    if (!leg) return;
    openModal(`Editar ${leg.flightNumber}`, `
      <form id="f-leg" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Hora Partida</label><input id="l-dep" class="input mono" value="${escapeHtml(leg.depTime)}" /></div>
          <div><label class="field-label">Hora Chegada</label><input id="l-arr" class="input mono" value="${escapeHtml(leg.arrTime)}" /></div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Porta (Gate)</label><input id="l-gate" class="input mono" value="${escapeHtml(leg.gate)}" /></div>
          <div><label class="field-label">Lugar (Seat)</label><input id="l-seat" class="input mono" value="${escapeHtml(leg.seat)}" /></div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:6px;"><button type="submit" class="btn btn-primary">Guardar Voo</button></div>
      </form>
    `);
    document.getElementById('f-leg').addEventListener('submit', (e) => {
      e.preventDefault();
      leg.depTime = document.getElementById('l-dep').value.trim() || leg.depTime;
      leg.arrTime = document.getElementById('l-arr').value.trim() || leg.arrTime;
      leg.gate = document.getElementById('l-gate').value.trim() || 'A definir';
      leg.seat = document.getElementById('l-seat').value.trim() || 'A definir';
      saveState(); renderFlights(); renderOverview(); closeModal(); showToast('Voo atualizado!');
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
    if (!grid) return;

    const list = Array.isArray(state.cocktails) ? state.cocktails : [];
    if (badge) badge.textContent = `${list.length} avaliado${list.length === 1 ? '' : 's'}`;

    if (!list.length) {
      grid.innerHTML = `<div class="surface"><p style="font-size:0.86rem;color:var(--ink-secondary);">Ainda nenhum cocktail avaliado. Registe o primeiro acima!</p></div>`;
      return;
    }

    const sorted = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    grid.innerHTML = sorted
      .map((c) => {
        const stars = '★'.repeat(c.rating || 5) + '☆'.repeat(5 - (c.rating || 5));
        return `
          <article class="venue-card">
            <div>
              <div class="venue-top">
                <div>
                  <h3 class="venue-name">${escapeHtml(c.name)}</h3>
                  <div class="venue-cuisine">${escapeHtml(c.bar)}</div>
                </div>
                <span class="tag tag-cenote mono">${stars}</span>
              </div>
              ${c.note ? `<p class="venue-desc">${escapeHtml(c.note)}</p>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--line-soft);font-size:0.76rem;color:var(--ink-muted);">
              <span>${escapeHtml(c.by || '')}</span>
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

  document.getElementById('form-add-cocktail')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ck-name').value.trim();
    const bar = document.getElementById('ck-bar').value;
    const rating = Number(document.getElementById('ck-rating').value) || 5;
    const note = document.getElementById('ck-note').value.trim();
    if (!name) return;

    if (!Array.isArray(state.cocktails)) state.cocktails = [];
    state.cocktails.push({
      id: `ck-${Date.now()}`,
      name,
      bar,
      rating,
      note,
      by: sbUser?.email ? sbUser.email.split('@')[0] : 'Casal',
      createdAt: new Date().toISOString()
    });
    document.getElementById('ck-name').value = '';
    document.getElementById('ck-note').value = '';
    saveState();
    renderCocktails();
    showToast('Cocktail avaliado!');
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
