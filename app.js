/* ==========================================================================
   Platinum Yucatán Princess — Application Logic & Offline State Engine
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'pyp_stay_companion_state_v1';

  // Deep clone default state and merge any persisted user edits
  function loadState() {
    const base = JSON.parse(JSON.stringify(window.DEFAULT_TRIP_DATA));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return base;
      return {
        ...base,
        ...saved,
        wallet: { ...base.wallet, ...(saved.wallet || {}) },
        rates: { ...base.rates, ...(saved.rates || {}) }
      };
    } catch (err) {
      console.warn('Could not parse saved trip state, using defaults.', err);
      return base;
    }
  }

  let state = loadState();
  let activeView = 'overview';
  let activeFlightDir = 'outbound';
  let activeDayIndex = getInitialDayIndex();
  let activeVenueCategory = 'all';

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Could not persist state to localStorage.', err);
    }
  }

  function getInitialDayIndex() {
    try {
      const cunToday = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Cancun',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
      const idx = window.DEFAULT_TRIP_DATA.days.findIndex((d) => d.date === cunToday);
      return idx >= 0 ? idx : 0;
    } catch {
      return 0;
    }
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('toast-message');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ========================================================================
     Timezones, Countdown & Open-Hours Engine
     ======================================================================== */

  function formatTzTime(tz) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());
  }

  function getCancunMinutesNow(overrideHm) {
    if (overrideHm && overrideHm !== 'live') {
      const [h, m] = overrideHm.split(':').map(Number);
      return h * 60 + m;
    }
    const hm = formatTzTime('America/Cancun');
    const [h, m] = hm.split(':').map(Number);
    return h * 60 + m;
  }

  function parseHm(hm) {
    const [h, m] = hm.split(':').map(Number);
    return h * 60 + m;
  }

  function evaluateVenueStatus(venue, nowMins) {
    if (!venue.openIntervals || venue.openIntervals.length === 0) {
      return { state: 'closed', label: 'Check Concierge' };
    }

    for (const interval of venue.openIntervals) {
      if (interval.start === '00:00' && interval.end === '24:00') {
        return { state: 'open', label: 'Open 24h' };
      }
      const start = parseHm(interval.start);
      const end = parseHm(interval.end);

      let isOpen = false;
      let minsLeft = 0;

      if (end > start) {
        if (nowMins >= start && nowMins < end) {
          isOpen = true;
          minsLeft = end - nowMins;
        }
      } else {
        // Overnight interval e.g. 22:30 -> 07:00 or 18:00 -> 01:00
        if (nowMins >= start || nowMins < end) {
          isOpen = true;
          minsLeft = nowMins >= start ? 1440 - nowMins + end : end - nowMins;
        }
      }

      if (isOpen) {
        if (minsLeft <= 45) {
          return { state: 'soon', label: `Closing in ${minsLeft}m` };
        }
        return { state: 'open', label: `Open until ${interval.end}` };
      }
    }

    // Check if opening within 60 minutes
    for (const interval of venue.openIntervals) {
      const start = parseHm(interval.start);
      const diff = start >= nowMins ? start - nowMins : 1440 - nowMins + start;
      if (diff > 0 && diff <= 60) {
        return { state: 'soon', label: `Opens at ${interval.start}` };
      }
    }

    return { state: 'closed', label: 'Closed now' };
  }

  function updateClocksAndCountdown() {
    const lis = formatTzTime('Europe/Lisbon');
    const yyz = formatTzTime('America/Toronto');
    const cun = formatTzTime('America/Cancun');

    const elLis = document.getElementById('clock-lis');
    const elYyz = document.getElementById('clock-yyz');
    const elCun = document.getElementById('clock-cun');
    const elOverviewCun = document.getElementById('overview-cun-time');

    if (elLis) elLis.textContent = lis;
    if (elYyz) elYyz.textContent = yyz;
    if (elCun) elCun.textContent = cun;
    if (elOverviewCun) elOverviewCun.textContent = `${cun} EST`;

    // Departure: Sat 28 Nov 2026 10:55 WET (UTC+0)
    const depMs = Date.parse('2026-11-28T10:55:00Z');
    const retMs = Date.parse('2026-12-08T20:10:00Z');
    const nowMs = Date.now();

    const labelEl = document.getElementById('countdown-label');
    const valEl = document.getElementById('countdown-value');

    if (labelEl && valEl) {
      if (nowMs < depMs) {
        const diff = depMs - nowMs;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        labelEl.textContent = 'Departs in (AC 811)';
        valEl.textContent = `${d}d ${h}h ${m}m`;
      } else if (nowMs <= retMs) {
        const dayNum = Math.min(10, Math.max(1, Math.floor((nowMs - depMs) / 86400000) + 1));
        labelEl.textContent = 'Current Stay';
        valEl.textContent = `Day ${dayNum} of 10`;
      } else {
        labelEl.textContent = 'Trip Status';
        valEl.textContent = '10 Nights Completed';
      }
    }
  }

  /* ========================================================================
     Navigation & View Switching
     ======================================================================== */

  function switchView(viewName) {
    activeView = viewName;
    document.querySelectorAll('.view-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === `view-${viewName}`);
    });
    document.querySelectorAll('[data-view-target]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-view-target') === viewName);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ========================================================================
     Render View 1: Overview
     ======================================================================== */

  function renderOverview() {
    // Packing progress stat
    const totalPack = state.packing.length;
    const donePack = state.packing.filter((p) => p.checked).length;
    const heroPack = document.getElementById('hero-pack-progress');
    if (heroPack) heroPack.textContent = `${donePack} / ${totalPack}`;

    // Wallet summary
    const walletLine = document.getElementById('wallet-summary-line');
    if (walletLine) {
      const pnrText = state.wallet.airCanadaPnr
        ? `Air Canada PNR: ${state.wallet.airCanadaPnr}`
        : 'Add your Air Canada PNR & hotel booking code in Travel Wallet';
      walletLine.textContent = pnrText;
    }

    // Mini flight routes
    const outLeg1 = state.flights.outbound.legs[0];
    const outLeg2 = state.flights.outbound.legs[1];
    const inLeg1 = state.flights.inbound.legs[0];
    const inLeg2 = state.flights.inbound.legs[1];

    const summaryEl = document.getElementById('overview-flight-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="flight-mini-route">
          <div>
            <div style="font-size: 0.75rem; color: var(--ink-muted); font-weight: 600;">OUTBOUND · SAT 28 NOV</div>
            <div class="iata-Cluster" style="margin-top: 2px;">
              <span class="iata-code">${escapeHtml(outLeg1.fromCode)}</span>
              <span class="route-arrow">→</span>
              <span class="iata-code">${escapeHtml(outLeg1.toCode)}</span>
              <span class="route-arrow">→</span>
              <span class="iata-code">${escapeHtml(outLeg2.toCode)}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="mono" style="font-weight: 700; font-size: 0.86rem;">${escapeHtml(outLeg1.flightNumber)} · ${escapeHtml(outLeg2.flightNumber)}</div>
            <div class="mono" style="font-size: 0.78rem; color: var(--ink-secondary);">Dep ${escapeHtml(outLeg1.depTime)} LIS · Arr ${escapeHtml(outLeg2.arrTime)} CUN</div>
          </div>
        </div>
        <div class="flight-mini-route">
          <div>
            <div style="font-size: 0.75rem; color: var(--ink-muted); font-weight: 600;">RETURN · TUE 8 DEC</div>
            <div class="iata-Cluster" style="margin-top: 2px;">
              <span class="iata-code">${escapeHtml(inLeg1.fromCode)}</span>
              <span class="route-arrow">→</span>
              <span class="iata-code">${escapeHtml(inLeg1.toCode)}</span>
              <span class="route-arrow">→</span>
              <span class="iata-code">${escapeHtml(inLeg2.toCode)}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="mono" style="font-weight: 700; font-size: 0.86rem;">${escapeHtml(inLeg1.flightNumber)} · ${escapeHtml(inLeg2.flightNumber)}</div>
            <div class="mono" style="font-size: 0.78rem; color: var(--ink-secondary);">Dep ${escapeHtml(inLeg1.depTime)} CUN · Arr ${escapeHtml(inLeg2.arrTime)} LIS</div>
          </div>
        </div>
      `;
    }

    // Document readiness badges
    const badgesEl = document.getElementById('overview-doc-badges');
    if (badgesEl) {
      const etaReady = state.wallet.canadaEta === 'Ready';
      const visitaxReady = state.wallet.mexicoVisitax === 'Ready';
      badgesEl.innerHTML = `
        <span class="tag ${etaReady ? 'tag-open' : 'tag-soon'}">Canada eTA: ${escapeHtml(state.wallet.canadaEta)}</span>
        <span class="tag ${visitaxReady ? 'tag-open' : 'tag-soon'}">Quintana Roo Visitax: ${escapeHtml(state.wallet.mexicoVisitax)}</span>
        <span class="tag tag-cenote">${escapeHtml(state.wallet.suiteBuilding)}</span>
      `;
    }

    // Live Open Now venues
    const nowMins = getCancunMinutesNow('live');
    const openVenues = state.venues
      .map((v) => ({ venue: v, status: evaluateVenueStatus(v, nowMins) }))
      .filter((item) => item.status.state === 'open' || item.status.state === 'soon')
      .slice(0, 4);

    const openEl = document.getElementById('overview-open-venues');
    if (openEl) {
      if (openVenues.length === 0) {
        openEl.innerHTML = `<div class="open-venue-row"><span>Plaza Bar &amp; 24/7 Room Service</span><span class="tag tag-open">Open 24h</span></div>`;
      } else {
        openEl.innerHTML = openVenues
          .map(
            ({ venue, status }) => `
            <div class="open-venue-row">
              <div>
                <div style="font-weight: 600; font-size: 0.88rem;">${escapeHtml(venue.name)}</div>
                <div style="font-size: 0.76rem; color: var(--ink-secondary);">${escapeHtml(venue.cuisine)}</div>
              </div>
              <span class="tag ${status.state === 'open' ? 'tag-open' : 'tag-soon'}">${escapeHtml(status.label)}</span>
            </div>
          `
          )
          .join('');
      }
    }
  }

  /* ========================================================================
     Render View 2: Flights & Airport Transit
     ======================================================================== */

  function renderFlights() {
    const container = document.getElementById('flights-container');
    if (!container) return;

    const dirData = state.flights[activeFlightDir];
    const blocks = [];

    blocks.push(`
      <div class="surface" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;">
        <div>
          <div style="font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); font-weight: 700;">
            ${escapeHtml(dirData.dateLabel)}
          </div>
          <div style="font-size: 1.08rem; font-weight: 700; margin-top: 2px;">${escapeHtml(dirData.summary)}</div>
        </div>
        <span class="tag tag-cenote">${escapeHtml(dirData.totalJourney)}</span>
      </div>
    `);

    // Pre-flight resort departure banner if inbound
    const preLayover = dirData.layovers.find((l) => l.beforeFirstLeg);
    if (preLayover) {
      blocks.push(renderLayoverBanner(preLayover));
    }

    dirData.legs.forEach((leg) => {
      blocks.push(`
        <article class="boarding-pass">
          <div class="bp-header">
            <div class="bp-flight-badge">
              <span class="bp-flight-num">${escapeHtml(leg.flightNumber)}</span>
              <span>${escapeHtml(leg.airline)} · ${escapeHtml(leg.aircraft)}</span>
            </div>
            <button type="button" class="btn btn-ghost-light btn-sm" data-edit-leg="${escapeHtml(leg.id)}">
              Edit Gate / Seat / Time
            </button>
          </div>
          <div class="bp-body">
            <div class="bp-route-grid">
              <div>
                <div class="bp-city-code">${escapeHtml(leg.fromCode)}</div>
                <div class="bp-city-name">${escapeHtml(leg.fromCity)}</div>
                <div class="bp-time">${escapeHtml(leg.depTime)} <span style="font-size: 0.74rem; color: var(--ink-muted);">${escapeHtml(leg.depTz)}</span></div>
              </div>

              <div class="bp-duration-track">
                <span class="bp-duration-text">${escapeHtml(leg.duration)}</span>
                <div class="bp-duration-line"></div>
                <span style="font-size: 0.72rem; color: var(--ink-muted);">Direct Leg</span>
              </div>

              <div class="bp-endpoint-right">
                <div class="bp-city-code">${escapeHtml(leg.toCode)}</div>
                <div class="bp-city-name">${escapeHtml(leg.toCity)}</div>
                <div class="bp-time">${escapeHtml(leg.arrTime)} <span style="font-size: 0.74rem; color: var(--ink-muted);">${escapeHtml(leg.arrTz)}</span></div>
              </div>
            </div>

            <div class="bp-details-row">
              <div>
                <div class="bp-field-label">Dep Terminal</div>
                <div class="bp-field-val">${escapeHtml(leg.fromTerminal)}</div>
              </div>
              <div>
                <div class="bp-field-label">Arr Terminal</div>
                <div class="bp-field-val">${escapeHtml(leg.toTerminal)}</div>
              </div>
              <div>
                <div class="bp-field-label">Gate</div>
                <div class="bp-field-val">${escapeHtml(leg.gate)}</div>
              </div>
              <div>
                <div class="bp-field-label">Seat</div>
                <div class="bp-field-val">${escapeHtml(leg.seat)}</div>
              </div>
              <div>
                <div class="bp-field-label">Air Canada PNR</div>
                <div class="bp-field-val">${escapeHtml(state.wallet.airCanadaPnr || 'Add in Wallet')}</div>
              </div>
            </div>

            <p style="margin-top: 14px; font-size: 0.82rem; color: var(--ink-secondary);">
              <strong>Baggage:</strong> ${escapeHtml(leg.baggageNote)}
            </p>
          </div>
        </article>
      `);

      const afterLayover = dirData.layovers.find((l) => l.afterLegId === leg.id);
      if (afterLayover) {
        blocks.push(renderLayoverBanner(afterLayover));
      }
    });

    container.innerHTML = blocks.join('');

    container.querySelectorAll('[data-edit-leg]').forEach((btn) => {
      btn.addEventListener('click', () => openLegEditorModal(btn.getAttribute('data-edit-leg')));
    });
  }

  function renderLayoverBanner(layover) {
    return `
      <div class="layover-banner">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
          <strong style="font-size: 0.94rem;">${escapeHtml(layover.title)}</strong>
          <span class="tag tag-cenote">${escapeHtml(layover.badge)}</span>
        </div>
        <ol class="layover-steps">
          ${layover.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  /* ========================================================================
     Render View 3: 10-Day Stay Planner
     ======================================================================== */

  function renderPlanner() {
    const strip = document.getElementById('day-selector-strip');
    if (strip) {
      strip.innerHTML = state.days
        .map(
          (d, idx) => `
          <button
            type="button"
            class="day-pill ${idx === activeDayIndex ? 'is-active' : ''}"
            data-day-idx="${idx}"
            role="tab"
            aria-selected="${idx === activeDayIndex}"
          >
            <span class="day-pill-num">${d.dayNumber <= 10 ? `Night ${d.dayNumber}` : 'Check-Out'}</span>
            <span class="day-pill-date">${escapeHtml(d.shortDate)}</span>
            <span class="day-pill-tag">${escapeHtml(d.theme)}</span>
          </button>
        `
        )
        .join('');

      strip.querySelectorAll('[data-day-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeDayIndex = Number(btn.getAttribute('data-day-idx'));
          renderPlanner();
        });
      });
    }

    const day = state.days[activeDayIndex];
    if (!day) return;

    const badgeEl = document.getElementById('planner-day-badge');
    const titleEl = document.getElementById('planner-day-title');
    if (badgeEl) {
      badgeEl.textContent = day.dayNumber <= 10 ? `Day ${day.dayNumber} · Night ${day.dayNumber} of 10` : 'Day 11 · Departure Day';
    }
    if (titleEl) {
      titleEl.textContent = `${day.shortDate} — ${day.theme}`;
    }

    const dinnerSelect = document.getElementById('planner-dinner-select');
    if (dinnerSelect) {
      // Ensure custom dinner choice exists in options
      const exists = Array.from(dinnerSelect.options).some((opt) => opt.value === day.dinnerChoice);
      if (!exists && day.dinnerChoice) {
        const opt = document.createElement('option');
        opt.value = day.dinnerChoice;
        opt.textContent = day.dinnerChoice;
        dinnerSelect.appendChild(opt);
      }
      dinnerSelect.value = day.dinnerChoice || '';
    }

    const notesEl = document.getElementById('planner-day-notes');
    if (notesEl) {
      notesEl.value = day.notes || '';
    }

    const agendaList = document.getElementById('planner-agenda-list');
    if (agendaList) {
      const sortedItems = [...day.items].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      if (sortedItems.length === 0) {
        agendaList.innerHTML = `<p style="color: var(--ink-muted); font-size: 0.88rem; padding: 8px 0;">No scheduled items yet—enjoy an unhurried Caribbean day or tap "+ Add Activity".</p>`;
      } else {
        agendaList.innerHTML = sortedItems
          .map(
            (item) => `
            <div class="agenda-item ${item.done ? 'is-done' : ''}">
              <label class="agenda-left" style="cursor: pointer; flex: 1;">
                <input
                  type="checkbox"
                  class="check-circle"
                  data-toggle-agenda="${escapeHtml(item.id)}"
                  ${item.done ? 'checked' : ''}
                />
                <div>
                  <span class="agenda-time">${escapeHtml(item.time)}</span>
                  <div class="agenda-title">${escapeHtml(item.title)}</div>
                  ${item.note ? `<div class="agenda-note">${escapeHtml(item.note)}</div>` : ''}
                </div>
              </label>
              <button type="button" class="icon-btn" title="Remove item" data-delete-agenda="${escapeHtml(item.id)}">✕</button>
            </div>
          `
          )
          .join('');
      }

      agendaList.querySelectorAll('[data-toggle-agenda]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const id = chk.getAttribute('data-toggle-agenda');
          const target = day.items.find((i) => i.id === id);
          if (target) {
            target.done = chk.checked;
            saveState();
            renderPlanner();
          }
        });
      });

      agendaList.querySelectorAll('[data-delete-agenda]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-delete-agenda');
          day.items = day.items.filter((i) => i.id !== id);
          saveState();
          renderPlanner();
          showToast('Activity removed');
        });
      });
    }
  }

  /* ========================================================================
     Render View 4: Resort & Dining Guide
     ======================================================================== */

  function renderResortVenues() {
    const grid = document.getElementById('venue-cards-grid');
    const simSelect = document.getElementById('resort-time-sim');
    if (!grid) return;

    const simVal = simSelect ? simSelect.value : 'live';
    const nowMins = getCancunMinutesNow(simVal);

    const filtered = state.venues.filter((venue) => {
      if (activeVenueCategory === 'all') return true;
      if (activeVenueCategory === 'open') {
        const st = evaluateVenueStatus(venue, nowMins).state;
        return st === 'open' || st === 'soon';
      }
      return venue.category === activeVenueCategory;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="surface"><p style="color: var(--ink-secondary);">No venues match this filter at the selected time.</p></div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((venue) => {
        const status = evaluateVenueStatus(venue, nowMins);
        const statusClass =
          status.state === 'open' ? 'tag-open' : status.state === 'soon' ? 'tag-soon' : 'tag-closed';

        return `
          <article class="venue-card">
            <div>
              <div class="venue-top">
                <div>
                  <h3 class="venue-name">${escapeHtml(venue.name)}</h3>
                  <div class="venue-cuisine">${escapeHtml(venue.cuisine)}</div>
                </div>
                <span class="tag ${statusClass}">${escapeHtml(status.label)}</span>
              </div>

              <p class="venue-desc">${escapeHtml(venue.description)}</p>
            </div>

            <div>
              <div class="venue-meta-list">
                <div><strong>Hours:</strong> ${escapeHtml(venue.hoursLabel)}</div>
                <div><strong>Dress Code:</strong> ${escapeHtml(venue.dressCode)}</div>
                <div>
                  <strong>Access:</strong>
                  ${venue.included ? 'All-Inclusive Included' : 'Extra Charge'} ·
                  ${venue.reservationRequired ? 'Reservation Recommended' : 'Walk-In Welcome'}
                </div>
              </div>

              <div class="venue-actions" style="margin-top: 12px;">
                <div style="display: flex; gap: 6px;">
                  <button
                    type="button"
                    class="btn btn-sm ${venue.visited ? 'btn-primary' : ''}"
                    data-toggle-visited="${escapeHtml(venue.id)}"
                  >
                    ${venue.visited ? '✓ Visited' : 'Mark Visited'}
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm"
                    data-schedule-venue="${escapeHtml(venue.id)}"
                  >
                    + Add to Day
                  </button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-toggle-visited]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-visited');
        const v = state.venues.find((item) => item.id === id);
        if (v) {
          v.visited = !v.visited;
          saveState();
          renderResortVenues();
          showToast(v.visited ? `Marked ${v.name} as visited!` : `Unmarked ${v.name}`);
        }
      });
    });

    grid.querySelectorAll('[data-schedule-venue]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-schedule-venue');
        openScheduleVenueModal(id);
      });
    });
  }

  /* ========================================================================
     Render View 5: Packing Checklist, Currency, Expenses & Spanish
     ======================================================================== */

  function renderPacking() {
    const container = document.getElementById('packing-items-container');
    const filterEl = document.getElementById('packing-filter-select');
    const barEl = document.getElementById('packing-progress-bar');
    const textEl = document.getElementById('packing-status-text');

    const total = state.packing.length;
    const checkedCount = state.packing.filter((p) => p.checked).length;
    const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

    if (barEl) barEl.style.width = `${pct}%`;
    if (textEl) textEl.textContent = `${checkedCount} of ${total} essentials packed (${pct}%)`;

    const selectedCat = filterEl ? filterEl.value : 'all';
    const items = state.packing.filter((p) => selectedCat === 'all' || p.category === selectedCat);

    if (container) {
      container.innerHTML = items
        .map(
          (p) => `
          <div class="pack-item ${p.checked ? 'is-checked' : ''}">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
              <input
                type="checkbox"
                class="check-circle"
                style="margin-top: 0;"
                data-pack-id="${escapeHtml(p.id)}"
                ${p.checked ? 'checked' : ''}
              />
              <div>
                <span style="font-size: 0.87rem; font-weight: 500;">${escapeHtml(p.item)}</span>
                <div style="font-size: 0.72rem; color: var(--ink-muted);">${escapeHtml(p.category)}</div>
              </div>
            </label>
            <button type="button" class="icon-btn" title="Remove item" data-del-pack="${escapeHtml(p.id)}">✕</button>
          </div>
        `
        )
        .join('');

      container.querySelectorAll('[data-pack-id]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const item = state.packing.find((x) => x.id === chk.getAttribute('data-pack-id'));
          if (item) {
            item.checked = chk.checked;
            saveState();
            renderPacking();
            renderOverview();
          }
        });
      });

      container.querySelectorAll('[data-del-pack]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-pack');
          state.packing = state.packing.filter((x) => x.id !== id);
          saveState();
          renderPacking();
          renderOverview();
        });
      });
    }
  }

  function updateCurrencyFrom(sourceCurrency, rawVal) {
    const val = parseFloat(rawVal);
    const elMxn = document.getElementById('conv-mxn');
    const elEur = document.getElementById('conv-eur');
    const elUsd = document.getElementById('conv-usd');
    const elCad = document.getElementById('conv-cad');

    if (Number.isNaN(val)) return;

    const { eurToMxn, eurToUsd, eurToCad } = state.rates;
    let eur = 0;
    if (sourceCurrency === 'EUR') eur = val;
    if (sourceCurrency === 'MXN') eur = val / eurToMxn;
    if (sourceCurrency === 'USD') eur = val / eurToUsd;
    if (sourceCurrency === 'CAD') eur = val / eurToCad;

    if (sourceCurrency !== 'MXN' && elMxn) elMxn.value = (eur * eurToMxn).toFixed(0);
    if (sourceCurrency !== 'EUR' && elEur) elEur.value = eur.toFixed(2);
    if (sourceCurrency !== 'USD' && elUsd) elUsd.value = (eur * eurToUsd).toFixed(2);
    if (sourceCurrency !== 'CAD' && elCad) elCad.value = (eur * eurToCad).toFixed(2);
  }

  function toEur(amount, currency) {
    const { eurToMxn, eurToUsd } = state.rates;
    if (currency === 'EUR') return amount;
    if (currency === 'USD') return amount / eurToUsd;
    return amount / eurToMxn;
  }

  function renderExpenses() {
    const listEl = document.getElementById('expenses-list');
    const totalEl = document.getElementById('expenses-total-eur');
    if (!listEl || !totalEl) return;

    const totalEur = state.expenses.reduce((sum, e) => sum + toEur(Number(e.amount) || 0, e.currency), 0);
    totalEl.textContent = `€${totalEur.toFixed(2)}`;

    if (state.expenses.length === 0) {
      listEl.innerHTML = `<p style="font-size: 0.82rem; color: var(--ink-muted);">No extra expenses logged yet.</p>`;
      return;
    }

    listEl.innerHTML = state.expenses
      .slice()
      .reverse()
      .map(
        (exp) => `
        <div class="open-venue-row" style="padding: 8px 10px;">
          <span style="font-size: 0.84rem; font-weight: 500;">${escapeHtml(exp.label)}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="mono" style="font-size: 0.82rem; font-weight: 600;">
              ${Number(exp.amount).toFixed(exp.currency === 'MXN' ? 0 : 2)} ${escapeHtml(exp.currency)}
              <span style="color: var(--ink-muted); font-weight: 400;">(€${toEur(Number(exp.amount), exp.currency).toFixed(2)})</span>
            </span>
            <button type="button" class="icon-btn" data-del-exp="${escapeHtml(exp.id)}" title="Delete">✕</button>
          </div>
        </div>
      `
      )
      .join('');

    listEl.querySelectorAll('[data-del-exp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-exp');
        state.expenses = state.expenses.filter((e) => e.id !== id);
        saveState();
        renderExpenses();
      });
    });
  }

  function renderPhrases() {
    const container = document.getElementById('phrases-container');
    if (!container) return;

    container.innerHTML = state.phrases
      .map(
        (p, idx) => `
        <div class="phrase-card">
          <div>
            <div class="phrase-es">${escapeHtml(p.es)}</div>
            <div class="phrase-en">${escapeHtml(p.en)}</div>
            <div class="mono" style="font-size: 0.72rem; color: var(--cenote-700); margin-top: 2px;">${escapeHtml(p.phonetic)}</div>
          </div>
          <button type="button" class="btn btn-sm" data-copy-phrase="${idx}">Copy</button>
        </div>
      `
      )
      .join('');

    container.querySelectorAll('[data-copy-phrase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const phrase = state.phrases[Number(btn.getAttribute('data-copy-phrase'))];
        if (phrase && navigator.clipboard) {
          navigator.clipboard.writeText(phrase.es).then(() => showToast('Spanish phrase copied!'));
        }
      });
    });
  }

  /* ========================================================================
     Modals: Travel Wallet, Flight Leg Editor, Add Agenda Item, Schedule Venue
     ======================================================================== */

  function openModal(title, htmlContent) {
    const backdrop = document.getElementById('modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    if (!backdrop || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = htmlContent;
    backdrop.classList.add('is-open');
  }

  function closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.remove('is-open');
  }

  function openWalletModal() {
    const w = state.wallet;
    openModal(
      'Travel Wallet & Booking Codes',
      `
      <form id="form-wallet" class="form-grid">
        <div class="form-grid form-grid-2">
          <div>
            <label class="field-label" for="w-pnr">Air Canada PNR (6-char)</label>
            <input type="text" id="w-pnr" class="input mono" placeholder="e.g. K8M4QX" value="${escapeHtml(w.airCanadaPnr)}" />
          </div>
          <div>
            <label class="field-label" for="w-hotel">Resort Booking Reference</label>
            <input type="text" id="w-hotel" class="input mono" placeholder="e.g. PYP-90421" value="${escapeHtml(w.resortBookingRef)}" />
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div>
            <label class="field-label" for="w-suite">Building &amp; Suite Number</label>
            <input type="text" id="w-suite" class="input" placeholder="e.g. Building 5 · Suite 5112" value="${escapeHtml(w.suiteBuilding)}" />
          </div>
          <div>
            <label class="field-label" for="w-transfer">CUN Airport Transfer</label>
            <input type="text" id="w-transfer" class="input" value="${escapeHtml(w.transferProvider)}" />
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div>
            <label class="field-label" for="w-eta">Canada Transit eTA</label>
            <select id="w-eta" class="select">
              <option value="Ready" ${w.canadaEta === 'Ready' ? 'selected' : ''}>Ready / Approved</option>
              <option value="Pending" ${w.canadaEta === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Canadian Passport / Exempt" ${w.canadaEta === 'Canadian Passport / Exempt' ? 'selected' : ''}>Canadian Passport / Exempt</option>
            </select>
          </div>
          <div>
            <label class="field-label" for="w-visitax">Quintana Roo Visitax</label>
            <select id="w-visitax" class="select">
              <option value="Pending" ${w.mexicoVisitax === 'Pending' ? 'selected' : ''}>Pending (Pay before Dec 8)</option>
              <option value="Ready" ${w.mexicoVisitax === 'Ready' ? 'selected' : ''}>Ready (QR Saved Offline)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="field-label" for="w-notes">Personal Travel Notes (Stored Offline)</label>
          <textarea id="w-notes" class="textarea" rows="3">${escapeHtml(w.notes)}</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
          <button type="button" class="btn" id="w-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save to Device</button>
        </div>
      </form>
    `
    );

    document.getElementById('w-cancel').addEventListener('click', closeModal);
    document.getElementById('form-wallet').addEventListener('submit', (e) => {
      e.preventDefault();
      state.wallet.airCanadaPnr = document.getElementById('w-pnr').value.trim().toUpperCase();
      state.wallet.resortBookingRef = document.getElementById('w-hotel').value.trim();
      state.wallet.suiteBuilding = document.getElementById('w-suite').value.trim() || 'Suite TBD';
      state.wallet.transferProvider = document.getElementById('w-transfer').value.trim();
      state.wallet.canadaEta = document.getElementById('w-eta').value;
      state.wallet.mexicoVisitax = document.getElementById('w-visitax').value;
      state.wallet.notes = document.getElementById('w-notes').value.trim();
      saveState();
      renderOverview();
      renderFlights();
      closeModal();
      showToast('Travel Wallet saved offline');
    });
  }

  function openLegEditorModal(legId) {
    const allLegs = [...state.flights.outbound.legs, ...state.flights.inbound.legs];
    const leg = allLegs.find((l) => l.id === legId);
    if (!leg) return;

    openModal(
      `Update ${leg.flightNumber} (${leg.fromCode} → ${leg.toCode})`,
      `
      <form id="form-edit-leg" class="form-grid">
        <div class="form-grid form-grid-2">
          <div>
            <label class="field-label" for="leg-dep">Departure Time</label>
            <input type="text" id="leg-dep" class="input mono" value="${escapeHtml(leg.depTime)}" />
          </div>
          <div>
            <label class="field-label" for="leg-arr">Arrival Time</label>
            <input type="text" id="leg-arr" class="input mono" value="${escapeHtml(leg.arrTime)}" />
          </div>
        </div>
        <div class="form-grid form-grid-2">
          <div>
            <label class="field-label" for="leg-gate">Departure Gate</label>
            <input type="text" id="leg-gate" class="input mono" placeholder="e.g. E74" value="${escapeHtml(leg.gate)}" />
          </div>
          <div>
            <label class="field-label" for="leg-seat">Seat Assignment</label>
            <input type="text" id="leg-seat" class="input mono" placeholder="e.g. 18A" value="${escapeHtml(leg.seat)}" />
          </div>
        </div>
        <div>
          <label class="field-label" for="leg-bag">Baggage / Gate Note</label>
          <input type="text" id="leg-bag" class="input" value="${escapeHtml(leg.baggageNote)}" />
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
          <button type="button" class="btn" id="leg-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Flight Details</button>
        </div>
      </form>
    `
    );

    document.getElementById('leg-cancel').addEventListener('click', closeModal);
    document.getElementById('form-edit-leg').addEventListener('submit', (e) => {
      e.preventDefault();
      leg.depTime = document.getElementById('leg-dep').value.trim() || leg.depTime;
      leg.arrTime = document.getElementById('leg-arr').value.trim() || leg.arrTime;
      leg.gate = document.getElementById('leg-gate').value.trim() || 'TBD';
      leg.seat = document.getElementById('leg-seat').value.trim() || 'TBD';
      leg.baggageNote = document.getElementById('leg-bag').value.trim();
      saveState();
      renderFlights();
      renderOverview();
      closeModal();
      showToast(`${leg.flightNumber} updated`);
    });
  }

  function openAddAgendaModal() {
    const day = state.days[activeDayIndex];
    if (!day) return;

    openModal(
      `Add Activity — ${day.shortDate}`,
      `
      <form id="form-add-agenda" class="form-grid">
        <div class="form-grid form-grid-2">
          <div>
            <label class="field-label" for="ag-time">Time (24h)</label>
            <input type="time" id="ag-time" class="input mono" value="11:00" required />
          </div>
          <div>
            <label class="field-label" for="ag-title">Activity / Reservation</label>
            <input type="text" id="ag-title" class="input" placeholder="e.g. Couples Massage at Spa" required />
          </div>
        </div>
        <div>
          <label class="field-label" for="ag-note">Notes / Location</label>
          <input type="text" id="ag-note" class="input" placeholder="Optional details or meeting point" />
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
          <button type="button" class="btn" id="ag-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Add to ${escapeHtml(day.shortDate)}</button>
        </div>
      </form>
    `
    );

    document.getElementById('ag-cancel').addEventListener('click', closeModal);
    document.getElementById('form-add-agenda').addEventListener('submit', (e) => {
      e.preventDefault();
      day.items.push({
        id: `custom-${Date.now()}`,
        time: document.getElementById('ag-time').value || '12:00',
        title: document.getElementById('ag-title').value.trim(),
        note: document.getElementById('ag-note').value.trim(),
        done: false
      });
      saveState();
      renderPlanner();
      closeModal();
      showToast(`Added to ${day.shortDate}`);
    });
  }

  function openScheduleVenueModal(venueId) {
    const venue = state.venues.find((v) => v.id === venueId);
    if (!venue) return;

    const defaultTime = venue.category === 'alacarte' || venue.category === 'sister' ? '19:30' : '13:00';

    openModal(
      `Add "${venue.name}" to 10-Day Plan`,
      `
      <form id="form-sched-venue" class="form-grid">
        <div>
          <label class="field-label" for="sv-day">Choose Day</label>
          <select id="sv-day" class="select">
            ${state.days
              .map(
                (d, idx) =>
                  `<option value="${idx}" ${idx === activeDayIndex ? 'selected' : ''}>Day ${d.dayNumber} · ${escapeHtml(d.shortDate)} (${escapeHtml(d.theme)})</option>`
              )
              .join('')}
          </select>
        </div>
        <div>
          <label class="field-label" for="sv-time">Time</label>
          <input type="time" id="sv-time" class="input mono" value="${defaultTime}" required />
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
          <button type="button" class="btn" id="sv-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Schedule Visit</button>
        </div>
      </form>
    `
    );

    document.getElementById('sv-cancel').addEventListener('click', closeModal);
    document.getElementById('form-sched-venue').addEventListener('submit', (e) => {
      e.preventDefault();
      const idx = Number(document.getElementById('sv-day').value);
      const time = document.getElementById('sv-time').value || defaultTime;
      const targetDay = state.days[idx];
      if (targetDay) {
        targetDay.items.push({
          id: `venue-${Date.now()}`,
          time,
          title: `${venue.name} (${venue.cuisine})`,
          note: venue.dressCode,
          done: false
        });
        if (venue.category === 'alacarte' || venue.category === 'sister') {
          targetDay.dinnerChoice = venue.name;
        }
        activeDayIndex = idx;
        saveState();
        renderPlanner();
        closeModal();
        showToast(`Scheduled ${venue.name} on ${targetDay.shortDate}`);
      }
    });
  }

  /* ========================================================================
     Event Listeners & Initialization
     ======================================================================== */

  function bindEvents() {
    // View navigation tabs (desktop + mobile dock)
    document.querySelectorAll('[data-view-target]').forEach((btn) => {
      btn.addEventListener('click', () => switchView(btn.getAttribute('data-view-target')));
    });

    document.getElementById('brand-home-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('overview');
    });

    document.getElementById('hero-btn-flights')?.addEventListener('click', () => switchView('flights'));
    document.getElementById('hero-btn-planner')?.addEventListener('click', () => switchView('planner'));
    document.getElementById('overview-all-dining-btn')?.addEventListener('click', () => switchView('resort'));

    // Wallet modal triggers
    document.getElementById('btn-open-wallet')?.addEventListener('click', openWalletModal);
    document.getElementById('overview-edit-wallet-btn')?.addEventListener('click', openWalletModal);
    document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
    document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-backdrop') closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Flight direction toggle
    document.querySelectorAll('[data-flight-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFlightDir = btn.getAttribute('data-flight-dir');
        document.querySelectorAll('[data-flight-dir]').forEach((b) =>
          b.classList.toggle('is-active', b.getAttribute('data-flight-dir') === activeFlightDir)
        );
        renderFlights();
      });
    });

    // Planner controls
    document.getElementById('btn-add-agenda-item')?.addEventListener('click', openAddAgendaModal);
    document.getElementById('planner-dinner-select')?.addEventListener('change', (e) => {
      const day = state.days[activeDayIndex];
      if (day) {
        day.dinnerChoice = e.target.value;
        saveState();
        showToast('Evening dining updated');
      }
    });
    document.getElementById('planner-day-notes')?.addEventListener('input', (e) => {
      const day = state.days[activeDayIndex];
      if (day) {
        day.notes = e.target.value;
        saveState();
      }
    });

    // Resort & Dining filters + time simulator
    document.querySelectorAll('[data-venue-cat]').forEach((chip) => {
      chip.addEventListener('click', () => {
        activeVenueCategory = chip.getAttribute('data-venue-cat');
        document.querySelectorAll('[data-venue-cat]').forEach((c) =>
          c.classList.toggle('is-active', c.getAttribute('data-venue-cat') === activeVenueCategory)
        );
        renderResortVenues();
      });
    });
    document.getElementById('resort-time-sim')?.addEventListener('change', renderResortVenues);

    // Packing list controls
    document.getElementById('packing-filter-select')?.addEventListener('change', renderPacking);
    document.getElementById('form-add-pack-item')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('input-new-pack-item');
      const cat = document.getElementById('select-new-pack-cat');
      if (input && input.value.trim()) {
        state.packing.push({
          id: `pack-${Date.now()}`,
          category: cat ? cat.value : 'Beach, Pool & Cenotes',
          item: input.value.trim(),
          checked: false
        });
        input.value = '';
        saveState();
        renderPacking();
        renderOverview();
        showToast('Item added to packing list');
      }
    });

    // Currency converter inputs & presets
    const mapInputs = [
      ['conv-mxn', 'MXN'],
      ['conv-eur', 'EUR'],
      ['conv-usd', 'USD'],
      ['conv-cad', 'CAD']
    ];
    mapInputs.forEach(([id, code]) => {
      document.getElementById(id)?.addEventListener('input', (e) => updateCurrencyFrom(code, e.target.value));
    });
    document.querySelectorAll('[data-mxn-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mxn = btn.getAttribute('data-mxn-preset');
        const elMxn = document.getElementById('conv-mxn');
        if (elMxn) {
          elMxn.value = mxn;
          updateCurrencyFrom('MXN', mxn);
        }
      });
    });

    // Expense tracker
    document.getElementById('form-add-expense')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const lbl = document.getElementById('exp-label');
      const amt = document.getElementById('exp-amount');
      const cur = document.getElementById('exp-currency');
      if (lbl && amt && lbl.value.trim() && amt.value) {
        state.expenses.push({
          id: `exp-${Date.now()}`,
          label: lbl.value.trim(),
          amount: parseFloat(amt.value),
          currency: cur.value,
          date: new Date().toISOString().slice(0, 10)
        });
        lbl.value = '';
        amt.value = '';
        saveState();
        renderExpenses();
        showToast('Expense logged');
      }
    });

    // Export / Import / Reset JSON backup
    document.getElementById('btn-export-data')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'platinum-yucatan-trip-backup.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup downloaded');
    });

    document.getElementById('input-import-data')?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(String(reader.result));
          if (imported && imported.flights && imported.days) {
            state = imported;
            saveState();
            renderAll();
            showToast('Trip backup restored!');
          } else {
            showToast('Invalid backup file');
          }
        } catch {
          showToast('Could not read JSON file');
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      if (window.confirm('Reset all custom edits back to the default Nov 28 – Dec 8 itinerary?')) {
        localStorage.removeItem(STORAGE_KEY);
        state = loadState();
        renderAll();
        showToast('Defaults restored');
      }
    });
  }

  function renderAll() {
    updateClocksAndCountdown();
    renderOverview();
    renderFlights();
    renderPlanner();
    renderResortVenues();
    renderPacking();
    updateCurrencyFrom('MXN', document.getElementById('conv-mxn')?.value || '400');
    renderExpenses();
    renderPhrases();
  }

  // Initialize application
  bindEvents();
  renderAll();
  setInterval(() => {
    updateClocksAndCountdown();
    if (activeView === 'overview') renderOverview();
  }, 30000);

  // Register Service Worker for airplane & resort offline access
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
