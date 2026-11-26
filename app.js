(function () {
  'use strict';

  const STORAGE_KEY = 'pyp_stay_pt_v2';

  const COMMON_TIMEZONES = [
    { tz: 'Europe/Lisbon', label: 'Portugal (Lisboa / Porto)' },
    { tz: 'Atlantic/Azores', label: 'Açores (Ponta Delgada)' },
    { tz: 'Europe/London', label: 'Reino Unido (Londres)' },
    { tz: 'Europe/Madrid', label: 'Europa Central (Madrid / Paris / Roma)' },
    { tz: 'Europe/Athens', label: 'Europa de Leste (Atenas)' },
    { tz: 'Atlantic/Cape_Verde', label: 'Cabo Verde (Praia)' },
    { tz: 'Africa/Casablanca', label: 'Marrocos (Casablanca)' },
    { tz: 'America/Sao_Paulo', label: 'Brasil (São Paulo / Rio)' },
    { tz: 'America/Santo_Domingo', label: 'Caraíbas (Punta Cana)' },
    { tz: 'America/New_York', label: 'EUA Este (Nova Iorque / Miami)' },
    { tz: 'America/Toronto', label: 'Canadá Este (Toronto / Montreal)' },
    { tz: 'America/Cancun', label: 'México — Cancún / Riviera Maya' },
    { tz: 'America/Mexico_City', label: 'México — Cidade do México' },
    { tz: 'America/Chicago', label: 'EUA Centro (Chicago / Dallas)' },
    { tz: 'America/Los_Angeles', label: 'EUA Oeste (Los Angeles / SF)' },
    { tz: 'America/Bogota', label: 'Colômbia / Panamá' },
    { tz: 'Asia/Dubai', label: 'Dubai (Emirados)' },
    { tz: 'Asia/Bangkok', label: 'Tailândia (Banguecoque)' },
    { tz: 'Asia/Singapore', label: 'Singapura / Bali' },
    { tz: 'Asia/Tokyo', label: 'Japão (Tóquio)' },
    { tz: 'Australia/Sydney', label: 'Austrália (Sydney)' },
    { tz: 'UTC', label: 'UTC / GMT' }
  ];

  const TZ_OFFSETS = {
    WET: 0, WEST: 1, GMT: 0, UTC: 0, BST: 1, CET: 1, CEST: 2, EET: 2, EEST: 3,
    AZOT: -1, AZOST: 0, CVT: -1, BRT: -3, AST: -4, EST: -5, EDT: -4,
    CST: -6, CDT: -5, MST: -7, MDT: -6, PST: -8, PDT: -7,
    GST: 4, IST: 5.5, ICT: 7, SGT: 8, JST: 9, AEST: 10, AEDT: 11
  };

  const TZ_ABBR_TO_IANA = {
    WET: 'Europe/Lisbon', WEST: 'Europe/Lisbon', GMT: 'Europe/London', BST: 'Europe/London',
    CET: 'Europe/Madrid', CEST: 'Europe/Madrid', EET: 'Europe/Athens', EEST: 'Europe/Athens',
    EST: 'America/New_York', EDT: 'America/New_York', CST: 'America/Chicago', CDT: 'America/Chicago',
    MST: 'America/Denver', MDT: 'America/Denver', PST: 'America/Los_Angeles', PDT: 'America/Los_Angeles',
    BRT: 'America/Sao_Paulo', AST: 'America/Santo_Domingo', CVT: 'Atlantic/Cape_Verde',
    GST: 'Asia/Dubai', ICT: 'Asia/Bangkok', SGT: 'Asia/Singapore', JST: 'Asia/Tokyo',
    AEST: 'Australia/Sydney', AEDT: 'Australia/Sydney', UTC: 'UTC'
  };

  const CITY_NAMES = {
    LIS: 'Lisboa', OPO: 'Porto', FAO: 'Faro', FNC: 'Funchal', PDL: 'Ponta Delgada',
    MAD: 'Madrid', BCN: 'Barcelona', LHR: 'Londres', LGW: 'Londres', STN: 'Londres',
    CDG: 'Paris', ORY: 'Paris', FCO: 'Roma', MXP: 'Milão', VCE: 'Veneza', ATH: 'Atenas',
    FRA: 'Frankfurt', MUC: 'Munique', AMS: 'Amesterdão', ZRH: 'Zurique', GVA: 'Genebra',
    DUB: 'Dublin', BRU: 'Bruxelas', VIE: 'Viena', PRG: 'Praga', IST: 'Istambul',
    YYZ: 'Toronto', YUL: 'Montreal', YVR: 'Vancouver',
    BOS: 'Boston', JFK: 'Nova Iorque', EWR: 'Nova Iorque', MIA: 'Miami', MCO: 'Orlando',
    ATL: 'Atlanta', ORD: 'Chicago', DFW: 'Dallas', IAD: 'Washington', LAX: 'Los Angeles', SFO: 'São Francisco',
    CUN: 'Cancún', MEX: 'Cidade do México', PUJ: 'Punta Cana', PTY: 'Panamá', BOG: 'Bogotá',
    GRU: 'São Paulo', GIG: 'Rio de Janeiro', REC: 'Recife', SID: 'Ilha do Sal', RAI: 'Praia',
    RAK: 'Marraquexe', CMN: 'Casablanca', DXB: 'Dubai', DOH: 'Doha',
    BKK: 'Banguecoque', SIN: 'Singapura', DPS: 'Bali', HND: 'Tóquio', NRT: 'Tóquio', SYD: 'Sydney'
  };

  const KNOWN_AIRPORTS = {
    LIS: [38.7742, -9.1342], OPO: [41.2481, -8.6814], FAO: [37.0144, -7.9659],
    FNC: [32.6979, -16.7745], PDL: [37.7412, -25.6979],
    MAD: [40.4983, -3.5676], BCN: [41.2974, 2.0833], LHR: [51.4700, -0.4543],
    LGW: [51.1537, -0.1821], STN: [51.8850, 0.2350],
    CDG: [49.0097, 2.5479], ORY: [48.7262, 2.3652], FCO: [41.8003, 12.2389],
    MXP: [45.6301, 8.7255], VCE: [45.5053, 12.3519], ATH: [37.9364, 23.9445],
    FRA: [50.0379, 8.5622], MUC: [48.3538, 11.7861], AMS: [52.3105, 4.7683],
    ZRH: [47.4647, 8.5492], GVA: [46.2381, 6.1090], DUB: [53.4213, -6.2701],
    BRU: [50.9014, 4.4844], VIE: [48.1103, 16.5697], PRG: [50.1008, 14.2600],
    IST: [41.2753, 28.7519],
    YYZ: [43.6777, -79.6248], YUL: [45.4706, -73.7408], YVR: [49.1967, -123.1815],
    BOS: [42.3656, -71.0096], JFK: [40.6413, -73.7781], EWR: [40.6895, -74.1745],
    MIA: [25.7959, -80.2870], MCO: [28.4312, -81.3081], ATL: [33.6407, -84.4277],
    ORD: [41.9742, -87.9073], DFW: [32.8998, -97.0403], IAD: [38.9531, -77.4565],
    LAX: [33.9416, -118.4085], SFO: [37.6213, -122.3790],
    CUN: [21.0365, -86.8771], MEX: [19.4363, -99.0721], PUJ: [18.5674, -68.3634],
    PTY: [9.0714, -79.3835], BOG: [4.7016, -74.1469],
    GRU: [-23.4356, -46.4731], GIG: [-22.8099, -43.2505], REC: [-8.1268, -34.9230],
    SID: [16.7414, -22.9494], RAI: [14.9455, -23.4847],
    RAK: [31.6069, -8.0363], CMN: [33.3675, -7.5899],
    DXB: [25.2532, 55.3657], DOH: [25.2731, 51.6081],
    BKK: [13.6900, 100.7501], SIN: [1.3644, 103.9915], DPS: [-8.7482, 115.1672],
    HND: [35.5494, 139.7798], NRT: [35.7720, 140.3929], SYD: [-33.9399, 151.1753]
  };

  function normalizeState(raw) {
    const base = JSON.parse(JSON.stringify(window.DEFAULT_TRIP_DATA));
    const saved = raw && typeof raw === 'object' ? raw : {};
    const merged = {
      ...base,
      ...saved,
      trip: { ...base.trip, ...(saved.trip || {}) },
      wallet: { ...base.wallet, ...(saved.wallet || {}) },
      rates: { ...base.rates, ...(saved.rates || {}) },
      flights: {
        outbound: {
          ...base.flights.outbound,
          ...(saved.flights && saved.flights.outbound ? saved.flights.outbound : {}),
          legs: (saved.flights && saved.flights.outbound && Array.isArray(saved.flights.outbound.legs))
            ? saved.flights.outbound.legs
            : base.flights.outbound.legs,
          layovers: (saved.flights && saved.flights.outbound && Array.isArray(saved.flights.outbound.layovers))
            ? saved.flights.outbound.layovers
            : base.flights.outbound.layovers
        },
        inbound: {
          ...base.flights.inbound,
          ...(saved.flights && saved.flights.inbound ? saved.flights.inbound : {}),
          legs: (saved.flights && saved.flights.inbound && Array.isArray(saved.flights.inbound.legs))
            ? saved.flights.inbound.legs
            : base.flights.inbound.legs,
          layovers: (saved.flights && saved.flights.inbound && Array.isArray(saved.flights.inbound.layovers))
            ? saved.flights.inbound.layovers
            : base.flights.inbound.layovers
        }
      }
    };

    if (!Array.isArray(merged.trip.tips)) merged.trip.tips = base.trip.tips;
    if (!Array.isArray(merged.wallet.documents)) {
      merged.wallet.documents = [
        { id: 'doc-eta', label: 'eTA Canadá', status: merged.wallet.canadaEta || 'Pendente' },
        { id: 'doc-visitax', label: 'Visitax Quintana Roo', status: merged.wallet.mexicoVisitax || 'Pendente' }
      ];
    }
    if (typeof merged.rates.eurToDest !== 'number' || Number.isNaN(merged.rates.eurToDest)) {
      merged.rates.eurToDest = Number(merged.rates.eurToMxn) || 1;
    }

    // Ensure every flight leg has a dateIso
    merged.flights.outbound.legs.forEach((l) => {
      if (!l.dateIso) l.dateIso = merged.trip.startDate || '2026-11-28';
    });
    merged.flights.inbound.legs.forEach((l) => {
      if (!l.dateIso) l.dateIso = merged.trip.endDate || '2026-12-08';
    });

    if (!Array.isArray(merged.days) || !merged.days.length) {
      merged.days = buildDaysArray(merged.trip.startDate, merged.trip.endDate, []);
    }
    if (!Array.isArray(merged.venues)) merged.venues = [];
    merged.venues = merged.venues.map((v) => {
      const copy = { ...v, photoUrl: v.photoUrl || '', menuPhotoUrl: v.menuPhotoUrl || '' };
      if (Array.isArray(copy.reviews)) return copy;
      if (copy.ratings) {
        const r = copy.ratings;
        const avg = (Number(r.food || 4) + Number(r.vibe || 4) + Number(r.service || 4) + Number(r.quality || 4)) / 4;
        copy.reviews = [{
          id: `vrev-${copy.id || Date.now()}`,
          userId: String(r.by || 'legacy').toLowerCase(),
          by: r.by || 'Viajante',
          dishes: r.dishes || '',
          rating: avg,
          aspects: { food: Number(r.food || 4), vibe: Number(r.vibe || 4), service: Number(r.service || 4), quality: Number(r.quality || 4) },
          comment: r.comment || '',
          createdAt: new Date().toISOString()
        }];
      } else {
        copy.reviews = [];
      }
      return copy;
    });

    if (!Array.isArray(merged.packing)) merged.packing = [];
    if (!Array.isArray(merged.expenses)) merged.expenses = [];
    if (!Array.isArray(merged.cocktails)) merged.cocktails = [];

    // Migrate legacy single-review cocktails to 1-card-per-cocktail with reviews[] (bar per review)
    merged.cocktails = merged.cocktails.map((c) => {
      if (Array.isArray(c.reviews)) {
        c.reviews = c.reviews.map((r) => ({ ...r, bar: r.bar || c.bar || '' }));
        return c;
      }
      const rev = {
        id: `rev-${c.id || Date.now()}`,
        userId: String(c.by || 'legacy').toLowerCase(),
        by: c.by || 'Viajante',
        bar: c.bar || '',
        rating: Number(c.rating || 4),
        aspects: c.aspects || { flavor: 4, fresh: 4, strength: 4, look: 4 },
        note: c.note || '',
        createdAt: c.createdAt || new Date().toISOString()
      };
      return {
        id: c.id || `ck-${Date.now()}`,
        name: c.name || 'Cocktail',
        bar: c.bar || '',
        photoUrl: c.photoUrl || '',
        reviews: [rev]
      };
    });

    return merged;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return normalizeState(null);
      return normalizeState(JSON.parse(raw));
    } catch {
      return normalizeState(null);
    }
  }

  let state = loadState();
  let activeView = 'flights';
  let activeFlightDir = 'outbound';
  let activeDayIndex = 0;
  let activeVenueCategory = 'all';
  let activeRestaurantId = null;
  // Simple, large-type mode for visitors who are not logged in (family/friends following the trip).
  let publicMode = true;

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  // ---------- Date, Timezone & Trip Helpers ----------
  function capitalize(s) {
    const str = String(s || '');
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  function formatDateShortPt(iso) {
    if (!iso) return '--';
    try {
      const d = new Date(`${iso}T12:00:00Z`);
      const wd = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', timeZone: 'UTC' }).format(d).replace(/\.$/, '');
      const dm = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d).replace(/\.$/, '');
      return `${capitalize(wd)} ${dm.replace(/\s+de\s+/i, ' ')}`;
    } catch {
      return iso;
    }
  }

  function formatDateMediumPt(iso) {
    if (!iso) return '--';
    try {
      const d = new Date(`${iso}T12:00:00Z`);
      return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', timeZone: 'UTC' })
        .format(d)
        .replace(/\.$/, '')
        .replace(/\s+de\s+/i, ' ');
    } catch {
      return iso;
    }
  }

  function formatDateLongPt(iso) {
    if (!iso) return '--';
    try {
      const d = new Date(`${iso}T12:00:00Z`);
      return capitalize(
        new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d)
      );
    } catch {
      return iso;
    }
  }

  function formatDateRangePt(startIso, endIso) {
    if (!startIso && !endIso) return '';
    if (!endIso || startIso === endIso) return formatDateMediumPt(startIso);
    return `${formatDateMediumPt(startIso)} – ${formatDateMediumPt(endIso)}`;
  }

  function getTripDurationInfo() {
    const s = Date.parse(`${state.trip.startDate}T12:00:00Z`);
    const e = Date.parse(`${state.trip.endDate}T12:00:00Z`);
    if (Number.isNaN(s) || Number.isNaN(e) || e < s) {
      return { nights: Math.max(1, (state.days.length || 1) - 1), totalDays: Math.max(1, state.days.length || 1) };
    }
    const nights = Math.max(0, Math.round((e - s) / 86400000));
    return { nights, totalDays: nights + 1 };
  }

  function buildDaysArray(startIso, endIso, existingDays = []) {
    const s = Date.parse(`${startIso}T12:00:00Z`);
    const e = Date.parse(`${endIso}T12:00:00Z`);
    if (Number.isNaN(s) || Number.isNaN(e) || e < s) return existingDays;
    const total = Math.min(60, Math.round((e - s) / 86400000) + 1);
    const byDate = new Map((existingDays || []).map((d) => [d.date, d]));
    const dest = state?.trip?.destination || 'Destino';
    const result = [];
    for (let i = 0; i < total; i++) {
      const iso = new Date(s + i * 86400000).toISOString().slice(0, 10);
      const prev = byDate.get(iso);
      const isFirst = i === 0;
      const isLast = i === total - 1 && total > 1;
      result.push({
        dayNumber: i + 1,
        date: iso,
        shortDate: formatDateShortPt(iso),
        theme: prev?.theme || (isFirst ? 'Viagem de Ida & Check-in' : isLast ? 'Check-Out & Regresso' : `Dia ${i + 1} em ${dest}`),
        dinnerChoice: prev?.dinnerChoice || (isLast ? 'Em viagem' : 'Sem restaurante marcado'),
        notes: prev?.notes || '',
        items: Array.isArray(prev?.items) ? prev.items : []
      });
    }
    return result;
  }

  function getTzOffsetHours(ianaTz, date = new Date()) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).formatToParts(date);
      const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
      const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
      return Math.round((asUtc - date.getTime()) / 1800000) / 2;
    } catch {
      return 0;
    }
  }

  function getTimezoneDiffText(homeTz, destTz) {
    const hOff = getTzOffsetHours(homeTz);
    const dOff = getTzOffsetHours(destTz);
    const diff = dOff - hOff;
    const homeName = state.trip.homeCity || 'Portugal';
    if (diff === 0) return `mesma hora que em ${homeName}`;
    const abs = Math.abs(diff);
    const absStr = Number.isInteger(abs) ? `${abs}h` : `${Math.floor(abs)}h30`;
    return diff < 0 ? `menos ${absStr} que em ${homeName}` : `mais ${absStr} que em ${homeName}`;
  }

  function cityName(code, full) {
    return CITY_NAMES[code] || String(full || code || '').split(/[\s(]/)[0] || code || '';
  }

  function hmToUtcMs(dateStr, hm, tz) {
    const m = String(hm || '').match(/(\d{1,2}):(\d{2})/);
    if (!m || !dateStr) return null;
    const tzKey = String(tz || '').trim();
    const upper = tzKey.toUpperCase();
    let off = TZ_OFFSETS[upper];
    if (off == null && tzKey.includes('/')) {
      off = getTzOffsetHours(tzKey, new Date(`${dateStr}T12:00:00Z`));
    }
    if (off == null) off = 0;
    return Date.parse(`${dateStr}T00:00:00Z`) + ((Number(m[1]) - off) * 60 + Number(m[2])) * 60000;
  }

  function formatDurationMs(ms) {
    if (ms == null || ms <= 0) return '--';
    const totalMins = Math.round(ms / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  function getLegTimes(dirKey) {
    const dir = state.flights[dirKey];
    const fallbackDate = dirKey === 'outbound' ? state.trip.startDate : state.trip.endDate;
    let prevArr = null;
    return (dir.legs || []).map((leg) => {
      const base = leg.dateIso || fallbackDate;
      let dep = hmToUtcMs(base, leg.depTime, leg.depTz);
      if (dep != null && prevArr != null) while (dep < prevArr) dep += 86400000;
      let arr = hmToUtcMs(base, leg.arrTime, leg.arrTz);
      if (arr != null && dep != null) while (arr <= dep) arr += 86400000;
      if (arr != null) prevArr = arr;
      return { leg, dep, arr, dir: dirKey };
    });
  }

  function fmtHome(ms, opts) {
    const tz = state.trip.homeTz || 'Europe/Lisbon';
    try {
      return new Intl.DateTimeFormat('pt-PT', { timeZone: tz, ...opts }).format(new Date(ms));
    } catch {
      return new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', ...opts }).format(new Date(ms));
    }
  }
  const homeTime = (ms) => fmtHome(ms, { hour: '2-digit', minute: '2-digit', hour12: false });
  const homeDayLong = (ms) => fmtHome(ms, { weekday: 'long', day: 'numeric', month: 'long' });
  const homeDateKey = (ms) => fmtHome(ms, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const localHm = (hm) => String(hm || '').replace(/\s*\+\d+$/, '').trim();

  function homeTzLabel() {
    return (state.trip.homeTz || 'Europe/Lisbon') === 'Europe/Lisbon'
      ? 'hora de Portugal'
      : `hora de ${state.trip.homeCity || 'casa'}`;
  }

  function isSameAsHomeTz(tzStr, refDateMs) {
    if (!tzStr) return false;
    const upper = String(tzStr).toUpperCase();
    const homeTz = state.trip.homeTz || 'Europe/Lisbon';
    if (tzStr === homeTz) return true;
    const refDate = refDateMs ? new Date(refDateMs) : new Date();
    const homeOff = getTzOffsetHours(homeTz, refDate);
    let legOff = TZ_OFFSETS[upper];
    if (legOff == null && tzStr.includes('/')) legOff = getTzOffsetHours(tzStr, refDate);
    return legOff != null && legOff === homeOff;
  }

  function humanDuration(ms) {
    const mins = Math.max(0, Math.round(ms / 60000));
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    const parts = [];
    if (d) parts.push(`${d} ${d === 1 ? 'dia' : 'dias'}`);
    if (h) parts.push(`${h} ${h === 1 ? 'hora' : 'horas'}`);
    if (!d && m) parts.push(`${m} ${m === 1 ? 'minuto' : 'minutos'}`);
    return parts.join(' e ') || 'menos de 1 minuto';
  }

  function getTripPhase(now = Date.now()) {
    const out = getLegTimes('outbound').filter((t) => t.dep != null && t.arr != null);
    const inb = getLegTimes('inbound').filter((t) => t.dep != null && t.arr != null);
    const seq = [...out, ...inb];
    if (!seq.length) return null;
    if (now < seq[0].dep) return { kind: 'before', next: seq[0] };
    for (let i = 0; i < seq.length; i++) {
      const t = seq[i];
      if (now >= t.dep && now < t.arr) return { kind: 'flying', cur: t };
      const n = seq[i + 1];
      if (n && now >= t.arr && now < n.dep) {
        return { kind: t.dir !== n.dir ? 'staying' : 'layover', last: t, next: n };
      }
    }
    return { kind: 'home', last: seq[seq.length - 1] };
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
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  function formatTzTime(tz) {
    try {
      return new Intl.DateTimeFormat('pt-PT', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    } catch {
      return '--:--';
    }
  }

  function parseHm(hm) {
    const [h, m] = String(hm || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function getDestMinutesNow(overrideHm) {
    const tz = state.trip.destTz || 'America/Cancun';
    const hm = overrideHm && overrideHm !== 'live' ? overrideHm : formatTzTime(tz);
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

  // ---------- Dynamic Global Chrome & Labels ----------
  function getDynamicClocks() {
    const clocks = [];
    const seen = new Set();
    const addClock = (code, city, tz) => {
      if (!tz || seen.has(tz)) return;
      seen.add(tz);
      clocks.push({ code: code || city.slice(0, 3).toUpperCase(), city, tz });
    };

    const outLegs = state.flights.outbound.legs || [];
    const firstLeg = outLegs[0];
    const lastLeg = outLegs[outLegs.length - 1];

    addClock(
      firstLeg?.fromCode || state.trip.homeCode || 'LIS',
      state.trip.homeCity || 'Lisboa',
      state.trip.homeTz || 'Europe/Lisbon'
    );

    // Add intermediate layover timezone if distinct from home & dest
    if (outLegs.length > 1) {
      for (let i = 0; i < outLegs.length - 1; i++) {
        const mid = outLegs[i];
        const iana = TZ_ABBR_TO_IANA[String(mid.arrTz || '').toUpperCase()];
        if (iana && iana !== state.trip.homeTz && iana !== state.trip.destTz) {
          addClock(mid.toCode, cityName(mid.toCode, mid.toCity), iana);
          break;
        }
      }
    }

    addClock(
      lastLeg?.toCode || state.trip.destCode || 'DST',
      state.trip.destCity || state.trip.destination || 'Destino',
      state.trip.destTz || 'Europe/Lisbon'
    );

    return clocks;
  }

  function renderTripChrome() {
    const t = state.trip;
    const { nights } = getTripDurationInfo();
    const dateRange = formatDateRangePt(t.startDate, t.endDate);
    const placeLabel = [t.destination, t.country].filter(Boolean).join(', ');
    const nightsText = nights > 0 ? ` (${nights} ${nights === 1 ? 'Noite' : 'Noites'})` : '';

    const displayTitle = publicMode && !t.publicShowStay
      ? (placeLabel || t.title || 'Viagem')
      : (t.title || placeLabel || 'Viagem');

    document.title = `${displayTitle} — ${dateRange || 'Acompanhar Viagem'}`;

    const brandTitleEl = document.getElementById('brand-title');
    const brandSubEl = document.getElementById('brand-subtitle');
    if (brandTitleEl) brandTitleEl.textContent = displayTitle;
    if (brandSubEl) {
      const subParts = [];
      if (placeLabel && displayTitle !== placeLabel) subParts.push(placeLabel);
      if (dateRange) subParts.push(`${dateRange}${nightsText}`);
      brandSubEl.textContent = subParts.join(' · ') || 'Painel da Viagem';
    }

    // Flights view public header
    const flPubTitle = document.getElementById('flights-heading-public');
    const flPubSub = document.getElementById('flights-subtitle-public');
    const finalDest = t.destination || t.destCity || t.title;
    if (flPubTitle) {
      flPubTitle.textContent = finalDest ? `Viagem a ${finalDest}` : 'Acompanhar a Viagem';
    }
    if (flPubSub) {
      flPubSub.textContent = [placeLabel && placeLabel !== finalDest ? placeLabel : '', dateRange ? `${dateRange}${nightsText}` : ''].filter(Boolean).join(' · ');
    }

    // Direction toggle dates
    const outFirst = state.flights.outbound.legs[0];
    const inFirst = state.flights.inbound.legs[0];
    const outDateEl = document.getElementById('btn-dir-outbound-date');
    const inDateEl = document.getElementById('btn-dir-inbound-date');
    if (outDateEl) outDateEl.textContent = formatDateShortPt(outFirst?.dateIso || t.startDate);
    if (inDateEl) inDateEl.textContent = formatDateShortPt(inFirst?.dateIso || t.endDate);

    // Planner nav & heading
    const navPlan = document.getElementById('nav-tab-planner-label');
    if (navPlan) navPlan.textContent = nights > 0 ? `Plano (${nights}N)` : 'Plano';
    const planHead = document.getElementById('planner-heading');
    if (planHead) planHead.textContent = `Plano da Viagem${dateRange ? ` (${dateRange})` : ''}`;

    // Resort / Venues dynamic labels
    const resTag = document.getElementById('resort-banner-tag');
    const resDesc = document.getElementById('resort-banner-desc');
    const resSimLive = document.getElementById('resort-time-sim-live');
    const chipPyp = document.getElementById('venue-chip-pyp');
    if (resTag) resTag.textContent = t.title || t.destination || 'Locais da Viagem';
    if (resDesc) {
      resDesc.textContent = t.venueScopeNote || 'Consulte horários, avalie os melhores restaurantes e agende jantares diretamente no Plano.';
    }
    if (resSimLive) resSimLive.textContent = `Hora Real (${t.destCity || t.destination || 'Destino'})`;
    if (chipPyp) {
      const shortTitle = (t.title || '').split(' ').slice(0, 2).join(' ');
      chipPyp.textContent = shortTitle ? `Alojamento (${shortTitle})` : 'Alojamento / Principal';
    }

    // Photo day select
    const photoDaySel = document.getElementById('photo-day-select');
    if (photoDaySel) {
      const prevVal = photoDaySel.value;
      photoDaySel.innerHTML = state.days
        .map((d) => `<option value="${d.dayNumber}">Dia ${d.dayNumber} · ${escapeHtml(d.shortDate)}</option>`)
        .join('');
      if (prevVal && state.days.some((d) => String(d.dayNumber) === prevVal)) {
        photoDaySel.value = prevVal;
      }
    }

    // Currency converter labels & presets
    renderCurrencyChrome();
    syncDynamicSelects();
  }

  function renderCurrencyChrome() {
    const t = state.trip;
    const destCode = (t.currencyCode || 'EUR').toUpperCase();
    const destName = t.currencyName || destCode;
    const isEur = destCode === 'EUR';

    const tkSub = document.getElementById('toolkit-subtitle');
    if (tkSub) {
      tkSub.textContent = isEur
        ? 'Checklist prática e registo opcional de despesas da viagem'
        : `Checklist prática e cálculo rápido de ${destName} (${destCode}), Euros e Dólares`;
    }

    const convTitle = document.getElementById('conv-title');
    if (convTitle) {
      convTitle.textContent = isEur
        ? 'Conversor de Moeda (EUR ↔ USD)'
        : `Conversor de Moeda (${destCode} ↔ EUR ↔ USD)`;
    }

    const destLbl = document.getElementById('conv-dest-label');
    if (destLbl) destLbl.textContent = `${destName} (${destCode})`;

    const extraWrap = document.getElementById('conv-extra-wrap');
    const extraLbl = document.getElementById('conv-extra-label');
    if (extraWrap) {
      const showExtra = Boolean(t.extraCurrencyCode) && t.extraCurrencyCode !== destCode;
      extraWrap.style.display = showExtra ? '' : 'none';
      if (extraLbl && showExtra) extraLbl.textContent = `${t.extraCurrencyName || t.extraCurrencyCode} (${t.extraCurrencyCode})`;
    }

    const expDestOpt = document.getElementById('exp-currency-dest');
    if (expDestOpt) {
      expDestOpt.value = destCode;
      expDestOpt.textContent = destCode;
      expDestOpt.style.display = isEur ? 'none' : '';
      if (isEur && document.getElementById('exp-currency')?.value === destCode) {
        document.getElementById('exp-currency').value = 'EUR';
      }
    }

    const presetsEl = document.getElementById('currency-presets');
    if (presetsEl) {
      const rate = Number(state.rates.eurToDest) || 1;
      const eurSteps = [5, 10, 20, 50];
      presetsEl.innerHTML = eurSteps
        .map((eurVal) => {
          const destVal = rate >= 10 ? Math.round((eurVal * rate) / 10) * 10 : Number((eurVal * rate).toFixed(1));
          return `<button type="button" class="btn btn-sm" data-dest-preset="${destVal}">${destVal} ${escapeHtml(destCode)} (~€${eurVal})</button>`;
        })
        .join('');
      presetsEl.querySelectorAll('[data-dest-preset]').forEach((b) =>
        b.addEventListener('click', () => {
          const m = b.getAttribute('data-dest-preset');
          document.getElementById('conv-mxn').value = m;
          updateCurrency('DEST', m);
        })
      );
    }
  }

  function syncDynamicSelects() {
    // 1) Planner dinner select from state.venues
    const dinnerSel = document.getElementById('planner-dinner-select');
    if (dinnerSel) {
      const curVal = dinnerSel.value;
      const opts = ['<option value="Sem restaurante marcado">Sem restaurante marcado</option>'];
      state.venues
        .filter((v) => v.category !== 'bars')
        .forEach((v) => {
          const label = v.cuisine ? `${v.name} — ${v.cuisine}` : v.name;
          opts.push(`<option value="${escapeHtml(v.name)}">${escapeHtml(label)}</option>`);
        });
      opts.push('<option value="Em viagem">Em viagem</option>');
      dinnerSel.innerHTML = opts.join('');
      if (curVal && Array.from(dinnerSel.options).some((o) => o.value === curVal)) {
        dinnerSel.value = curVal;
      }
    }

    // 2) Cocktails bar select from state.venues
    const barSel = document.getElementById('ck-bar');
    if (barSel) {
      const curVal = barSel.value;
      const bars = state.venues.filter((v) => v.category === 'bars');
      const others = state.venues.filter((v) => v.category !== 'bars');
      const opts = [];
      bars.forEach((v) => opts.push(`<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)}</option>`));
      others.forEach((v) => opts.push(`<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)}</option>`));
      opts.push('<option value="Outro Bar / Local">Outro Bar / Local</option>');
      barSel.innerHTML = opts.join('');
      if (curVal && Array.from(barSel.options).some((o) => o.value === curVal)) {
        barSel.value = curVal;
      }
    }
  }

  function updateClocksAndCountdown() {
    const clocks = getDynamicClocks();
    const strip = document.getElementById('tz-strip');
    if (strip) {
      strip.innerHTML = clocks
        .map((c, idx) => {
          const time = formatTzTime(c.tz);
          return `${idx > 0 ? '<span class="tz-divider"></span>' : ''}<span class="tz-item" title="Hora de ${escapeHtml(c.city)}"><span class="tz-code">${escapeHtml(c.code)}</span> <span class="tz-time">${escapeHtml(time)}</span></span>`;
        })
        .join('');
    }

    const outTimes = getLegTimes('outbound').filter((t) => t.dep != null);
    const inTimes = getLegTimes('inbound').filter((t) => t.arr != null);
    const depMs = outTimes.length ? outTimes[0].dep : Date.parse(`${state.trip.startDate}T09:00:00Z`);
    const retMs = inTimes.length ? inTimes[inTimes.length - 1].arr : Date.parse(`${state.trip.endDate}T23:59:00Z`);
    const { totalDays } = getTripDurationInfo();
    const now = Date.now();
    const lbl = document.getElementById('countdown-label');
    const val = document.getElementById('countdown-value');

    if (lbl && val && !Number.isNaN(depMs) && !Number.isNaN(retMs)) {
      if (now < depMs) {
        const diff = depMs - now;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        lbl.textContent = 'Partida em';
        val.textContent = `${d}d ${h}h`;
      } else if (now <= retMs) {
        const day = Math.min(totalDays, Math.max(1, Math.floor((now - depMs) / 86400000) + 1));
        lbl.textContent = 'Estadia';
        val.textContent = `Dia ${day} de ${totalDays}`;
      } else {
        lbl.textContent = 'Estado';
        val.textContent = 'Concluída';
      }
    }
  }

  const viewScrollPositions = {};
  let lastNonSettingsView = 'overview';

  function getNavGroupForView(viewName) {
    if (viewName === 'overview' || viewName === 'flights') return 'home';
    if (viewName === 'resort' || viewName === 'cocktails') return 'dining';
    return null;
  }

  function switchView(viewName, opts = {}) {
    const { pushHistory = true } = opts;
    if (activeView && activeView !== viewName) {
      viewScrollPositions[activeView] = window.scrollY;
      if (activeView !== 'settings') lastNonSettingsView = activeView;
    }
    activeView = viewName;
    if (viewName === 'resort' && activeRestaurantId) {
      activeRestaurantId = null;
      renderResortVenues();
    }
    document.querySelectorAll('.view-panel').forEach((p) => p.classList.toggle('is-active', p.id === `view-${viewName}`));
    const activeGroup = getNavGroupForView(viewName);
    document.querySelectorAll('[data-view-target]').forEach((b) => {
      const target = b.getAttribute('data-view-target');
      const group = b.getAttribute('data-view-group');
      const isActive = target === viewName || (group && group === activeGroup && !b.classList.contains('subnav-btn'));
      b.classList.toggle('is-active', Boolean(isActive));
    });
    const headerBtn = document.getElementById('btn-header-auth');
    if (headerBtn) {
      headerBtn.classList.toggle('is-active', Boolean(sbUser) && viewName === 'settings');
    }
    if (pushHistory && window.location.hash !== `#${viewName}`) {
      try { history.pushState({ view: viewName }, '', `#${viewName}`); } catch {}
    }
    if (viewName === 'flights') {
      setTimeout(() => {
        if (typeof updateFlightMap === 'function') updateFlightMap();
      }, 60);
    }
    const targetY = viewScrollPositions[viewName] ?? 0;
    window.scrollTo({ top: targetY, behavior: 'auto' });
  }

  window.addEventListener('popstate', (ev) => {
    const fromState = ev.state?.view;
    const fromHash = window.location.hash ? window.location.hash.slice(1) : '';
    const candidate = fromState || fromHash;
    if (candidate && document.getElementById(`view-${candidate}`)) {
      if (sbUser || PUBLIC_VIEWS.has(candidate)) {
        switchView(candidate, { pushHistory: false });
      }
    }
  });

  // ---------- Overview (Private) ----------
  function renderOverview() {
    const t = state.trip;
    const { nights } = getTripDurationInfo();
    const donePack = state.packing.filter((p) => p.checked).length;

    const kickerEl = document.getElementById('hero-kicker');
    if (kickerEl) {
      kickerEl.textContent = t.subtitle || [t.destination, t.country].filter(Boolean).join(' · ') || 'Resumo da Viagem';
    }
    const headlineEl = document.getElementById('hero-main-heading');
    if (headlineEl) {
      headlineEl.textContent = t.headline || (nights > 0 ? `${nights} noites em ${t.destination || t.title}.` : `${t.title || t.destination}.`);
    }

    const outLegs = state.flights.outbound.legs || [];
    const inLegs = state.flights.inbound.legs || [];

    const outLbl = document.getElementById('hero-out-label');
    const outVal = document.getElementById('hero-out-value');
    const inLbl = document.getElementById('hero-in-label');
    const inVal = document.getElementById('hero-in-value');
    if (outLbl) outLbl.textContent = `Ida · ${formatDateMediumPt(outLegs[0]?.dateIso || t.startDate)}`;
    if (outVal) outVal.textContent = outLegs.map((l) => l.flightNumber).join(' → ') || '--';
    if (inLbl) inLbl.textContent = `Regresso · ${formatDateMediumPt(inLegs[0]?.dateIso || t.endDate)}`;
    if (inVal) inVal.textContent = inLegs.map((l) => l.flightNumber).join(' → ') || '--';

    document.getElementById('hero-pack-progress').textContent = `${donePack} / ${state.packing.length}`;
    document.getElementById('wallet-summary-line').textContent = state.wallet.airCanadaPnr
      ? `PNR / Reserva: ${state.wallet.airCanadaPnr}`
      : 'Guarde o vosso código PNR e documentos na Carteira';

    const fmtRouteCodes = (legs) => {
      if (!legs.length) return '---';
      const codes = [legs[0].fromCode, ...legs.map((l) => l.toCode)];
      return codes.map((c) => `<span class="iata-code">${escapeHtml(c)}</span>`).join(' → ');
    };
    const fmtNums = (legs) => legs.map((l) => escapeHtml(l.flightNumber)).join(' · ');
    const fmtTimes = (legs) => (legs.length ? `${escapeHtml(legs[0].depTime)} ${escapeHtml(legs[0].fromCode)} → ${escapeHtml(legs[legs.length - 1].arrTime)} ${escapeHtml(legs[legs.length - 1].toCode)}` : '');

    const outDateLabel = formatDateLongPt(outLegs[0]?.dateIso || t.startDate);
    const inDateLabel = formatDateLongPt(inLegs[0]?.dateIso || t.endDate);

    document.getElementById('overview-flight-summary').innerHTML = `
      <div class="flight-mini-route">
        <div>
          <div style="font-size: 0.74rem; color: var(--ink-muted); font-weight: 600;">IDA · ${escapeHtml(outDateLabel)}</div>
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
          <div style="font-size: 0.74rem; color: var(--ink-muted); font-weight: 600;">REGRESSO · ${escapeHtml(inDateLabel)}</div>
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

    const docs = Array.isArray(state.wallet.documents) ? state.wallet.documents : [];
    document.getElementById('overview-doc-badges').innerHTML = [
      ...docs.map((d) => `<span class="tag ${d.status === 'Pronto' ? 'tag-open' : 'tag-soon'}">${escapeHtml(d.label)}: ${escapeHtml(d.status)}</span>`),
      state.wallet.suiteBuilding ? `<span class="tag tag-cenote">${escapeHtml(state.wallet.suiteBuilding)}</span>` : ''
    ].join('');

    const openTitle = document.getElementById('overview-open-title');
    const openSub = document.getElementById('overview-dest-tz-label');
    const openBtn = document.getElementById('overview-all-dining-btn');
    const openEl = document.getElementById('overview-open-venues');

    // Compute today's ISO date in destination timezone
    let todayIso = new Date().toISOString().slice(0, 10);
    try {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: t.destTz || 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      const get = (k) => parts.find((p) => p.type === k)?.value || '';
      if (get('year')) todayIso = `${get('year')}-${get('month')}-${get('day')}`;
    } catch {}

    const todayObj = (state.days || []).find((d) => d.date === todayIso);
    const hasTodayDinner = todayObj && todayObj.dinnerChoice && todayObj.dinnerChoice !== 'Sem restaurante marcado' && todayObj.dinnerChoice !== 'Em viagem';
    const todayItems = todayObj && Array.isArray(todayObj.items) ? todayObj.items : [];
    const hasTodayPlans = Boolean(todayObj && (todayItems.length > 0 || hasTodayDinner));

    if (openEl) {
      if (hasTodayPlans) {
        if (openTitle) openTitle.textContent = `Plano de Hoje`;
        if (openSub) openSub.textContent = `${todayObj.shortDate} · ${todayObj.theme || 'Agenda do dia'}`;
        if (openBtn) {
          openBtn.textContent = 'Ver Plano';
          openBtn.onclick = () => {
            const idx = state.days.findIndex((d) => d.date === todayIso);
            if (idx >= 0) activeDayIndex = idx;
            renderPlanner();
            switchView('planner');
          };
        }
        const rows = [];
        todayItems.slice(0, 4).forEach((it) => {
          rows.push(`
            <div class="open-venue-row">
              <div>
                <div style="font-weight: 600; font-size: 0.88rem;">${escapeHtml(it.title)}</div>
                ${it.note ? `<div style="font-size: 0.76rem; color: var(--ink-secondary);">${escapeHtml(it.note)}</div>` : ''}
              </div>
              <span class="tag tag-cenote mono">${escapeHtml(it.time || '')}</span>
            </div>`);
        });
        if (hasTodayDinner) {
          rows.push(`
            <div class="open-venue-row">
              <div>
                <div style="font-weight: 600; font-size: 0.88rem;">🍽️ ${escapeHtml(todayObj.dinnerChoice)}</div>
                <div style="font-size: 0.76rem; color: var(--ink-secondary);">Jantar marcado</div>
              </div>
              <span class="tag tag-open">Jantar</span>
            </div>`);
        }
        openEl.innerHTML = rows.join('');
      } else {
        if (openTitle) openTitle.textContent = 'Top Restaurantes';
        if (openSub) openSub.textContent = 'Sem planos para hoje — ranking dos vossos favoritos';
        if (openBtn) {
          openBtn.textContent = 'Ver Reviews';
          openBtn.onclick = () => switchView('resort');
        }
        const topRest = state.venues
          .filter((v) => v.category !== 'bars' && getVenueAvg(v) > 0)
          .sort((a, b) => getVenueAvg(b) - getVenueAvg(a))
          .slice(0, 4);
        const medals = ['🥇', '🥈', '🥉', '4º'];
        openEl.innerHTML = topRest.length
          ? topRest
              .map((v, i) => `
                <div class="open-venue-row" style="cursor:pointer;" data-ov-open-rest="${escapeHtml(v.id)}">
                  <div>
                    <div style="font-weight: 600; font-size: 0.88rem;">${medals[i]} ${escapeHtml(v.name)}</div>
                    <div style="font-size: 0.76rem; color: var(--ink-secondary);">${escapeHtml(v.cuisine)}</div>
                  </div>
                  <span class="tag tag-cenote mono">★ ${getVenueAvg(v).toFixed(1)}</span>
                </div>`)
              .join('')
          : `<p style="font-size:0.84rem;color:var(--ink-muted);">Ainda sem planos para hoje nem restaurantes avaliados. Adicione reviews na aba Reviews!</p>`;

        openEl.querySelectorAll('[data-ov-open-rest]').forEach((row) =>
          row.addEventListener('click', () => {
            activeRestaurantId = row.getAttribute('data-ov-open-rest');
            switchReviewsTab('restaurants');
            switchView('resort');
            renderResortVenues();
          })
        );
      }
    }

    // Dynamic Tips section
    const tipsSec = document.getElementById('overview-tips-section');
    const tipsList = document.getElementById('overview-tips-list');
    const tips = Array.isArray(t.tips) ? t.tips : [];
    if (tipsSec && tipsList) {
      if (!tips.length) {
        tipsList.innerHTML = `<div class="perk-item"><span class="perk-title">Sem dicas configuradas</span><p class="perk-desc">Pode adicionar lembretes úteis (tomadas, dress code, transfers, regras locais) no ecrã de Configuração.</p></div>`;
      } else {
        tipsList.innerHTML = tips
          .map((tip) => `
            <div class="perk-item">
              <span class="perk-title">${escapeHtml(tip.title)}</span>
              <p class="perk-desc">${escapeHtml(tip.desc)}</p>
            </div>`)
          .join('');
      }
    }
  }

  // ---------- ADS-B Radar ----------
  function getFlightIata(flightNumber) {
    return String(flightNumber || '').replace(/\s+/g, '').toUpperCase();
  }

  function getIcaoCallsign(flightNumber) {
    const clean = getFlightIata(flightNumber);
    const map = {
      AC: 'ACA', TP: 'TAP', TS: 'TSC', WS: 'WJA', AM: 'AMX', UA: 'UAL',
      AA: 'AAL', DL: 'DAL', LH: 'DLH', IB: 'IBE', AF: 'AFR', EI: 'EIN',
      BA: 'BAW', KL: 'KLM', LX: 'SWR', UX: 'AEA', FR: 'RYR', U2: 'EZY',
      VY: 'VLG', S4: 'RZO', B6: 'JBU', WN: 'SWA', NK: 'NKS', F9: 'FFT',
      Y4: 'VOI', VB: 'VIV', AV: 'AVA', CM: 'CMP', LA: 'LAN', OS: 'AUA',
      SN: 'BEL', AZ: 'ITY', SK: 'SAS', AY: 'FIN', EK: 'UAE', QR: 'QTR',
      TK: 'THY', VS: 'VIR', FI: 'ICE', PD: 'POE', WG: 'SWG', F8: 'FLE',
      HV: 'TRA', TO: 'TVF', W6: 'WZZ', EW: 'EWG', LO: 'LOT', TP2: 'TAP'
    };
    const m = clean.match(/^([A-Z0-9]{2})(\d+.*)$/);
    if (m && map[m[1]]) return map[m[1]] + m[2];
    return clean;
  }

  function isLegActiveWindow(tObj, now = Date.now()) {
    if (!tObj || tObj.dep == null || tObj.arr == null) return false;
    const preMs = 3 * 3600000;   // 3h before departure
    const postMs = 12 * 3600000; // 12h after scheduled arrival (covers long delays)
    return now >= (tObj.dep - preMs) && now <= (tObj.arr + postMs);
  }

  function getLegProgress(tObj, now = Date.now()) {
    if (!tObj || tObj.dep == null || tObj.arr == null || tObj.arr <= tObj.dep) {
      return { cls: 'is-upcoming', pct: 0, label: 'Por partir' };
    }
    if (now < tObj.dep) {
      return { cls: 'is-upcoming', pct: 0, label: 'Por partir' };
    }
    if (now >= tObj.arr) {
      return { cls: 'is-done', pct: 100, label: '✓ Concluído' };
    }
    const pct = Math.min(99, Math.max(2, Math.round(((now - tObj.dep) / (tObj.arr - tObj.dep)) * 100)));
    return { cls: 'is-flying', pct, label: `✈ Em Voo · ${pct}%` };
  }

  function formatStatusBadge(live, inWindow, prog) {
    if (inWindow && live && live.active) {
      if (live.onGround) return `<span class="tag tag-soon">No Solo / Taxi</span>`;
      const pctTxt = prog && prog.cls === 'is-flying' ? ` · ${prog.pct}%` : '';
      return `<span class="tag tag-open">✈ Em Voo (ADS-B${pctTxt})</span>`;
    }
    if (prog) {
      if (prog.cls === 'is-done') return `<span class="tag tag-open">✓ Concluído</span>`;
      if (prog.cls === 'is-flying') return `<span class="tag tag-cenote">✈ Em Voo · ${prog.pct}%</span>`;
      return `<span class="tag">⏳ Por partir</span>`;
    }
    return `<span class="tag">Programado</span>`;
  }

  async function fetchAdsbLive(legId, opts = {}) {
    const silent = Boolean(opts.silent);
    const toast = (msg) => { if (!silent) showToast(msg); };
    const allTimed = [...getLegTimes('outbound'), ...getLegTimes('inbound')];
    const targetTimed = legId
      ? allTimed.filter((t) => t.leg.id === legId)
      : getLegTimes(activeFlightDir);

    const now = Date.now();
    const activeTargets = targetTimed.filter((t) => isLegActiveWindow(t, now));

    // Clear stale liveStatus on legs outside their scheduled flight window
    targetTimed.forEach((t) => {
      if (!isLegActiveWindow(t, now)) t.leg.liveStatus = null;
    });

    if (!activeTargets.length) {
      if (!publicMode) saveState();
      renderFlights();
      toast('Radar só ativa no dia e horário do voo (evita mostrar aviões de outros dias com o mesmo callsign).');
      return;
    }

    toast('A consultar radar ADS-B em direto...');
    let airborneCount = 0;
    const supaUrl = window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url ? window.SUPABASE_CONFIG.url : '';
    const proxyBase = supaUrl
      ? `${supaUrl.replace(/\/$/, '')}/functions/v1/adsb-proxy`
      : null;

    for (const tObj of activeTargets) {
      const leg = tObj.leg;
      const callsign = getIcaoCallsign(leg.flightNumber);
      try {
        const endpoint = proxyBase
          ? `${proxyBase}?callsign=${encodeURIComponent(callsign)}`
          : `https://api.adsb.lol/v2/callsign/${encodeURIComponent(callsign)}`;
        const res = await fetch(endpoint);
        if (res.status === 404 && proxyBase) {
          toast('Ativa a Edge Function "adsb-proxy" no Supabase para o radar em direto.');
          return;
        }
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
          leg.liveStatus = { active: false, updatedAt };
        }
      } catch (err) {
        console.warn('ADS-B radar fetch error:', err);
        toast('Erro de rede ao contactar o radar ADS-B.');
        return;
      }
    }

    if (!publicMode) saveState();
    renderFlights();
    toast(
      airborneCount > 0
        ? `Avião detetado no radar ADS-B (${airborneCount})!`
        : 'Sem sinal ADS-B ativo agora (o avião ainda não descolou).'
    );
  }

  // ---------- "Onde estão agora?" status card + Local Time ----------
  let lastAutoRadarMs = 0;

  function renderFlightStatus() {
    const el = document.getElementById('flight-now-status');
    if (!el) return;
    const phase = getTripPhase();
    if (!phase) { el.innerHTML = ''; return; }
    const now = Date.now();
    const tCfg = state.trip;
    const tzLbl = homeTzLabel();
    const from = (t) => cityName(t.leg.fromCode, t.leg.fromCity);
    const to = (t) => cityName(t.leg.toCode, t.leg.toCity);

    let icon = '';
    let title = '';
    let text = '';
    let extra = '';
    let tone = '';

    if (phase.kind === 'before') {
      const t = phase.next;
      icon = '🧳';
      title = 'Ainda não partiram';
      text = `O primeiro voo sai de <strong>${escapeHtml(from(t))}</strong> ${escapeHtml(homeDayLong(t.dep))}, às <strong>${homeTime(t.dep)}</strong> (${escapeHtml(tzLbl)}).`;
      extra = `<div class="now-countdown">Faltam ${humanDuration(t.dep - now)}</div>`;
    } else if (phase.kind === 'flying') {
      const t = phase.cur;
      const pct = Math.min(100, Math.max(0, Math.round(((now - t.dep) / (t.arr - t.dep)) * 100)));
      icon = '✈️';
      tone = 'is-flying';
      title = 'Estão a voar agora';
      text = `De <strong>${escapeHtml(from(t))}</strong> para <strong>${escapeHtml(to(t))}</strong>. Devem aterrar às <strong>${homeTime(t.arr)}</strong> (${escapeHtml(tzLbl)}).`;
      extra = `<div class="now-progress" role="img" aria-label="Viagem ${pct}% concluída">
          <span class="now-progress-city">${escapeHtml(from(t))}</span>
          <div class="now-progress-track"><div class="now-progress-fill" style="width:${pct}%"></div><span class="now-progress-plane" style="left:${pct}%">✈</span></div>
          <span class="now-progress-city">${escapeHtml(to(t))}</span>
        </div>
        <div class="now-countdown">Faltam cerca de ${humanDuration(t.arr - now)}</div>`;
      if (now - lastAutoRadarMs > 3 * 60000) {
        lastAutoRadarMs = now;
        fetchAdsbLive(t.leg.id, { silent: true });
      }
    } else if (phase.kind === 'layover') {
      const t = phase.next;
      icon = '⏳';
      title = `Em escala em ${escapeHtml(from(t))}`;
      text = `Já aterraram em ${escapeHtml(from(t))}. O próximo voo, para <strong>${escapeHtml(to(t))}</strong>, sai às <strong>${homeTime(t.dep)}</strong> (${escapeHtml(tzLbl)}).`;
      extra = `<div class="now-countdown">Faltam ${humanDuration(t.dep - now)}</div>`;
    } else if (phase.kind === 'staying') {
      const t = phase.next;
      const destLabel = tCfg.destination || to(phase.last);
      icon = '🏝️';
      tone = 'is-good';
      title = `Já estão em ${escapeHtml(destLabel)}!`;
      text = `Chegaram bem. O regresso começa ${escapeHtml(homeDayLong(t.dep))}, às <strong>${homeTime(t.dep)}</strong> (${escapeHtml(tzLbl)}).`;
      extra = `<div class="now-countdown">Faltam ${humanDuration(t.dep - now)} para o regresso</div>`;
    } else {
      const t = phase.last;
      icon = '🏠';
      tone = 'is-good';
      title = 'Já chegaram a casa!';
      text = `O último voo aterrou em ${escapeHtml(to(t))} ${escapeHtml(homeDayLong(t.arr))}, às ${homeTime(t.arr)}.`;
    }

    const publicNoteHtml = tCfg.publicNote
      ? `<div class="now-public-note">💬 <strong>Nota recente:</strong> ${escapeHtml(tCfg.publicNote)}</div>`
      : '';

    const cardLabel = 'Onde estão agora?';

    el.innerHTML = `
      <div class="now-card ${tone}">
        <div class="now-card-label">${cardLabel}</div>
        <div class="now-card-head"><span class="now-icon" aria-hidden="true">${icon}</span><h3 class="now-title">${title}</h3></div>
        <p class="now-text">${text}</p>
        ${extra}
        ${publicNoteHtml}
      </div>`;
  }

  function chooseDefaultFlightDir() {
    const phase = getTripPhase();
    if (!phase) return;
    const onReturn = phase.kind === 'staying' || phase.kind === 'home' ||
      ((phase.kind === 'flying' && phase.cur.dir === 'inbound') || (phase.kind === 'layover' && phase.next.dir === 'inbound'));
    activeFlightDir = onReturn ? 'inbound' : 'outbound';
    document.querySelectorAll('[data-flight-dir]').forEach((x) => x.classList.toggle('is-active', x.getAttribute('data-flight-dir') === activeFlightDir));
  }

  function renderSimpleFlights() {
    const times = getLegTimes(activeFlightDir);
    const now = Date.now();
    const firstDay = times[0] && times[0].dep != null ? homeDateKey(times[0].dep) : null;
    const tzLbl = homeTzLabel();
    const blocks = [];

    if (!times.length) {
      document.getElementById('flights-container').innerHTML = `<div class="surface"><p style="color:var(--ink-secondary);">Ainda não há voos configurados para este trajeto.</p></div>`;
      updateFlightMap();
      return;
    }

    const timeBlock = (label, ms, hm, tz, city) => {
      if (ms == null) {
        return `<div class="sf-time-row"><span class="sf-time-label">${label}</span><span class="sf-time-main">${escapeHtml(hm)}</span></div>`;
      }
      const otherDay = firstDay && homeDateKey(ms) !== firstDay;
      const sameTz = isSameAsHomeTz(tz, ms);
      return `<div class="sf-time-row">
          <span class="sf-time-label">${label}</span>
          <span class="sf-time-main">${homeTime(ms)}</span>
          <span class="sf-time-sub">${escapeHtml(tzLbl)}${otherDay ? ` · <strong>${escapeHtml(homeDayLong(ms))}</strong>` : ''}</span>
          ${sameTz ? '' : `<span class="sf-time-local">(${escapeHtml(localHm(hm))} em ${escapeHtml(city)})</span>`}
        </div>`;
    };

    times.forEach((t, i) => {
      const leg = t.leg;
      const fromName = cityName(leg.fromCode, leg.fromCity);
      const toName = cityName(leg.toCode, leg.toCity);
      const prog = getLegProgress(t, now);
      const statusLabel = prog.cls === 'is-done' ? '✓ Já aterrou' : prog.cls === 'is-flying' ? `✈ A voar · ${prog.pct}%` : '⏳ Por partir';
      const inWin = isLegActiveWindow(t, now);
      const lv = inWin ? leg.liveStatus : null;
      let liveLine = '';
      if (prog.cls === 'is-flying' && lv && lv.active && !lv.onGround) {
        const altM = lv.altFt ? Math.round((lv.altFt * 0.3048) / 100) * 100 : null;
        liveLine = `<p class="sf-live">✈ O avião aparece no mapa${altM ? `, a ${altM.toLocaleString('pt-PT')} metros de altitude` : ''}${lv.speedKmh ? ` e a ${lv.speedKmh.toLocaleString('pt-PT')} km/h` : ''}.</p>`;
      }
      const durText = leg.duration && leg.duration !== '--' ? leg.duration : formatDurationMs(t.arr - t.dep);

      blocks.push(`
        <article class="simple-flight ${prog.cls}" style="--flight-pct:${prog.pct}%;">
          <div class="sf-top">
            <span class="sf-step">${times.length === 1 ? 'Voo Direto' : `Voo ${i + 1} de ${times.length}`}</span>
            <span class="sf-status">${statusLabel}</span>
          </div>
          <h3 class="sf-route">${escapeHtml(fromName)} <span class="sf-arrow" aria-label="para">→</span> ${escapeHtml(toName)}</h3>
          <div class="sf-times">
            ${timeBlock('Parte', t.dep, leg.depTime, leg.depTz, fromName)}
            ${timeBlock('Chega', t.arr, leg.arrTime, leg.arrTz, toName)}
          </div>
          ${liveLine}
          <div class="sf-footer">
            <p class="sf-meta">Duração ${escapeHtml(durText)} · ${escapeHtml(leg.airline ? `${leg.airline} · ` : '')}Voo ${escapeHtml(leg.flightNumber)}</p>
            <a class="sf-fr24-link" href="https://www.flightradar24.com/data/flights/${encodeURIComponent(getFlightIata(leg.flightNumber).toLowerCase())}" target="_blank" rel="noopener noreferrer">✈ FlightRadar24 ↗</a>
          </div>
        </article>`);

      const next = times[i + 1];
      if (next && t.arr != null && next.dep != null) {
        blocks.push(`
          <div class="trip-leg-connector">
            <span class="trip-leg-connector-pill"><span aria-hidden="true">⏳</span> Escala em ${escapeHtml(toName)} · ${humanDuration(next.dep - t.arr)}</span>
          </div>`);
      }
    });

    document.getElementById('flights-container').innerHTML = `<div class="trip-journey-chain ${times.length > 1 ? 'has-multiple' : ''}">${blocks.join('')}</div>`;
    updateFlightMap();
  }

  function renderFlights() {
    renderFlightStatus();
    if (publicMode) { renderSimpleFlights(); return; }
    const dir = state.flights[activeFlightDir];
    const legs = dir.legs || [];
    const times = getLegTimes(activeFlightDir);
    const now = Date.now();
    const blocks = [];

    if (!legs.length) {
      document.getElementById('flights-container').innerHTML = `<div class="surface"><p style="color:var(--ink-secondary);">Sem voos configurados para este trajeto. Adicione em Configuração.</p></div>`;
      updateFlightMap();
      return;
    }

    legs.forEach((leg, idx) => {
      const iata = getFlightIata(leg.flightNumber).toLowerCase();
      const icao = getIcaoCallsign(leg.flightNumber);
      const tObj = times[idx];
      const prog = getLegProgress(tObj, now);
      const inWin = isLegActiveWindow(tObj, now);
      const live = inWin ? leg.liveStatus : null;
      const durText = leg.duration && leg.duration !== '--' ? leg.duration : formatDurationMs(tObj ? tObj.arr - tObj.dep : null);
      const stepLabel = legs.length === 1 ? 'Voo Direto' : `Voo ${idx + 1} de ${legs.length}`;

      blocks.push(`
        <article class="boarding-pass ${prog.cls}" style="--flight-pct:${prog.pct}%;">
          <div class="bp-header">
            <div class="bp-header-row">
              <div class="bp-flight-badge">
                <span class="bp-step-pill">${stepLabel}</span>
                <span class="bp-flight-num">${escapeHtml(leg.flightNumber)}</span>
              </div>
              ${formatStatusBadge(live, inWin, prog)}
            </div>
            <div class="bp-header-sub">
              <span class="bp-airline-meta">${escapeHtml(leg.airline || 'Companhia')} · <strong class="mono">${escapeHtml(icao)}</strong></span>
              <div class="bp-header-actions">
                <button type="button" class="btn btn-ghost-light bp-action-btn" data-edit-leg="${escapeHtml(leg.id)}">✎ Editar</button>
                <button type="button" class="btn btn-ghost-light bp-action-btn" data-refresh-leg="${escapeHtml(leg.id)}">↻ Radar</button>
              </div>
            </div>
          </div>
          <div class="bp-body">
            <div class="bp-route-grid">
              <div>
                <div class="bp-city-code">${escapeHtml(leg.fromCode)}</div>
                <div class="bp-city-name">${escapeHtml(leg.fromCity || cityName(leg.fromCode))}</div>
                <div class="bp-time">${escapeHtml(leg.depTime)} <span style="font-size:0.74rem;color:var(--ink-muted);">${escapeHtml(leg.depTz)}</span></div>
              </div>
              <div class="bp-duration-track">
                <span class="mono" style="font-size:0.76rem;color:var(--ink-muted);">${escapeHtml(durText)}${prog.cls === 'is-flying' ? ` · ${prog.pct}%` : ''}</span>
                <div class="bp-progress-rail">
                  <div class="bp-progress-fill" style="width:${prog.pct}%;"></div>
                  ${prog.cls === 'is-flying' ? `<span class="bp-progress-dot" style="left:${prog.pct}%;">✈</span>` : ''}
                </div>
              </div>
              <div class="bp-endpoint-right">
                <div class="bp-city-code">${escapeHtml(leg.toCode)}</div>
                <div class="bp-city-name">${escapeHtml(leg.toCity || cityName(leg.toCode))}</div>
                <div class="bp-time">${escapeHtml(leg.arrTime)} <span style="font-size:0.74rem;color:var(--ink-muted);">${escapeHtml(leg.arrTz)}</span></div>
              </div>
            </div>
            <div class="bp-details-row">
              <div><div class="bp-field-label">Terminal Partida</div><div class="bp-field-val">${escapeHtml(leg.fromTerminal || '---')}</div></div>
              <div><div class="bp-field-label">Terminal Chegada</div><div class="bp-field-val">${escapeHtml(leg.toTerminal || '---')}</div></div>
              <div><div class="bp-field-label">Porta (Gate)</div><div class="bp-field-val">${escapeHtml(leg.gate || 'A definir')}</div></div>
              <div><div class="bp-field-label">Lugar (Seat)</div><div class="bp-field-val">${escapeHtml(leg.seat || 'A definir')}</div></div>
              <div><div class="bp-field-label">PNR / Reserva</div><div class="bp-field-val">${escapeHtml(state.wallet.airCanadaPnr || '---')}</div></div>
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
              <p style="font-size:0.81rem;color:var(--ink-secondary);">${leg.baggageNote ? `<strong>Nota:</strong> ${escapeHtml(leg.baggageNote)}` : ''}</p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                <a href="https://globe.adsb.lol/?find_callsign=${encodeURIComponent(icao)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="text-decoration:none;">Mapa adsb.lol ↗</a>
                <a href="https://www.flightradar24.com/data/flights/${encodeURIComponent(iata)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="text-decoration:none;">Flightradar24 ↗</a>
              </div>
            </div>
          </div>
        </article>
      `);

      const nextT = times[idx + 1];
      if (nextT && tObj && tObj.arr != null && nextT.dep != null) {
        const layoverCity = cityName(leg.toCode, leg.toCity);
        blocks.push(`
          <div class="trip-leg-connector">
            <span class="trip-leg-connector-pill"><span aria-hidden="true">⏳</span> Escala em ${escapeHtml(layoverCity)} (${escapeHtml(leg.toCode)}) · ${humanDuration(nextT.dep - tObj.arr)}</span>
          </div>`);
      }
    });

    const el = document.getElementById('flights-container');
    el.innerHTML = `<div class="trip-journey-chain ${legs.length > 1 ? 'has-multiple' : ''}">${blocks.join('')}</div>`;
    el.querySelectorAll('[data-refresh-leg]').forEach((b) => b.addEventListener('click', () => fetchAdsbLive(b.getAttribute('data-refresh-leg'))));
    el.querySelectorAll('[data-edit-leg]').forEach((b) => b.addEventListener('click', () => openLegModal(b.getAttribute('data-edit-leg'))));
    updateFlightMap();
  }

  let flightMap = null;
  let routeLayer = null;
  let planeLayer = null;

  function updateFlightMap() {
    const mapEl = document.getElementById('flight-live-map');
    if (!mapEl || typeof window.L === 'undefined') return;

    if (!flightMap) {
      flightMap = window.L.map(mapEl, { scrollWheelZoom: false }).setView([36, -20], 3);
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(flightMap);
      routeLayer = window.L.layerGroup().addTo(flightMap);
      planeLayer = window.L.layerGroup().addTo(flightMap);
    }

    ['dragging', 'touchZoom', 'doubleClickZoom', 'boxZoom', 'keyboard'].forEach((h) => {
      if (flightMap[h]) publicMode ? flightMap[h].disable() : flightMap[h].enable();
    });
    if (flightMap.zoomControl) {
      if (publicMode) flightMap.zoomControl.remove();
      else flightMap.zoomControl.addTo(flightMap);
    }
    const label = (code, full) => (publicMode ? cityName(code, full) : code);

    routeLayer.clearLayers();
    planeLayer.clearLayers();

    const dirLegs = state.flights[activeFlightDir].legs || [];
    const dirTimes = getLegTimes(activeFlightDir);
    const now = Date.now();
    const allBounds = [];
    const plottedCodes = new Set();

    let activePlanes = 0;
    dirTimes.forEach((tObj) => {
      const leg = tObj.leg;
      const fromPt = leg.fromCoords || KNOWN_AIRPORTS[leg.fromCode];
      const toPt = leg.toCoords || KNOWN_AIRPORTS[leg.toCode];
      const lv = isLegActiveWindow(tObj, now) ? leg.liveStatus : null;
      const hasLivePlane = Boolean(lv && lv.active && lv.lat && lv.lon);
      const planePt = hasLivePlane ? [Number(lv.lat), Number(lv.lon)] : null;

      if (fromPt) {
        allBounds.push(fromPt);
        if (!plottedCodes.has(leg.fromCode)) {
          plottedCodes.add(leg.fromCode);
          window.L.circleMarker(fromPt, { radius: 7, fillColor: '#166970', color: '#fff', weight: 2, fillOpacity: 1 })
            .bindTooltip(label(leg.fromCode, leg.fromCity), { permanent: true, direction: 'top', offset: [0, -6], className: 'map-city-label' })
            .addTo(routeLayer);
        }
      }
      if (toPt) {
        allBounds.push(toPt);
        if (!plottedCodes.has(leg.toCode)) {
          plottedCodes.add(leg.toCode);
          window.L.circleMarker(toPt, { radius: 7, fillColor: '#166970', color: '#fff', weight: 2, fillOpacity: 1 })
            .bindTooltip(label(leg.toCode, leg.toCity), { permanent: true, direction: 'top', offset: [0, -6], className: 'map-city-label' })
            .addTo(routeLayer);
        }
      }

      if (hasLivePlane && planePt) {
        activePlanes++;
        allBounds.push(planePt);
        if (fromPt) {
          window.L.polyline([fromPt, planePt], { color: '#166970', weight: 3.5, opacity: 0.95 }).addTo(routeLayer);
        }
        if (toPt) {
          window.L.polyline([planePt, toPt], { color: '#166970', weight: 3, dashArray: '6, 8', opacity: 0.75 }).addTo(routeLayer);
        }

        const deg = lv.track || 0;
        const icon = window.L.divIcon({
          className: 'plane-marker',
          html: `<div class="plane-radar-wrap">
            <span class="plane-radar-pulse"></span>
            <span class="plane-radar-badge">
              <svg viewBox="0 0 24 24" style="transform:rotate(${deg}deg);" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </span>
          </div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
        window.L.marker(planePt, { icon, zIndexOffset: 1000 })
          .bindPopup(
            `<strong>${escapeHtml(leg.flightNumber)} (${escapeHtml(getIcaoCallsign(leg.flightNumber))})</strong><br/>` +
            `${lv.reg ? `${escapeHtml(lv.reg)} · ` : ''}${lv.onGround ? 'No solo' : `${lv.altFt || '--'} ft · ${lv.speedKmh || '--'} km/h`}`
          )
          .addTo(planeLayer);
      } else if (fromPt && toPt) {
        window.L.polyline([fromPt, toPt], { color: '#166970', weight: 3, dashArray: '6, 8', opacity: 0.85 }).addTo(routeLayer);
      }
    });

    const fitAll = () => {
      if (allBounds.length >= 2) {
        flightMap.fitBounds(allBounds, { padding: [36, 36], maxZoom: 6 });
      } else if (allBounds.length === 1) {
        flightMap.setView(allBounds[0], 6);
      }
    };
    fitAll();
    setTimeout(() => { if (flightMap) { flightMap.invalidateSize(); fitAll(); } }, 120);

    const routeParts = [];
    dirLegs.forEach((leg, i) => {
      if (i === 0 || leg.fromCode !== dirLegs[i - 1].toCode) {
        routeParts.push(label(leg.fromCode, leg.fromCity));
      }
      routeParts.push(label(leg.toCode, leg.toCity));
    });
    const routeLabel = routeParts.length ? routeParts.join(' → ') : 'Sem rota';

    const statusEl = document.getElementById('map-live-status');
    if (statusEl) {
      if (publicMode) {
        statusEl.textContent = activePlanes > 0 ? '✈ O avião está no mapa' : routeLabel;
      } else {
        statusEl.textContent = activePlanes > 0
          ? `✈ ${activePlanes} avião ao vivo no mapa`
          : `Rota ${routeLabel}`;
      }
    }
  }

  function renderLayover(l) {
    return `<div class="layover-banner">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <strong style="font-size:0.93rem;">${escapeHtml(l.title)}</strong>
        ${l.badge ? `<span class="tag tag-cenote">${escapeHtml(l.badge)}</span>` : ''}
      </div>
      <ol class="layover-steps">${(l.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
    </div>`;
  }

  // ---------- Planner ----------
  function renderPlanner() {
    if (!state.days.length) return;
    if (activeDayIndex >= state.days.length) activeDayIndex = 0;
    const totalNights = Math.max(1, state.days.length - 1);

    const strip = document.getElementById('day-selector-strip');
    strip.innerHTML = state.days
      .map(
        (d, idx) => `
        <button type="button" class="day-pill ${idx === activeDayIndex ? 'is-active' : ''}" data-day-idx="${idx}">
          <span class="day-pill-num">${idx < totalNights ? `Noite ${d.dayNumber}` : 'Regresso'}</span>
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
    const activePill = strip.querySelector('.day-pill.is-active');
    if (activePill && typeof activePill.scrollIntoView === 'function') {
      activePill.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }

    const day = state.days[activeDayIndex];
    document.getElementById('planner-day-badge').textContent =
      activeDayIndex < totalNights ? `Noite ${day.dayNumber} de ${totalNights}` : 'Dia de Regresso';
    document.getElementById('planner-day-title').textContent = `${day.shortDate} — ${day.theme}`;

    const sel = document.getElementById('planner-dinner-select');
    if (sel) {
      if (!Array.from(sel.options).some((o) => o.value === day.dinnerChoice)) {
        const opt = document.createElement('option');
        opt.value = day.dinnerChoice;
        opt.textContent = day.dinnerChoice;
        sel.appendChild(opt);
      }
      sel.value = day.dinnerChoice;
    }
    document.getElementById('planner-day-notes').value = day.notes || '';

    const listEl = document.getElementById('planner-agenda-list');
    if (!day.items.length) {
      listEl.innerHTML = `<p style="color:var(--ink-muted);font-size:0.88rem;padding:8px 0;">Dia livre — clique em "+ Adicionar Plano" ou agende um restaurante a partir do guia.</p>`;
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

  // ---------- Reviews & Gastronomy: Shared Visual Helpers + Restaurants ----------
  const UI_ICONS = {
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" x2="16" y1="13" y2="13"/><line x1="8" x2="16" y1="17" y2="17"/></svg>`,
    shirt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`
  };

  const RATING_WORD_LABELS = {
    1: 'Fraco · 1★',
    2: 'Razoável · 2★',
    3: 'Bom · 3★',
    4: 'Muito bom · 4★',
    5: 'Incrível · 5★'
  };

  function describeOverallScore(avg) {
    if (avg >= 4.7) return 'Favorito absoluto da viagem';
    if (avg >= 4.2) return 'Experiência excelente';
    if (avg >= 3.5) return 'Muito bom, recomendamos';
    if (avg >= 2.6) return 'Razoável';
    return 'Abaixo do esperado';
  }

  function getReviewerTone(name) {
    const s = String(name || 'V').trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    return hash % 4;
  }

  function getReviewerInitials(name) {
    const parts = String(name || 'V').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'V';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function renderAvatarHtml(name) {
    const tone = getReviewerTone(name);
    return `<span class="reviewer-avatar tone-${tone}" title="${escapeHtml(name)}">${escapeHtml(getReviewerInitials(name))}</span>`;
  }

  function parseDishList(dishesStr) {
    if (!dishesStr) return [];
    return String(dishesStr)
      .split(/[,;·•]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function renderSensoryMeters(items, isGold = false) {
    return `
      <div class="sensory-meters is-4col ${isGold ? 'is-gold' : ''}">
        ${items
          .map((it) => {
            const val = Math.max(0, Math.min(5, Number(it.value || 0)));
            const pct = Math.round((val / 5) * 100);
            return `
              <div class="sensory-meter">
                <div class="sensory-meter-top">
                  <span class="sensory-meter-label">${escapeHtml(it.label)}</span>
                  <span class="sensory-meter-val">${val.toFixed(1)}</span>
                </div>
                <div class="sensory-meter-track">
                  <div class="sensory-meter-fill" style="width: ${pct}%;"></div>
                </div>
              </div>`;
          })
          .join('')}
      </div>`;
  }

  function renderStarPickerMarkup(criteria, initialVals) {
    const initAvg =
      criteria.reduce((sum, c) => sum + (Number(initialVals[c.key]) || 4), 0) / Math.max(1, criteria.length);
    return `
      <div class="live-rating-banner">
        <div>
          <div class="live-rating-banner-label">Nota Final Calculada</div>
          <div class="live-rating-banner-sub" id="live-rating-desc">${escapeHtml(describeOverallScore(initAvg))}</div>
        </div>
        <div class="live-rating-banner-score">
          <span id="live-rating-val">${initAvg.toFixed(1)}</span>
          <span style="font-size:1.05rem;">★</span>
        </div>
      </div>
      <div class="star-criteria-list" id="star-criteria-container">
        ${criteria
          .map((c) => {
            const cur = Math.max(1, Math.min(5, Math.round(Number(initialVals[c.key]) || 4)));
            return `
              <div class="star-criterion-row" data-criterion-row="${escapeHtml(c.key)}">
                <input type="hidden" id="${escapeHtml(c.inputId)}" value="${cur}" />
                <div class="star-criterion-info">
                  <span class="star-criterion-title">${escapeHtml(c.label)}</span>
                  <span class="star-criterion-word" data-criterion-word="${escapeHtml(c.key)}">${escapeHtml(RATING_WORD_LABELS[cur])}</span>
                </div>
                <div class="star-buttons-group" role="radiogroup" aria-label="${escapeHtml(c.label)}">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      (n) => `
                        <button type="button" class="star-tap-btn ${n <= cur ? 'is-lit' : ''}" data-star-val="${n}" aria-label="${n} estrelas">★</button>`
                    )
                    .join('')}
                </div>
              </div>`;
          })
          .join('')}
      </div>`;
  }

  function bindStarPickerEvents(criteria) {
    const container = document.getElementById('star-criteria-container');
    if (!container) return;
    const updateOverall = () => {
      const vals = criteria.map((c) => Number(document.getElementById(c.inputId)?.value) || 4);
      const avg = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
      const valEl = document.getElementById('live-rating-val');
      const descEl = document.getElementById('live-rating-desc');
      if (valEl) valEl.textContent = avg.toFixed(1);
      if (descEl) descEl.textContent = describeOverallScore(avg);
    };

    criteria.forEach((c) => {
      const row = container.querySelector(`[data-criterion-row="${c.key}"]`);
      const hidden = document.getElementById(c.inputId);
      const wordEl = container.querySelector(`[data-criterion-word="${c.key}"]`);
      if (!row || !hidden) return;
      const btns = Array.from(row.querySelectorAll('.star-tap-btn'));
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const picked = Number(btn.getAttribute('data-star-val')) || 4;
          hidden.value = String(picked);
          btns.forEach((b) => b.classList.toggle('is-lit', Number(b.getAttribute('data-star-val')) <= picked));
          if (wordEl) wordEl.textContent = RATING_WORD_LABELS[picked] || `${picked}★`;
          updateOverall();
        });
      });
    });
  }

  function getRestaurantVisualTheme(v) {
    const hay = `${v.name || ''} ${v.cuisine || ''}`.toLowerCase();
    let mood = 'mood-buffet';
    let svg = `<svg class="rest-card-watermark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 46h40M16 46a16 16 0 0 1 32 0M32 22v6M10 52h44"/></svg>`;

    if (/asiát|teppan|nikkei|wok|jap|orient|sushi/.test(hay)) {
      mood = 'mood-asian';
      svg = `<svg class="rest-card-watermark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 34h36a18 18 0 0 1-36 0Z"/><path d="M12 22l40-8M12 28l40-4"/><path d="M24 52h16"/></svg>`;
    } else if (/itali|bruschetta|volta|massa|pizza|risot/.test(hay)) {
      mood = 'mood-italian';
      svg = `<svg class="rest-card-watermark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v16a8 8 0 0 0 16 0V12M28 12v40"/><path d="M46 14c-6 8-6 18 0 24v14"/></svg>`;
    } else if (/steak|grill|rodízio|grelhad|carne|vaquer|rodeo|sumauma/.test(hay)) {
      mood = 'mood-grill';
      svg = `<svg class="rest-card-watermark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 12c8 10 14 16 14 26a14 14 0 0 1-28 0c0-7 4-13 9-18 0 5 3 8 5 8 1-5 0-11 0-16Z"/></svg>`;
    } else if (/mexic|hacienda|taco|tequila/.test(hay)) {
      mood = 'mood-mexican';
      svg = `<svg class="rest-card-watermark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 50V18M32 46c-8-4-15-12-17-22 7 2 13 8 17 16M32 46c8-4 15-12 17-22-7 2-13 8-17 16"/><path d="M18 50h28"/></svg>`;
    } else if (/gourmet|exclusiv|skylight|aroma|chill|galerie/.test(hay) || v.category === 'extra') {
      mood = 'mood-gourmet';
      svg = `<svg class="rest-card-watermark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M32 12l4.5 11.5L48 28l-11.5 4.5L32 44l-4.5-11.5L16 28l11.5-4.5L32 12Z"/><path d="M48 44l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"/></svg>`;
    }

    const scopeLabel =
      v.category === 'pyp'
        ? 'No vosso hotel'
        : v.category === 'sister'
          ? 'Hotel vizinho'
          : v.category === 'extra'
            ? 'Pago à parte'
            : 'Local';

    const cleanCuisine = String(v.cuisine || 'Restaurante').replace(/\s*\([^)]*\)\s*/g, '').trim() || v.cuisine || 'Restaurante';

    return { mood, svg, scopeLabel, cleanCuisine };
  }

  function getVenueReviewAvg(r) {
    if (r?.aspects) {
      return (Number(r.aspects.food || 4) + Number(r.aspects.vibe || 4) + Number(r.aspects.service || 4) + Number(r.aspects.quality || 4)) / 4;
    }
    return Number(r?.rating || 4);
  }

  function getVenueAvg(v) {
    const revs = Array.isArray(v.reviews) ? v.reviews : [];
    if (revs.length) {
      return revs.reduce((sum, r) => sum + getVenueReviewAvg(r), 0) / revs.length;
    }
    const r = v.ratings;
    if (!r) return 0;
    return (Number(r.food || 0) + Number(r.vibe || 0) + Number(r.service || 0) + Number(r.quality || 0)) / 4;
  }

  function getVenueAspectAverages(v) {
    const revs = Array.isArray(v.reviews) ? v.reviews : [];
    if (!revs.length) return null;
    const totals = { food: 0, vibe: 0, service: 0, quality: 0 };
    revs.forEach((r) => {
      const fallback = Number(r.rating || 4);
      totals.food += Number(r.aspects?.food ?? fallback);
      totals.vibe += Number(r.aspects?.vibe ?? fallback);
      totals.service += Number(r.aspects?.service ?? fallback);
      totals.quality += Number(r.aspects?.quality ?? fallback);
    });
    const n = revs.length;
    return [
      { label: 'Comida', value: totals.food / n },
      { label: 'Ambiente', value: totals.vibe / n },
      { label: 'Serviço', value: totals.service / n },
      { label: 'Pratos', value: totals.quality / n }
    ];
  }

  async function uploadVenueImage(file, folder) {
    if (!file) return '';
    if (!sbClient || !sbUser) {
      showToast('Inicie sessão para guardar fotografias na nuvem.');
      return '';
    }
    showToast('A carregar fotografia...');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error: upErr } = await sbClient.storage.from('trip-photos').upload(path, file, { upsert: false });
    if (upErr) {
      showToast(`Erro ao carregar: ${upErr.message}`);
      return '';
    }
    const { data: pub } = sbClient.storage.from('trip-photos').getPublicUrl(path);
    return pub?.publicUrl || '';
  }

  function openSingleImageLightbox(url, title, subtitle = '') {
    if (!url) return;
    galleryPhotos = [{ url, caption: title, dayLabel: subtitle }];
    openLightbox(0);
  }

  let activeReviewsTab = 'restaurants';
  function switchReviewsTab(tab) {
    activeReviewsTab = tab === 'cocktails' ? 'cocktails' : 'restaurants';
    document.querySelectorAll('[data-reviews-tab]').forEach((b) =>
      b.classList.toggle('is-active', b.getAttribute('data-reviews-tab') === activeReviewsTab)
    );
    const restPanel = document.getElementById('reviews-panel-restaurants');
    const ckPanel = document.getElementById('reviews-panel-cocktails');
    if (restPanel) restPanel.style.display = activeReviewsTab === 'restaurants' ? 'block' : 'none';
    if (ckPanel) ckPanel.style.display = activeReviewsTab === 'cocktails' ? 'block' : 'none';
  }
  document.querySelectorAll('[data-reviews-tab]').forEach((b) =>
    b.addEventListener('click', () => switchReviewsTab(b.getAttribute('data-reviews-tab')))
  );

  function openEditRestaurantModal(venueId) {
    const v = state.venues.find((x) => x.id === venueId);
    if (!v) return;
    openModal(`Editar ${v.name}`, `
      <form id="f-edit-rest" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label" for="er-name">Nome do Restaurante</label><input id="er-name" class="input" value="${escapeHtml(v.name)}" required /></div>
          <div>
            <label class="field-label" for="er-cat">Categoria</label>
            <select id="er-cat" class="select">
              <option value="pyp" ${v.category === 'pyp' ? 'selected' : ''}>Alojamento / Principal</option>
              <option value="sister" ${v.category === 'sister' ? 'selected' : ''}>Parceiros / Perto</option>
              <option value="extra" ${v.category === 'extra' ? 'selected' : ''}>Fora / Pago à Parte</option>
            </select>
          </div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label" for="er-cuisine">Tipo / Cozinha</label><input id="er-cuisine" class="input" value="${escapeHtml(v.cuisine || '')}" /></div>
          <div><label class="field-label" for="er-hours">Horário</label><input id="er-hours" class="input" value="${escapeHtml(v.hoursLabel || '')}" placeholder="Ex: Jantar 18:00–22:00" /></div>
        </div>
        <div><label class="field-label" for="er-dress">Dress Code (opcional)</label><input id="er-dress" class="input" value="${escapeHtml(v.dressCode || '')}" placeholder="Ex: Smart Casual, calças compridas..." /></div>
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.85rem;">
          <input type="checkbox" id="er-res" class="check-circle" style="margin-top:0;" ${v.reservationRequired ? 'checked' : ''} />
          <span>Exige reserva prévia</span>
        </label>
        <div><label class="field-label" for="er-desc">Descrição / Notas</label><textarea id="er-desc" class="textarea" rows="3">${escapeHtml(v.description || '')}</textarea></div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;"><button type="submit" class="btn btn-primary">Guardar Alterações</button></div>
      </form>
    `);
    document.getElementById('f-edit-rest').addEventListener('submit', (e) => {
      e.preventDefault();
      v.name = document.getElementById('er-name').value.trim() || v.name;
      v.category = document.getElementById('er-cat').value;
      v.cuisine = document.getElementById('er-cuisine').value.trim() || v.cuisine;
      v.hoursLabel = document.getElementById('er-hours').value.trim();
      v.dressCode = document.getElementById('er-dress').value.trim();
      v.reservationRequired = Boolean(document.getElementById('er-res')?.checked);
      v.description = document.getElementById('er-desc').value.trim();
      v.included = v.category !== 'extra';
      saveState();
      renderAll();
      closeModal();
      showToast('Restaurante atualizado!');
    });
  }

  function openRateVenueModal(venueId, editReviewId = null) {
    const v = state.venues.find((x) => x.id === venueId);
    if (!v) return;
    if (!Array.isArray(v.reviews)) v.reviews = [];
    const me = getCurrentReviewer();
    const editing = editReviewId
      ? v.reviews.find((r) => r.id === editReviewId)
      : v.reviews.find((r) => r.userId === me.userId || r.by.toLowerCase() === me.by.toLowerCase());
    const a = editing?.aspects || { food: 5, vibe: 4, service: 4, quality: 5 };

    const criteria = [
      { key: 'food', inputId: 'rv-food', label: '🍽️ Comida & Sabor' },
      { key: 'vibe', inputId: 'rv-vibe', label: '✨ Ambiente & Espaço' },
      { key: 'service', inputId: 'rv-serv', label: '🤝 Serviço & Simpatia' },
      { key: 'quality', inputId: 'rv-qual', label: '👨‍🍳 Apresentação & Pratos' }
    ];

    openModal(editing ? `Editar Review — ${v.name}` : `Avaliar ${v.name}`, `
      <form id="f-rate-venue" class="form-grid">
        ${renderStarPickerMarkup(criteria, a)}
        <div>
          <label class="field-label" for="rv-dishes">O que comeram? (separe por vírgulas)</label>
          <input id="rv-dishes" class="input" value="${escapeHtml(editing?.dishes || '')}" placeholder="Ex: Bife Ribeye, Ceviche, Massa Trufada, Tiramisu..." required />
        </div>
        <div>
          <label class="field-label" for="rv-note">Comentário ou dica rápida (opcional)</label>
          <input id="rv-note" class="input" value="${escapeHtml(editing?.comment || '')}" placeholder="Ex: Pedir mesa sobre a água, sobremesa incrível..." />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;">
          <button type="submit" class="btn btn-primary">${editing ? 'Guardar Alterações' : '+ Guardar Review'}</button>
        </div>
      </form>
    `);

    bindStarPickerEvents(criteria);

    document.getElementById('f-rate-venue').addEventListener('submit', (e) => {
      e.preventDefault();
      const food = Number(document.getElementById('rv-food').value) || 4;
      const vibe = Number(document.getElementById('rv-vibe').value) || 4;
      const service = Number(document.getElementById('rv-serv').value) || 4;
      const quality = Number(document.getElementById('rv-qual').value) || 4;
      const dishes = document.getElementById('rv-dishes').value.trim();
      const comment = document.getElementById('rv-note').value.trim();
      const avg = (food + vibe + service + quality) / 4;

      const revPayload = {
        id: editing?.id || `vrev-${Date.now()}`,
        userId: editing?.userId || me.userId,
        by: editing?.by || me.by,
        dishes,
        rating: avg,
        aspects: { food, vibe, service, quality },
        comment,
        createdAt: editing?.createdAt || new Date().toISOString()
      };

      const idx = editing ? v.reviews.findIndex((r) => r.id === editing.id) : -1;
      if (idx >= 0) v.reviews[idx] = revPayload;
      else v.reviews.push(revPayload);

      v.visited = true;
      saveState();
      renderResortVenues();
      renderOverview();
      closeModal();
      showToast(`${v.name} atualizado (${avg.toFixed(1)}★)!`);
    });
  }

  function openAddRestaurantModal() {
    openModal('Adicionar Restaurante', `
      <form id="f-add-rest" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label" for="nr-name">Nome do Restaurante</label><input id="nr-name" class="input" placeholder="Ex: Kotatsu, Osteria..." required /></div>
          <div>
            <label class="field-label" for="nr-cat">Categoria</label>
            <select id="nr-cat" class="select">
              <option value="pyp">Alojamento / Principal</option>
              <option value="sister">Parceiros / Perto</option>
              <option value="extra">Fora / Pago à Parte</option>
            </select>
          </div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label" for="nr-cuisine">Tipo / Cozinha</label><input id="nr-cuisine" class="input" placeholder="Ex: Italiano, Marisco, Steakhouse..." /></div>
          <div><label class="field-label" for="nr-hours">Horário (opcional)</label><input id="nr-hours" class="input" placeholder="Ex: Jantar 18:00–22:00" /></div>
        </div>
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.85rem;">
          <input type="checkbox" id="nr-res" class="check-circle" style="margin-top:0;" />
          <span>Exige reserva prévia</span>
        </label>
        <div class="form-grid form-grid-2">
          <div><label class="field-label" for="nr-photo">Foto do Restaurante (opcional)</label><input type="file" id="nr-photo" accept="image/*" class="input" /></div>
          <div><label class="field-label" for="nr-menu">Foto do Menu (opcional)</label><input type="file" id="nr-menu" accept="image/*" class="input" /></div>
        </div>
        <div><label class="field-label" for="nr-desc">Notas (opcional)</label><input id="nr-desc" class="input" placeholder="Ex: Junto à praia, dress code..." /></div>
        <div style="display:flex;justify-content:flex-end;margin-top:4px;"><button type="submit" class="btn btn-primary">+ Criar Restaurante</button></div>
      </form>
    `);

    document.getElementById('f-add-rest').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('nr-name').value.trim();
      const category = document.getElementById('nr-cat').value;
      const cuisine = document.getElementById('nr-cuisine').value.trim() || 'Restaurante';
      const hoursLabel = document.getElementById('nr-hours')?.value.trim() || '';
      const reservationRequired = Boolean(document.getElementById('nr-res')?.checked);
      const description = document.getElementById('nr-desc').value.trim();
      const photoFile = document.getElementById('nr-photo')?.files?.[0];
      const menuFile = document.getElementById('nr-menu')?.files?.[0];
      if (!name) return;

      const photoUrl = photoFile ? await uploadVenueImage(photoFile, 'restaurants') : '';
      const menuPhotoUrl = menuFile ? await uploadVenueImage(menuFile, 'menus') : '';

      const newId = `rest-${Date.now()}`;
      state.venues.push({
        id: newId,
        name,
        category,
        cuisine,
        included: category !== 'extra',
        reservationRequired,
        dressCode: '',
        hoursLabel,
        openIntervals: [{ start: '00:00', end: '24:00' }],
        description,
        photoUrl,
        menuPhotoUrl,
        reviews: [],
        visited: false,
        custom: true
      });
      activeRestaurantId = newId;
      saveState();
      renderAll();
      closeModal();
      showToast(`${name} adicionado!`);
    });
  }

  function renderRestaurantDetail(venueId) {
    const detailEl = document.getElementById('resort-detail-view');
    const v = state.venues.find((x) => x.id === venueId);
    if (!detailEl || !v) {
      activeRestaurantId = null;
      renderResortVenues();
      return;
    }

    const revs = Array.isArray(v.reviews) ? v.reviews : [];
    const avg = getVenueAvg(v);
    const aspectAvgs = getVenueAspectAverages(v);
    const me = getCurrentReviewer();
    const myReview = revs.find((r) => r.userId === me.userId || r.by.toLowerCase() === me.by.toLowerCase());
    const theme = getRestaurantVisualTheme(v);
    const liveStatus = evaluateVenueStatus(v, getDestMinutesNow());
    const statusCls = liveStatus.state === 'open' ? 'tag-open' : liveStatus.state === 'soon' ? 'tag-soon' : 'tag-closed';

    const reviewsHtml = revs.length
      ? revs
          .map((r) => {
            const rAvg = getVenueReviewAvg(r).toFixed(1);
            const a = r.aspects;
            const dishes = parseDishList(r.dishes);
            return `
              <div class="tasting-note">
                <div class="tasting-note-top">
                  <div class="tasting-author-group">
                    ${renderAvatarHtml(r.by)}
                    <div class="tasting-author-meta">
                      <span class="tasting-author-name">${escapeHtml(r.by)}</span>
                      <span class="tasting-author-sub">${escapeHtml(describeOverallScore(Number(rAvg)))}</span>
                    </div>
                  </div>
                  <div class="tasting-note-actions">
                    <span class="tasting-score-pill">★ ${rAvg}</span>
                    <button type="button" class="icon-btn" data-edit-v-rev="${escapeHtml(r.id)}" title="Editar esta review">✎</button>
                    <button type="button" class="icon-btn" data-del-v-rev="${escapeHtml(r.id)}" title="Apagar esta review">✕</button>
                  </div>
                </div>
                ${dishes.length ? `
                  <div class="dishes-pills-wrap">
                    <span class="dishes-pills-kicker">Provou</span>
                    ${dishes.map((d) => `<span class="dish-pill">🍽️ ${escapeHtml(d)}</span>`).join('')}
                  </div>` : ''}
                ${r.comment ? `<p class="tasting-quote">“${escapeHtml(r.comment)}”</p>` : ''}
                ${a ? `
                  <div class="tasting-subscores">
                    <span class="tasting-subpill">Comida <strong>${a.food}★</strong></span>
                    <span class="tasting-subpill">Ambiente <strong>${a.vibe}★</strong></span>
                    <span class="tasting-subpill">Serviço <strong>${a.service}★</strong></span>
                    <span class="tasting-subpill">Pratos <strong>${a.quality}★</strong></span>
                  </div>` : ''}
              </div>`;
          })
          .join('')
      : `<div class="reviews-empty-state" style="padding:28px 18px;">
           <p style="font-size:0.9rem;color:var(--ink-secondary);">Ainda sem avaliações neste restaurante.<br/>Registem o que comeram e a vossa nota para entrar no ranking!</p>
         </div>`;

    detailEl.innerHTML = `
      <div class="rest-detail-topbar">
        <button type="button" class="btn btn-sm" id="btn-back-restaurants">← Todos os Restaurantes</button>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-sm" id="btn-detail-edit-rest">✎ Editar</button>
          <button type="button" class="btn btn-sm" id="btn-detail-sched">📅 Agendar Jantar</button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-detail-review">${myReview ? '✎ A minha Review' : '★ Avaliar'}</button>
        </div>
      </div>

      <div class="rest-detail-hero">
        <div class="rest-detail-hero-main">
          <div style="min-width:0;flex:1;">
            <div class="rest-detail-badges">
              <span class="tag tag-cenote">${escapeHtml(theme.scopeLabel)}</span>
              ${v.openIntervals?.length ? `<span class="tag ${statusCls}">● ${escapeHtml(liveStatus.label)}</span>` : ''}
              ${v.reservationRequired
                ? `<span class="tag tag-soon">📅 Pede reserva</span>`
                : `<span class="tag tag-open">✓ Sem reserva</span>`}
              ${v.included === false ? `<span class="tag" style="background:var(--terracotta-100);color:var(--terracotta-600);">💎 Pago à parte</span>` : ''}
            </div>
            <h2 class="rest-detail-title">${escapeHtml(v.name)}</h2>
            <div class="rest-detail-cuisine">${escapeHtml(v.cuisine)}</div>
            ${v.description ? `<p style="font-size:0.9rem;color:var(--ink-secondary);margin-top:10px;max-width:66ch;">${escapeHtml(v.description)}</p>` : ''}
          </div>
          ${avg > 0 ? `
            <div class="score-seal ${avg >= 4.5 ? 'is-top' : ''}">
              <div class="score-seal-main" style="padding:8px 14px;border-radius:16px;">
                <span class="score-seal-num" style="font-size:1.75rem;">${avg.toFixed(1)}</span>
                <span class="score-seal-star" style="font-size:1.1rem;">★</span>
              </div>
              <span class="score-seal-sub">${revs.length} ${revs.length === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
          ` : `<span class="tag">Por avaliar</span>`}
        </div>

        ${aspectAvgs ? renderSensoryMeters(aspectAvgs, avg >= 4.5) : ''}

        <div class="rest-detail-info-grid">
          <div class="rest-info-tile">
            <span class="rest-info-tile-kicker">Horário</span>
            <span class="rest-info-tile-val">${escapeHtml(v.hoursLabel || 'Consultar no local')}</span>
          </div>
          <div class="rest-info-tile">
            <span class="rest-info-tile-kicker">Reserva &amp; Acesso</span>
            <span class="rest-info-tile-val">${
              v.included === false
                ? 'Restaurante exclusivo pago à parte (requer reserva)'
                : v.reservationRequired
                  ? 'Reserva obrigatória (WebApp do hotel / Concierge)'
                  : 'Entrada direta sem marcação · Tudo Incluído'
            }</span>
          </div>
          <div class="rest-info-tile">
            <span class="rest-info-tile-kicker">Dress Code</span>
            <span class="rest-info-tile-val">${escapeHtml(v.dressCode || 'Casual / Smart Casual')}</span>
          </div>
        </div>
      </div>

      <div class="rest-detail-photos">
        <div class="rest-photo-card">
          <div class="rest-photo-stage">
            ${v.photoUrl
              ? `<img src="${escapeHtml(v.photoUrl)}" alt="Foto de ${escapeHtml(v.name)}" id="img-rest-photo" />`
              : `<span style="font-size:2.2rem;">📷</span><span>Adicione uma foto do espaço ou dos pratos</span>`}
          </div>
          <div class="rest-photo-bar">
            <strong style="font-size:0.84rem;">Fotografia do Espaço / Prato</strong>
            <label class="btn btn-sm" style="cursor:pointer;">
              📷 ${v.photoUrl ? 'Alterar' : 'Adicionar'}
              <input type="file" id="inp-rest-photo" accept="image/*" style="display:none;" />
            </label>
          </div>
        </div>

        <div class="rest-photo-card">
          <div class="rest-photo-stage">
            ${v.menuPhotoUrl
              ? `<img src="${escapeHtml(v.menuPhotoUrl)}" alt="Menu de ${escapeHtml(v.name)}" id="img-rest-menu" />`
              : `<span style="font-size:2.2rem;">📄</span><span>Fotografe a carta para consultar quando quiser</span>`}
          </div>
          <div class="rest-photo-bar">
            <strong style="font-size:0.84rem;">Carta / Menu</strong>
            <label class="btn btn-sm" style="cursor:pointer;">
              📄 ${v.menuPhotoUrl ? 'Alterar' : 'Adicionar'}
              <input type="file" id="inp-rest-menu" accept="image/*" style="display:none;" />
            </label>
          </div>
        </div>
      </div>

      <div class="surface">
        <div class="section-header" style="margin-bottom:14px;">
          <div>
            <h3 style="font-size:1.18rem;">Avaliações &amp; Pratos Provados</h3>
            <p class="section-subtitle">As notas e escolhas de cada pessoa neste restaurante</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btn-detail-review-2">${myReview ? '✎ Editar a minha' : '+ Adicionar Review'}</button>
        </div>
        <div class="tasting-feed">${reviewsHtml}</div>
      </div>

      <div style="display:flex;justify-content:flex-end;margin-top:18px;">
        <button type="button" class="btn btn-sm" id="btn-detail-delete-rest" style="color:var(--terracotta-600);border-color:hsla(18,62%,44%,0.35);">Apagar Restaurante</button>
      </div>
    `;

    document.getElementById('btn-back-restaurants')?.addEventListener('click', () => {
      activeRestaurantId = null;
      renderResortVenues();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.getElementById('btn-detail-edit-rest')?.addEventListener('click', () => openEditRestaurantModal(v.id));
    document.getElementById('btn-detail-sched')?.addEventListener('click', () => openSchedModal(v.id));
    document.getElementById('btn-detail-review')?.addEventListener('click', () => openRateVenueModal(v.id));
    document.getElementById('btn-detail-review-2')?.addEventListener('click', () => openRateVenueModal(v.id));
    detailEl.querySelectorAll('[data-edit-v-rev]').forEach((b) =>
      b.addEventListener('click', () => openRateVenueModal(v.id, b.getAttribute('data-edit-v-rev')))
    );
    document.getElementById('btn-detail-delete-rest')?.addEventListener('click', () => {
      const previewHtml = `
        ${v.photoUrl ? `<img src="${escapeHtml(v.photoUrl)}" alt="" style="width:54px;height:54px;object-fit:cover;border-radius:8px;flex-shrink:0;" />` : `<span style="font-size:1.8rem;">🍽️</span>`}
        <div>
          <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(v.name)}</div>
          <div style="font-size:0.8rem;color:var(--ink-secondary);">${escapeHtml(v.cuisine || '')}</div>
        </div>`;
      openConfirmModal({
        title: 'Apagar Restaurante?',
        message: `Tem a certeza que quer remover "${v.name}" e todas as suas reviews da lista?`,
        previewHtml,
        confirmLabel: 'Apagar Restaurante',
        onConfirm: () => {
          state.venues = state.venues.filter((x) => x.id !== v.id);
          activeRestaurantId = null;
          saveState();
          renderAll();
          showToast(`${v.name} removido!`);
        }
      });
    });

    document.getElementById('img-rest-photo')?.addEventListener('click', () =>
      openSingleImageLightbox(v.photoUrl, v.name, 'Foto do Restaurante')
    );
    document.getElementById('img-rest-menu')?.addEventListener('click', () =>
      openSingleImageLightbox(v.menuPhotoUrl, `Menu — ${v.name}`, 'Toque para ampliar e ler')
    );

    document.getElementById('inp-rest-photo')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = await uploadVenueImage(file, 'restaurants');
      if (url) {
        v.photoUrl = url;
        saveState();
        renderResortVenues();
        showToast('Foto do restaurante guardada!');
      }
    });

    document.getElementById('inp-rest-menu')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = await uploadVenueImage(file, 'menus');
      if (url) {
        v.menuPhotoUrl = url;
        saveState();
        renderResortVenues();
        showToast('Foto do menu guardada!');
      }
    });

    detailEl.querySelectorAll('[data-del-v-rev]').forEach((b) =>
      b.addEventListener('click', () => {
        const revId = b.getAttribute('data-del-v-rev');
        const rev = (v.reviews || []).find((r) => r.id === revId);
        if (!rev) return;
        const previewHtml = `
          ${v.photoUrl ? `<img src="${escapeHtml(v.photoUrl)}" alt="" style="width:54px;height:54px;object-fit:cover;border-radius:8px;flex-shrink:0;" />` : `<span style="font-size:1.8rem;">🍽️</span>`}
          <div>
            <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(v.name)}</div>
            <div style="font-size:0.8rem;color:var(--ink-secondary);">Review de <strong>${escapeHtml(rev.by)}</strong> (★ ${getVenueReviewAvg(rev).toFixed(1)})</div>
          </div>`;
        openConfirmModal({
          title: 'Apagar Review?',
          message: `Tem a certeza que quer apagar a review de ${rev.by} em "${v.name}"?`,
          previewHtml,
          confirmLabel: 'Apagar Review',
          onConfirm: () => {
            v.reviews = v.reviews.filter((r) => r.id !== revId);
            saveState();
            renderResortVenues();
            showToast('Review removida');
          }
        });
      })
    );
  }

  function renderResortVenues() {
    const listView = document.getElementById('resort-list-view');
    const detailView = document.getElementById('resort-detail-view');
    if (!listView || !detailView) return;

    const restaurantsOnly = state.venues.filter((v) => v.category !== 'bars');
    const ratedCount = restaurantsOnly.filter((v) => getVenueAvg(v) > 0).length;
    const totalReviews = restaurantsOnly.reduce((s, v) => s + (Array.isArray(v.reviews) ? v.reviews.length : 0), 0);

    const badge = document.getElementById('restaurants-count-badge');
    if (badge) {
      badge.textContent = `${restaurantsOnly.length} locais · ${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`;
    }
    const tabSub = document.getElementById('rev-tab-rest-sub');
    if (tabSub) {
      tabSub.textContent = ratedCount > 0 ? `${ratedCount} avaliados de ${restaurantsOnly.length}` : `${restaurantsOnly.length} locais no guia`;
    }

    if (activeRestaurantId) {
      listView.style.display = 'none';
      detailView.style.display = 'block';
      renderRestaurantDetail(activeRestaurantId);
      return;
    }

    listView.style.display = 'block';
    detailView.style.display = 'none';

    let list = restaurantsOnly.filter((v) => {
      if (activeVenueCategory === 'all') return true;
      if (activeVenueCategory === 'ranking') return getVenueAvg(v) > 0;
      return v.category === activeVenueCategory;
    });

    // Always sort by ranking (highest rated first, unrated after)
    list = [...list].sort((a, b) => getVenueAvg(b) - getVenueAvg(a));

    const grid = document.getElementById('venue-cards-grid');
    if (!list.length) {
      grid.innerHTML = `
        <div class="reviews-empty-state">
          <div class="reviews-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
          </div>
          <h3 style="font-size:1.15rem;">${activeVenueCategory === 'ranking' ? 'Ainda sem restaurantes avaliados' : 'Sem restaurantes nesta categoria'}</h3>
          <p style="font-size:0.9rem;color:var(--ink-secondary);max-width:44ch;">${
            activeVenueCategory === 'ranking'
              ? 'Carreguem em "★ Avaliar" num restaurante depois de jantar para começarem o vosso ranking da viagem!'
              : 'Podem adicionar novos restaurantes a qualquer momento no botão + no canto inferior direito.'
          }</p>
        </div>`;
      return;
    }

    const medalClasses = ['is-gold', 'is-silver', 'is-bronze'];
    const nowMins = getDestMinutesNow();
    const me = getCurrentReviewer();
    let ratedRank = 0;

    grid.innerHTML = list
      .map((v) => {
        const avg = getVenueAvg(v);
        const revs = Array.isArray(v.reviews) ? v.reviews : [];
        const aspectAvgs = getVenueAspectAverages(v);
        const theme = getRestaurantVisualTheme(v);
        const myRev = revs.find((r) => r.userId === me.userId || r.by.toLowerCase() === me.by.toLowerCase());

        let rankBadge = '';
        const isGoldRank = avg > 0 && ratedRank === 0;
        if (avg > 0) {
          const rankNum = ratedRank + 1;
          const rankCls = medalClasses[ratedRank] || '';
          rankBadge = `<span class="rank-medallion ${rankCls}">${ratedRank < 3 ? UI_ICONS.trophy : ''}#${rankNum}</span>`;
          ratedRank++;
        }

        const liveStatus = evaluateVenueStatus(v, nowMins);
        const statusPillCls = liveStatus.state === 'open' ? 'is-open' : liveStatus.state === 'soon' ? 'is-soon' : 'is-closed';
        const statusPillHtml = v.openIntervals?.length
          ? `<span class="glass-pill ${statusPillCls}"><span class="status-dot"></span>${escapeHtml(liveStatus.label)}</span>`
          : '';

        const allDishes = [...new Set(revs.flatMap((r) => parseDishList(r.dishes)))].slice(0, 4);
        const latestWithQuote = [...revs].reverse().find((r) => r.comment) || revs[revs.length - 1];

        return `
          <article class="rest-card" data-open-rest="${escapeHtml(v.id)}">
            <div class="rest-card-visual ${theme.mood} ${v.photoUrl ? 'has-photo' : ''}">
              ${v.photoUrl
                ? `<img src="${escapeHtml(v.photoUrl)}" alt="${escapeHtml(v.name)}" class="rest-card-visual-img" loading="lazy" />`
                : theme.svg}
              <div class="rest-visual-row">
                <div class="rest-visual-badges">
                  ${rankBadge}
                  <span class="rest-scope-pill">${escapeHtml(theme.scopeLabel)}</span>
                </div>
                ${statusPillHtml}
              </div>
              <div class="rest-visual-row" style="justify-content:flex-end;">
                ${v.menuPhotoUrl ? `<span class="rest-scope-pill">${UI_ICONS.doc} Menu</span>` : ''}
              </div>
            </div>

            <div class="rest-card-body">
              <div class="rest-card-head">
                <div style="min-width:0;">
                  <h3 class="rest-card-title">${escapeHtml(v.name)}</h3>
                  <div class="rest-card-subtitle">${escapeHtml(v.cuisine)}</div>
                </div>
                ${avg > 0 ? `
                  <div class="score-seal ${isGoldRank ? 'is-top' : ''}">
                    <div class="score-seal-main">
                      <span class="score-seal-num">${avg.toFixed(1)}</span>
                      <span class="score-seal-star">★</span>
                    </div>
                    <span class="score-seal-sub">${revs.length} ${revs.length === 1 ? 'review' : 'reviews'}</span>
                  </div>
                ` : `<span class="tag" style="margin-top:2px;">Por avaliar</span>`}
              </div>

              <div class="rest-facts-row">
                ${v.reservationRequired
                  ? `<span class="fact-chip is-warn">${UI_ICONS.calendar} Pede reserva</span>`
                  : `<span class="fact-chip is-easy">✓ Sem reserva</span>`}
                ${v.included === false
                  ? `<span class="fact-chip is-extra">◆ Pago à parte</span>`
                  : `<span class="fact-chip is-cenote">✦ Tudo Incluído</span>`}
                ${v.hoursLabel
                  ? `<span class="fact-chip">${UI_ICONS.clock} ${escapeHtml(v.hoursLabel.split('·')[0].trim())}</span>`
                  : ''}
              </div>

              ${revs.length > 0 ? `
                ${aspectAvgs ? renderSensoryMeters(aspectAvgs, isGoldRank) : ''}
                ${allDishes.length ? `
                  <div class="dishes-pills-wrap">
                    <span class="dishes-pills-kicker">Provámos</span>
                    ${allDishes.map((d) => `<span class="dish-pill">${escapeHtml(d)}</span>`).join('')}
                  </div>` : ''}
                ${latestWithQuote ? `
                  <div class="rest-latest-quote">
                    ${renderAvatarHtml(latestWithQuote.by)}
                    <span class="rest-latest-quote-text">${
                      latestWithQuote.comment
                        ? `“${escapeHtml(latestWithQuote.comment)}”`
                        : `Avaliado por ${escapeHtml(latestWithQuote.by)} (${getVenueReviewAvg(latestWithQuote).toFixed(1)}★)`
                    }</span>
                  </div>` : ''}
              ` : `
                ${v.description ? `<p class="rest-card-desc">${escapeHtml(v.description)}</p>` : ''}
                ${v.dressCode ? `
                  <div class="rest-practical-lines">
                    <div class="rest-practical-line">
                      <span class="rest-practical-label">${UI_ICONS.shirt} Dress Code:</span>
                      <span>${escapeHtml(v.dressCode)}</span>
                    </div>
                  </div>` : ''}
              `}
            </div>

            <div class="rest-card-footer">
              <button type="button" class="btn btn-sm" data-quick-rate-rest="${escapeHtml(v.id)}">
                ${myRev ? '✎ A minha nota' : '★ Avaliar'}
              </button>
              <span class="rest-open-cta">Detalhes &amp; Menu →</span>
            </div>
          </article>`;
      })
      .join('');

    grid.querySelectorAll('[data-quick-rate-rest]').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openRateVenueModal(btn.getAttribute('data-quick-rate-rest'));
      })
    );

    grid.querySelectorAll('[data-open-rest]').forEach((card) =>
      card.addEventListener('click', () => {
        activeRestaurantId = card.getAttribute('data-open-rest');
        renderResortVenues();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
    );
  }

  document.getElementById('btn-fab-add-restaurant')?.addEventListener('click', openAddRestaurantModal);

  // ---------- Settings (Full Trip Control Panel) ----------
  function populateTimezoneSelect(selectEl, selectedTz) {
    if (!selectEl) return;
    const list = [...COMMON_TIMEZONES];
    if (selectedTz && !list.some((x) => x.tz === selectedTz)) {
      list.unshift({ tz: selectedTz, label: selectedTz });
    }
    selectEl.innerHTML = list
      .map((x) => `<option value="${escapeHtml(x.tz)}" ${x.tz === selectedTz ? 'selected' : ''}>${escapeHtml(x.label)}</option>`)
      .join('');
  }

  function updateSettingsDurationPreview() {
    const badge = document.getElementById('settings-trip-duration-badge');
    const sVal = document.getElementById('st-start')?.value || state.trip.startDate;
    const eVal = document.getElementById('st-end')?.value || state.trip.endDate;
    if (!badge) return;
    const s = Date.parse(`${sVal}T12:00:00Z`);
    const e = Date.parse(`${eVal}T12:00:00Z`);
    if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) {
      const nights = Math.round((e - s) / 86400000);
      badge.textContent = `${nights} ${nights === 1 ? 'noite' : 'noites'} · ${nights + 1} dias`;
    } else {
      badge.textContent = 'Datas inválidas';
    }
  }

  function renderSettings() {
    const t = state.trip;

    // 0. User profile
    const me = getCurrentReviewer();
    const userEmailEl = document.getElementById('st-user-email');
    if (userEmailEl) userEmailEl.textContent = sbUser?.email || 'Modo Local';

    // 1. General trip form
    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
    setVal('st-user-name', me.by);
    setVal('st-title', t.title);
    setVal('st-destination', t.destination);
    setVal('st-country', t.country);
    setVal('st-subtitle', t.subtitle);
    setVal('st-headline', t.headline);
    setVal('st-start', t.startDate);
    setVal('st-end', t.endDate);
    setVal('st-home-city', t.homeCity);
    setVal('st-dest-city', t.destCity);
    setVal('st-curr-code', t.currencyCode);
    setVal('st-curr-name', t.currencyName);
    setVal('st-curr-rate', state.rates.eurToDest);

    populateTimezoneSelect(document.getElementById('st-home-tz'), t.homeTz);
    populateTimezoneSelect(document.getElementById('st-dest-tz'), t.destTz);
    updateSettingsDurationPreview();

    // 2. Public panel settings
    setVal('st-public-note', t.publicNote);
    const showStayCb = document.getElementById('st-public-show-stay');
    if (showStayCb) showStayCb.checked = t.publicShowStay !== false;

    // 3. Flights list
    const flList = document.getElementById('settings-flights-list');
    if (flList) {
      const renderGroup = (dirKey, label) => {
        const legs = state.flights[dirKey].legs || [];
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;flex-wrap:wrap;gap:6px;">
            <strong style="font-size:0.82rem;color:var(--cenote-700);">${label} (${legs.length} voo${legs.length === 1 ? '' : 's'})</strong>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn btn-sm" data-add-leg-dir="${dirKey}">+ Voo</button>
            </div>
          </div>
          ${legs
            .map(
              (l, idx) => `
              <div class="open-venue-row">
                <div>
                  <strong class="mono">${escapeHtml(l.flightNumber)}</strong> · ${escapeHtml(l.fromCode)} → ${escapeHtml(l.toCode)}
                  <div class="mono" style="font-size:0.75rem;color:var(--ink-secondary);">${escapeHtml(formatDateMediumPt(l.dateIso))} · ${escapeHtml(l.depTime)} – ${escapeHtml(l.arrTime)}</div>
                </div>
                <div style="display:flex;gap:4px;align-items:center;">
                  ${idx > 0 ? `<button type="button" class="icon-btn" data-move-leg="${dirKey}:${idx}:-1" title="Subir">↑</button>` : ''}
                  ${idx < legs.length - 1 ? `<button type="button" class="icon-btn" data-move-leg="${dirKey}:${idx}:1" title="Descer">↓</button>` : ''}
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

      flList.querySelectorAll('[data-move-leg]').forEach((b) =>
        b.addEventListener('click', () => {
          const [dirKey, idxStr, deltaStr] = b.getAttribute('data-move-leg').split(':');
          const idx = Number(idxStr);
          const target = idx + Number(deltaStr);
          const legs = state.flights[dirKey].legs;
          if (target < 0 || target >= legs.length) return;
          [legs[idx], legs[target]] = [legs[target], legs[idx]];
          saveState(); renderAll();
        })
      );

      flList.querySelectorAll('[data-add-leg-dir]').forEach((b) =>
        b.addEventListener('click', () => {
          const dirKey = b.getAttribute('data-add-leg-dir');
          const legs = state.flights[dirKey].legs;
          const prev = legs[legs.length - 1];
          const newId = `leg-${Date.now()}`;
          legs.push({
            id: newId,
            dateIso: prev?.dateIso || (dirKey === 'outbound' ? state.trip.startDate : state.trip.endDate),
            flightNumber: 'TP 000',
            airline: prev?.airline || '',
            aircraft: 'Voo',
            fromCode: prev ? prev.toCode : (state.trip.homeCode || 'LIS'),
            fromCity: prev ? prev.toCity : (state.trip.homeCity || 'Origem'),
            fromTerminal: 'Terminal 1',
            depTime: '12:00',
            depTz: prev ? prev.arrTz : 'WET',
            toCode: dirKey === 'outbound' ? (state.trip.destCode || 'DST') : (state.trip.homeCode || 'LIS'),
            toCity: dirKey === 'outbound' ? (state.trip.destCity || state.trip.destination || 'Destino') : (state.trip.homeCity || 'Origem'),
            toTerminal: 'Terminal 1',
            arrTime: '15:00',
            arrTz: dirKey === 'outbound' ? (prev?.arrTz || 'CET') : 'WET',
            duration: '--',
            gate: 'A definir',
            seat: 'A definir',
            baggageNote: ''
          });
          saveState();
          renderAll();
          openLegModal(newId);
        })
      );

      flList.querySelectorAll('[data-del-leg-id]').forEach((b) =>
        b.addEventListener('click', () => {
          const dirKey = b.getAttribute('data-del-leg-dir');
          const id = b.getAttribute('data-del-leg-id');
          state.flights[dirKey].legs = state.flights[dirKey].legs.filter((l) => l.id !== id);
          saveState();
          renderAll();
          showToast('Voo removido');
        })
      );
    }

    // 4. All manageable restaurants & bars list (allows removing any venue)
    const venuesListEl = document.getElementById('settings-custom-venues-list');
    if (venuesListEl) {
      const allVenues = state.venues || [];
      venuesListEl.innerHTML = allVenues.length
        ? `<div style="font-size:0.76rem;font-weight:700;color:var(--ink-muted);margin-top:8px;">Todos os Restaurantes &amp; Bares (${allVenues.length})</div>
           <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;padding-right:2px;">` +
          allVenues
            .map((v) => {
              const kind = v.category === 'bars' ? '🍹 Bar' : '🍽️ Restaurante';
              return `
                <div class="open-venue-row">
                  <div style="min-width:0;">
                    <div style="font-weight:600;font-size:0.86rem;">${escapeHtml(v.name)}</div>
                    <div style="font-size:0.74rem;color:var(--ink-secondary);">${kind} · ${escapeHtml(v.cuisine || '')}</div>
                  </div>
                  <button type="button" class="icon-btn" data-del-venue="${escapeHtml(v.id)}" title="Remover">✕</button>
                </div>`;
            })
            .join('') +
          `</div>`
        : `<p style="font-size:0.82rem;color:var(--ink-muted);margin-top:6px;">Sem restaurantes ou bares na lista.</p>`;

      venuesListEl.querySelectorAll('[data-del-venue]').forEach((b) =>
        b.addEventListener('click', () => {
          const id = b.getAttribute('data-del-venue');
          const v = state.venues.find((x) => x.id === id);
          if (!v) return;
          const isBar = v.category === 'bars';
          const previewHtml = `
            ${v.photoUrl ? `<img src="${escapeHtml(v.photoUrl)}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;flex-shrink:0;" />` : `<span style="font-size:1.6rem;">${isBar ? '🍹' : '🍽️'}</span>`}
            <div>
              <div style="font-weight:700;font-size:0.92rem;">${escapeHtml(v.name)}</div>
              <div style="font-size:0.78rem;color:var(--ink-secondary);">${escapeHtml(v.cuisine || '')}</div>
            </div>`;
          openConfirmModal({
            title: isBar ? 'Remover Bar?' : 'Remover Restaurante?',
            message: `Tem a certeza que quer remover "${v.name}" da lista?`,
            previewHtml,
            confirmLabel: 'Remover',
            onConfirm: () => {
              state.venues = state.venues.filter((x) => x.id !== id);
              if (activeRestaurantId === id) activeRestaurantId = null;
              saveState();
              renderAll();
              showToast(`${v.name} removido!`);
            }
          });
        })
      );
    }

    // 5. Useful Tips list
    const tipsEl = document.getElementById('settings-tips-list');
    if (tipsEl) {
      const tips = Array.isArray(t.tips) ? t.tips : [];
      tipsEl.innerHTML = tips.length
        ? tips
            .map((tip) => `
              <div class="open-venue-row">
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:600;font-size:0.86rem;">${escapeHtml(tip.title)}</div>
                  <div style="font-size:0.76rem;color:var(--ink-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(tip.desc)}</div>
                </div>
                <div style="display:flex;gap:4px;">
                  <button type="button" class="btn btn-sm" data-edit-tip="${escapeHtml(tip.id)}">Editar</button>
                  <button type="button" class="icon-btn" data-del-tip="${escapeHtml(tip.id)}" title="Remover">✕</button>
                </div>
              </div>`)
            .join('')
        : `<p style="font-size:0.82rem;color:var(--ink-muted);">Sem dicas adicionadas.</p>`;

      tipsEl.querySelectorAll('[data-edit-tip]').forEach((b) =>
        b.addEventListener('click', () => openTipModal(b.getAttribute('data-edit-tip')))
      );
      tipsEl.querySelectorAll('[data-del-tip]').forEach((b) =>
        b.addEventListener('click', () => {
          state.trip.tips = (state.trip.tips || []).filter((x) => x.id !== b.getAttribute('data-del-tip'));
          saveState(); renderOverview(); renderSettings(); showToast('Dica removida');
        })
      );
    }
  }

  document.getElementById('st-start')?.addEventListener('change', updateSettingsDurationPreview);
  document.getElementById('st-end')?.addEventListener('change', updateSettingsDurationPreview);

  document.getElementById('f-settings-trip')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = state.trip;
    const oldStart = t.startDate;
    const oldEnd = t.endDate;

    const newStart = document.getElementById('st-start').value;
    const newEnd = document.getElementById('st-end').value;
    if (newStart && newEnd && newEnd < newStart) {
      showToast('A data de regresso não pode ser anterior à partida.');
      return;
    }

    t.title = document.getElementById('st-title').value.trim() || 'A Minha Viagem';
    t.destination = document.getElementById('st-destination').value.trim() || t.title;
    t.country = document.getElementById('st-country').value.trim();
    t.subtitle = document.getElementById('st-subtitle').value.trim();
    t.headline = document.getElementById('st-headline').value.trim();
    t.startDate = newStart || t.startDate;
    t.endDate = newEnd || t.endDate;
    t.homeCity = document.getElementById('st-home-city').value.trim() || 'Lisboa';
    t.homeTz = document.getElementById('st-home-tz').value || 'Europe/Lisbon';
    t.destCity = document.getElementById('st-dest-city').value.trim() || t.destination;
    t.destTz = document.getElementById('st-dest-tz').value || t.homeTz;
    t.currencyCode = (document.getElementById('st-curr-code').value.trim() || 'EUR').toUpperCase();
    t.currencyName = document.getElementById('st-curr-name').value.trim() || t.currencyCode;

    const newRate = parseFloat(document.getElementById('st-curr-rate').value);
    if (!Number.isNaN(newRate) && newRate > 0) {
      state.rates.eurToDest = newRate;
      state.rates.eurToMxn = newRate;
    }

    // If trip dates changed, sync flight legs that matched the old dates + rebuild days preserving notes
    if (t.startDate !== oldStart) {
      state.flights.outbound.legs.forEach((l) => {
        if (!l.dateIso || l.dateIso === oldStart) l.dateIso = t.startDate;
      });
    }
    if (t.endDate !== oldEnd) {
      state.flights.inbound.legs.forEach((l) => {
        if (!l.dateIso || l.dateIso === oldEnd) l.dateIso = t.endDate;
      });
    }
    if (t.startDate !== oldStart || t.endDate !== oldEnd) {
      state.days = buildDaysArray(t.startDate, t.endDate, state.days);
      activeDayIndex = 0;
    }

    saveState();
    renderAll();
    showToast('Dados da viagem guardados e sincronizados!');
  });

  document.getElementById('f-settings-public')?.addEventListener('submit', (e) => {
    e.preventDefault();
    state.trip.publicNote = document.getElementById('st-public-note').value.trim();
    state.trip.publicShowStay = Boolean(document.getElementById('st-public-show-stay').checked);
    saveState();
    renderAll();
    showToast('Painel público atualizado!');
  });

  document.getElementById('btn-sync-public-now')?.addEventListener('click', async () => {
    const ok = await pushPublicTrip(true);
    if (ok) showToast('Link público atualizado para amigos e família!');
  });

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
    renderAll();
    showToast(`${name} adicionado!`);
  });

  document.getElementById('btn-settings-wallet')?.addEventListener('click', openWalletModal);
  document.getElementById('btn-add-tip')?.addEventListener('click', () => openTipModal(null));
  document.getElementById('overview-edit-tips-btn')?.addEventListener('click', () => switchView('settings'));

  // Export / Import / New Trip
  document.getElementById('btn-export-trip')?.addEventListener('click', () => {
    const slug = (state.trip.destination || state.trip.title || 'viagem').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const exportBundle = {
      ...state,
      exportedAt: new Date().toISOString(),
      photos: Array.isArray(galleryPhotos) ? galleryPhotos : []
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `viagem-${slug}-${state.trip.startDate || 'backup'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Todos os dados da viagem foram exportados (JSON)!');
  });

  document.getElementById('input-import-trip')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        state = normalizeState(parsed);
        activeDayIndex = 0;
        saveState();
        renderAll();
        showToast('Backup importado com sucesso!');
      } catch {
        showToast('Ficheiro JSON inválido.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-new-trip')?.addEventListener('click', openNewTripModal);

  function openNewTripModal() {
    const todayIso = new Date().toISOString().slice(0, 10);
    const nextWeekIso = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const tzOpts = COMMON_TIMEZONES.map((x) => `<option value="${escapeHtml(x.tz)}">${escapeHtml(x.label)}</option>`).join('');

    openModal('Começar Nova Viagem', `
      <form id="f-new-trip" class="form-grid">
        <p style="font-size:0.84rem;color:var(--ink-secondary);">
          Substitui a viagem ativa por uma viagem limpa para um novo destino (recomendamos clicar em "Exportar Tudo" antes).
        </p>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Nome da Viagem / Hotel</label><input id="nt-title" class="input" placeholder="Ex: Férias em Roma" required /></div>
          <div><label class="field-label">Destino Final</label><input id="nt-dest" class="input" placeholder="Ex: Roma" required /></div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">País</label><input id="nt-country" class="input" placeholder="Ex: Itália" /></div>
          <div><label class="field-label">Fuso Horário Destino</label><select id="nt-tz" class="select">${tzOpts}</select></div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Data Partida</label><input id="nt-start" type="date" class="input mono" value="${todayIso}" required /></div>
          <div><label class="field-label">Data Regresso</label><input id="nt-end" type="date" class="input mono" value="${nextWeekIso}" required /></div>
        </div>
        <div>
          <label class="field-label">Aeroporto Destino (IATA) &amp; Moeda</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <input id="nt-code" class="input mono" maxlength="3" placeholder="FCO" value="FCO" />
            <input id="nt-curr" class="input mono" maxlength="4" placeholder="EUR" value="EUR" />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
          <button type="submit" class="btn btn-primary">Criar Nova Viagem</button>
        </div>
      </form>
    `);

    document.getElementById('f-new-trip').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('nt-title').value.trim();
      const dest = document.getElementById('nt-dest').value.trim();
      const country = document.getElementById('nt-country').value.trim();
      const travelers = '';
      const startDate = document.getElementById('nt-start').value;
      const endDate = document.getElementById('nt-end').value;
      const destTz = document.getElementById('nt-tz').value || 'Europe/Lisbon';
      const destCode = (document.getElementById('nt-code').value.trim() || 'DST').toUpperCase();
      const currCode = (document.getElementById('nt-curr').value.trim() || 'EUR').toUpperCase();

      if (endDate < startDate) {
        showToast('A data de regresso tem de ser igual ou posterior à partida.');
        return;
      }

      const homeCode = state.trip.homeCode || 'LIS';
      const homeCity = state.trip.homeCity || 'Lisboa';
      const homeTz = state.trip.homeTz || 'Europe/Lisbon';

      state = normalizeState({
        version: 3,
        trip: {
          title,
          destination: dest,
          country,
          subtitle: [dest, country].filter(Boolean).join(' · '),
          headline: '',
          travelers,
          startDate,
          endDate,
          homeCity,
          homeCode,
          homeTz,
          destCity: dest,
          destCode,
          destTz,
          currencyCode: currCode,
          currencyName: currCode === 'EUR' ? 'Euros' : currCode,
          extraCurrencyCode: '',
          extraCurrencyName: '',
          publicShowStay: true,
          publicNote: '',
          venueScopeNote: 'Adicione restaurantes, cafés e bares em Configuração para gerir os vossos favoritos e horários.',
          tips: []
        },
        wallet: {
          airCanadaPnr: '',
          resortBookingRef: '',
          suiteBuilding: 'A definir no Check-in',
          transferProvider: 'A definir',
          documents: [
            { id: 'doc-pass', label: 'Passaporte / CC', status: 'Pendente' },
            { id: 'doc-ins', label: 'Seguro de Viagem', status: 'Pendente' }
          ],
          notes: ''
        },
        flights: {
          outbound: {
            dateLabel: formatDateLongPt(startDate),
            summary: `${homeCity} (${homeCode}) → ${dest} (${destCode})`,
            totalJourney: '',
            legs: [{
              id: `out-${Date.now()}`,
              dateIso: startDate,
              flightNumber: 'TP 001',
              airline: 'Companhia Aérea',
              aircraft: 'Voo Direto',
              fromCode: homeCode,
              fromCity: homeCity,
              fromTerminal: 'Terminal 1',
              depTime: '10:00',
              depTz: homeTz,
              toCode: destCode,
              toCity: dest,
              toTerminal: 'Terminal 1',
              arrTime: '13:00',
              arrTz: destTz,
              duration: '--',
              gate: 'A definir',
              seat: 'A definir',
              baggageNote: ''
            }],
            layovers: []
          },
          inbound: {
            dateLabel: formatDateLongPt(endDate),
            summary: `${dest} (${destCode}) → ${homeCity} (${homeCode})`,
            totalJourney: '',
            legs: [{
              id: `in-${Date.now() + 1}`,
              dateIso: endDate,
              flightNumber: 'TP 002',
              airline: 'Companhia Aérea',
              aircraft: 'Voo Direto',
              fromCode: destCode,
              fromCity: dest,
              fromTerminal: 'Terminal 1',
              depTime: '15:00',
              depTz: destTz,
              toCode: homeCode,
              toCity: homeCity,
              toTerminal: 'Terminal 1',
              arrTime: '18:00',
              arrTz: homeTz,
              duration: '--',
              gate: 'A definir',
              seat: 'A definir',
              baggageNote: ''
            }],
            layovers: []
          }
        },
        venues: [],
        days: buildDaysArray(startDate, endDate, []),
        packing: [
          { id: 'p1', category: 'Documentos', item: 'Passaporte / Cartão de Cidadão + Cartões de embarque', checked: false },
          { id: 'p2', category: 'Documentos', item: 'Reserva do alojamento + Seguro de viagem', checked: false },
          { id: 'p3', category: 'Eletrónica', item: 'Carregadores, powerbank e adaptador de tomada', checked: false },
          { id: 'p4', category: 'Essenciais', item: 'Medicação pessoal, protetor solar e artigos de higiene', checked: false }
        ],
        rates: { eurToDest: 1, eurToMxn: 1, eurToUsd: 1.08, eurToCad: 1.48 },
        expenses: [],
        cocktails: []
      });

      activeDayIndex = 0;
      saveState();
      renderAll();
      closeModal();
      showToast(`Nova viagem "${title}" criada! Ajuste os voos em Configuração.`);
    });
  }

  function openTipModal(tipId) {
    const existing = tipId ? (state.trip.tips || []).find((x) => x.id === tipId) : null;
    openModal(existing ? 'Editar Dica Útil' : 'Nova Dica Útil', `
      <form id="f-tip" class="form-grid">
        <div><label class="field-label">Título</label><input id="tip-title" class="input" value="${escapeHtml(existing?.title || '')}" placeholder="Ex: Tomadas, Dress Code, Transfers..." required /></div>
        <div><label class="field-label">Descrição</label><textarea id="tip-desc" class="textarea" rows="3" required>${escapeHtml(existing?.desc || '')}</textarea></div>
        <div style="display:flex;justify-content:flex-end;gap:8px;"><button type="submit" class="btn btn-primary">Guardar</button></div>
      </form>
    `);
    document.getElementById('f-tip').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('tip-title').value.trim();
      const desc = document.getElementById('tip-desc').value.trim();
      if (!title) return;
      if (!Array.isArray(state.trip.tips)) state.trip.tips = [];
      if (existing) {
        existing.title = title;
        existing.desc = desc;
      } else {
        state.trip.tips.push({ id: `tip-${Date.now()}`, title, desc });
      }
      saveState(); renderOverview(); renderSettings(); closeModal(); showToast('Dica guardada!');
    });
  }

  function openLayoversModal(dirKey) {
    const dir = state.flights[dirKey];
    const layovers = dir.layovers || [];
    const label = dirKey === 'outbound' ? 'Ida' : 'Regresso';
    const legs = dir.legs || [];

    const renderList = () => {
      const listHtml = layovers.length
        ? layovers
            .map((l, idx) => `
              <div class="open-venue-row" style="align-items:flex-start;">
                <div>
                  <strong style="font-size:0.86rem;">${escapeHtml(l.title)}</strong>
                  ${l.badge ? `<span class="tag tag-cenote" style="margin-left:6px;">${escapeHtml(l.badge)}</span>` : ''}
                  <div style="font-size:0.76rem;color:var(--ink-secondary);margin-top:3px;">${(l.steps || []).map((s) => escapeHtml(s)).join(' · ')}</div>
                </div>
                <button type="button" class="icon-btn" data-del-lay="${idx}" title="Remover">✕</button>
              </div>`)
            .join('')
        : '<p style="font-size:0.82rem;color:var(--ink-muted);">Sem notas de escala ou transfer neste trajeto.</p>';

      const posOpts = [
        '<option value="before">Antes do 1º voo</option>',
        ...legs.map((lg) => `<option value="${escapeHtml(lg.id)}">Depois do voo ${escapeHtml(lg.flightNumber)} (${escapeHtml(lg.toCode)})</option>`)
      ].join('');

      openModal(`Notas de Escala / Transfer (${label})`, `
        <div class="open-now-list" style="margin-bottom:14px;">${listHtml}</div>
        <form id="f-add-lay" class="form-grid" style="padding-top:12px;border-top:1px solid var(--line-soft);">
          <div class="form-grid form-grid-2">
            <div><label class="field-label">Posição</label><select id="lay-pos" class="select">${posOpts}</select></div>
            <div><label class="field-label">Etiqueta (opcional)</label><input id="lay-badge" class="input" placeholder="Ex: ~45 min, Mesmo Terminal..." /></div>
          </div>
          <div><label class="field-label">Título</label><input id="lay-title" class="input" placeholder="Ex: Escala em Madrid / Transfer para Hotel" required /></div>
          <div><label class="field-label">Passos / Notas (1 por linha)</label><textarea id="lay-steps" class="textarea" rows="3" placeholder="Ex: Seguir placas de ligações internacionais..."></textarea></div>
          <div style="display:flex;justify-content:flex-end;"><button type="submit" class="btn btn-primary btn-sm">+ Adicionar Nota</button></div>
        </form>
      `);

      document.querySelectorAll('[data-del-lay]').forEach((b) =>
        b.addEventListener('click', () => {
          layovers.splice(Number(b.getAttribute('data-del-lay')), 1);
          saveState(); renderFlights(); renderList();
        })
      );

      document.getElementById('f-add-lay').addEventListener('submit', (e) => {
        e.preventDefault();
        const pos = document.getElementById('lay-pos').value;
        const title = document.getElementById('lay-title').value.trim();
        const badge = document.getElementById('lay-badge').value.trim();
        const steps = document.getElementById('lay-steps').value.split('\n').map((s) => s.trim()).filter(Boolean);
        if (!title) return;
        const entry = { title, badge, steps };
        if (pos === 'before') entry.beforeFirstLeg = true;
        else entry.afterLegId = pos;
        layovers.push(entry);
        saveState(); renderFlights(); renderList(); showToast('Nota adicionada!');
      });
    };
    renderList();
  }

  // ---------- Packing & Currency & Expenses ----------
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
    const eurToDest = Number(state.rates.eurToDest) || 1;
    const eurToUsd = Number(state.rates.eurToUsd) || 1.06;
    const eurToCad = Number(state.rates.eurToCad) || 1.48;
    const eur = src === 'EUR' ? v : (src === 'DEST' || src === 'MXN') ? v / eurToDest : src === 'USD' ? v / eurToUsd : v / eurToCad;
    if (src !== 'DEST' && src !== 'MXN') {
      document.getElementById('conv-mxn').value = eurToDest >= 10 ? (eur * eurToDest).toFixed(0) : (eur * eurToDest).toFixed(2);
    }
    if (src !== 'EUR') document.getElementById('conv-eur').value = eur.toFixed(2);
    if (src !== 'USD') document.getElementById('conv-usd').value = (eur * eurToUsd).toFixed(2);
    if (src !== 'CAD' && document.getElementById('conv-cad')) document.getElementById('conv-cad').value = (eur * eurToCad).toFixed(2);
  }

  function getExpenseParticipants() {
    if (!Array.isArray(state.expenseParticipants) || !state.expenseParticipants.length) {
      const me = getCurrentReviewer().by;
      state.expenseParticipants = [me && me !== 'Viajante' ? me : 'Pessoa 1', 'Pessoa 2'];
    }
    return state.expenseParticipants;
  }

  function openManageParticipantsModal() {
    const renderBody = () => {
      const people = getExpenseParticipants();
      const rows = people
        .map((p, idx) => `
          <div class="open-venue-row" style="padding:7px 10px;">
            <strong style="font-size:0.88rem;">${escapeHtml(p)}</strong>
            ${people.length > 1 ? `<button type="button" class="icon-btn" data-del-part="${idx}" title="Remover">✕</button>` : ''}
          </div>`)
        .join('');

      openModal('Pessoas nas Despesas (Tricount)', `
        <div class="form-grid">
          <p style="font-size:0.84rem;color:var(--ink-secondary);">Adicione ou remova os nomes das pessoas que dividem despesas nesta viagem.</p>
          <div class="open-now-list">${rows}</div>
          <form id="f-add-part" style="display:flex;gap:8px;margin-top:4px;">
            <input id="inp-new-part" class="input" placeholder="Nome (ex: Vicente, Ana, João)..." required />
            <button type="submit" class="btn btn-primary btn-sm">+ Adicionar</button>
          </form>
        </div>
      `);

      document.querySelectorAll('[data-del-part]').forEach((b) =>
        b.addEventListener('click', () => {
          const idx = Number(b.getAttribute('data-del-part'));
          if (state.expenseParticipants.length <= 1) return;
          state.expenseParticipants.splice(idx, 1);
          saveState();
          renderExpenses();
          renderBody();
        })
      );

      document.getElementById('f-add-part')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('inp-new-part')?.value.trim();
        if (!name) return;
        if (!state.expenseParticipants.some((x) => x.toLowerCase() === name.toLowerCase())) {
          state.expenseParticipants.push(name);
          saveState();
          renderExpenses();
        }
        renderBody();
      });
    };
    renderBody();
  }

  document.getElementById('btn-manage-participants')?.addEventListener('click', openManageParticipantsModal);

  function computeExpenseSettlements(expenses, participants, toEur) {
    const allNames = new Set(participants);
    expenses.forEach((e) => {
      if (e.paidBy) allNames.add(e.paidBy);
      if (e.splitMode && e.splitMode.startsWith('for:')) allNames.add(e.splitMode.slice(4));
    });
    const people = [...allNames];
    const net = Object.fromEntries(people.map((p) => [p, 0]));

    expenses.forEach((e) => {
      const eur = toEur(Number(e.amount) || 0, e.currency);
      if (eur <= 0) return;
      const payer = e.paidBy || people[0];
      const mode = e.splitMode || 'equal';
      if (mode === 'personal') {
        // Paid by payer for themselves — net 0
        return;
      }
      net[payer] = (net[payer] || 0) + eur;
      if (mode.startsWith('for:')) {
        const target = mode.slice(4);
        net[target] = (net[target] || 0) - eur;
      } else {
        const splitGroup = participants.length ? participants : people;
        const share = eur / splitGroup.length;
        splitGroup.forEach((p) => {
          net[p] = (net[p] || 0) - share;
        });
      }
    });

    const debtors = [];
    const creditors = [];
    Object.entries(net).forEach(([name, bal]) => {
      if (bal < -0.01) debtors.push({ name, amt: -bal });
      else if (bal > 0.01) creditors.push({ name, amt: bal });
    });
    debtors.sort((a, b) => b.amt - a.amt);
    creditors.sort((a, b) => b.amt - a.amt);

    const transfers = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amt, creditors[j].amt);
      if (pay > 0.01) {
        transfers.push({ from: debtors[i].name, to: creditors[j].name, amountEur: pay });
      }
      debtors[i].amt -= pay;
      creditors[j].amt -= pay;
      if (debtors[i].amt < 0.01) i++;
      if (creditors[j].amt < 0.01) j++;
    }
    return transfers;
  }

  function renderExpenses() {
    const listEl = document.getElementById('expenses-list');
    const totEl = document.getElementById('expenses-total-eur');
    const setBox = document.getElementById('expenses-settlement-box');
    const paidBySel = document.getElementById('exp-paid-by');
    const splitSel = document.getElementById('exp-split-mode');
    if (!listEl || !totEl) return;

    const people = getExpenseParticipants();
    const me = getCurrentReviewer().by;

    if (paidBySel) {
      const prev = paidBySel.value;
      paidBySel.innerHTML = people.map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
      if (prev && people.includes(prev)) paidBySel.value = prev;
      else if (people.includes(me)) paidBySel.value = me;
    }

    if (splitSel) {
      const prev = splitSel.value;
      const opts = [
        `<option value="equal">A dividir por todos (${people.length})</option>`,
        `<option value="personal">Individual (não dividir)</option>`,
        ...people.map((p) => `<option value="for:${escapeHtml(p)}">100% para ${escapeHtml(p)}</option>`)
      ];
      splitSel.innerHTML = opts.join('');
      if (prev && Array.from(splitSel.options).some((o) => o.value === prev)) splitSel.value = prev;
    }

    const eurToDest = Number(state.rates.eurToDest) || 1;
    const toEur = (a, c) => (c === 'EUR' ? a : c === 'USD' ? a / (state.rates.eurToUsd || 1.06) : a / eurToDest);
    const total = state.expenses.reduce((s, e) => s + toEur(Number(e.amount) || 0, e.currency), 0);
    totEl.textContent = `€${total.toFixed(2)}`;

    if (setBox) {
      if (!state.expenses.length) {
        setBox.innerHTML = '';
      } else {
        const transfers = computeExpenseSettlements(state.expenses, people, toEur);
        if (!transfers.length) {
          setBox.innerHTML = `<div style="padding:10px 12px;border-radius:10px;background:var(--agave-100);color:var(--agave-700);font-size:0.84rem;font-weight:600;">✓ Contas certas! Ninguém deve nada.</div>`;
        } else {
          setBox.innerHTML = `
            <div style="padding:10px 12px;border-radius:10px;background:var(--cenote-100);border:1px solid var(--cenote-200);display:flex;flex-direction:column;gap:6px;">
              <div style="font-size:0.74rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--cenote-700);">Acerto de Contas</div>
              ${transfers
                .map((tr) => `<div style="font-size:0.88rem;color:var(--ink-primary);">💸 <strong>${escapeHtml(tr.from)}</strong> deve <strong class="mono" style="color:var(--cenote-700);">€${tr.amountEur.toFixed(2)}</strong> a <strong>${escapeHtml(tr.to)}</strong></div>`)
                .join('')}
            </div>`;
        }
      }
    }

    if (!state.expenses.length) {
      listEl.innerHTML = `<p style="font-size:0.82rem;color:var(--ink-muted);">Sem despesas registadas.</p>`;
      return;
    }

    const splitLabel = (e) => {
      const m = e.splitMode || 'equal';
      if (m === 'personal') return 'Individual';
      if (m.startsWith('for:')) return `Para ${m.slice(4)}`;
      return 'A dividir';
    };

    listEl.innerHTML = [...state.expenses]
      .reverse()
      .map((e) => {
        const eurVal = toEur(Number(e.amount) || 0, e.currency);
        const eurHint = e.currency !== 'EUR' ? ` (~€${eurVal.toFixed(2)})` : '';
        return `
        <div class="open-venue-row" style="padding:8px 10px;">
          <div style="min-width:0;">
            <div style="font-size:0.85rem;font-weight:600;">${escapeHtml(e.label)}</div>
            <div style="font-size:0.74rem;color:var(--ink-secondary);">
              Pago por <strong>${escapeHtml(e.paidBy || people[0])}</strong> · ${escapeHtml(splitLabel(e))}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            <span class="mono" style="font-size:0.8rem;font-weight:600;">${e.amount} ${escapeHtml(e.currency)}<span style="color:var(--ink-muted);font-weight:400;">${eurHint}</span></span>
            <button type="button" class="icon-btn" data-del-exp="${escapeHtml(e.id)}" title="Remover">✕</button>
          </div>
        </div>`;
      })
      .join('');

    listEl.querySelectorAll('[data-del-exp]').forEach((b) =>
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-del-exp');
        const exp = state.expenses.find((x) => x.id === id);
        if (!exp) return;
        openConfirmModal({
          title: 'Apagar Despesa?',
          message: `Remover "${exp.label}" (${exp.amount} ${exp.currency}) do registo?`,
          confirmLabel: 'Apagar Despesa',
          onConfirm: () => {
            state.expenses = state.expenses.filter((x) => x.id !== id);
            saveState();
            renderExpenses();
            showToast('Despesa removida');
          }
        });
      })
    );
  }

  // ---------- Modals ----------
  function openModal(title, html) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-backdrop').classList.add('is-open');
  }
  function closeModal() { document.getElementById('modal-backdrop').classList.remove('is-open'); }

  function openConfirmModal({ title, message, previewHtml = '', confirmLabel = 'Apagar definitivamente', onConfirm }) {
    openModal(title, `
      <div class="form-grid">
        ${previewHtml ? `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:var(--bg-canvas);border:1px solid var(--line-soft);">${previewHtml}</div>` : ''}
        <p style="font-size:0.9rem;color:var(--ink-secondary);line-height:1.5;">${escapeHtml(message)}</p>
        <p style="font-size:0.8rem;color:var(--terracotta-600);font-weight:600;">Esta ação não pode ser anulada.</p>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px;">
          <button type="button" class="btn" id="btn-confirm-cancel">Cancelar</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-ok">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `);
    document.getElementById('btn-confirm-cancel')?.addEventListener('click', closeModal);
    document.getElementById('btn-confirm-ok')?.addEventListener('click', async () => {
      const okBtn = document.getElementById('btn-confirm-ok');
      if (okBtn) { okBtn.disabled = true; okBtn.textContent = 'A apagar...'; }
      try {
        await onConfirm();
      } finally {
        closeModal();
      }
    });
  }

  function openWalletModal() {
    const w = state.wallet;
    if (!Array.isArray(w.documents)) w.documents = [];

    const renderBody = () => {
      const docsHtml = w.documents
        .map((d, idx) => `
          <div class="open-venue-row" style="padding:6px 10px;">
            <span style="font-size:0.84rem;font-weight:600;">${escapeHtml(d.label)}</span>
            <div style="display:flex;align-items:center;gap:6px;">
              <select class="select" style="width:auto;padding:4px 8px;font-size:0.78rem;" data-doc-status="${idx}">
                <option value="Pendente" ${d.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                <option value="Pronto" ${d.status === 'Pronto' ? 'selected' : ''}>Pronto</option>
              </select>
              <button type="button" class="icon-btn" data-doc-del="${idx}" title="Remover">✕</button>
            </div>
          </div>`)
        .join('');

      openModal('Carteira & Documentos da Viagem', `
        <form id="f-wallet" class="form-grid">
          <div class="form-grid form-grid-2">
            <div><label class="field-label">PNR / Reserva de Voo</label><input id="w-pnr" class="input mono" value="${escapeHtml(w.airCanadaPnr)}" placeholder="Ex: K8M4QX" /></div>
            <div><label class="field-label">Reserva do Alojamento</label><input id="w-ref" class="input mono" value="${escapeHtml(w.resortBookingRef)}" /></div>
          </div>
          <div class="form-grid form-grid-2">
            <div><label class="field-label">Quarto / Suite / Edifício</label><input id="w-suite" class="input" value="${escapeHtml(w.suiteBuilding)}" /></div>
            <div><label class="field-label">Transfer Aeroporto–Hotel</label><input id="w-tr" class="input" value="${escapeHtml(w.transferProvider)}" /></div>
          </div>
          <div>
            <label class="field-label">Documentos &amp; Requisitos (eTA, Visto, Seguro, Taxas...)</label>
            <div class="open-now-list" style="margin-bottom:8px;">${docsHtml || '<p style="font-size:0.8rem;color:var(--ink-muted);">Sem documentos na lista.</p>'}</div>
            <div style="display:flex;gap:6px;">
              <input id="w-new-doc" class="input" placeholder="Adicionar documento (ex: ESTA, Seguro)..." />
              <button type="button" class="btn btn-sm" id="btn-add-wallet-doc">+ Adicionar</button>
            </div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
            <button type="submit" class="btn btn-primary">Guardar</button>
          </div>
        </form>
      `);

      document.querySelectorAll('[data-doc-status]').forEach((sel) =>
        sel.addEventListener('change', () => {
          const idx = Number(sel.getAttribute('data-doc-status'));
          if (w.documents[idx]) w.documents[idx].status = sel.value;
        })
      );
      document.querySelectorAll('[data-doc-del]').forEach((btn) =>
        btn.addEventListener('click', () => {
          w.documents.splice(Number(btn.getAttribute('data-doc-del')), 1);
          renderBody();
        })
      );
      document.getElementById('btn-add-wallet-doc').addEventListener('click', () => {
        const inp = document.getElementById('w-new-doc');
        const label = inp.value.trim();
        if (!label) return;
        w.documents.push({ id: `doc-${Date.now()}`, label, status: 'Pendente' });
        renderBody();
      });

      document.getElementById('f-wallet').addEventListener('submit', (e) => {
        e.preventDefault();
        w.airCanadaPnr = document.getElementById('w-pnr').value.trim().toUpperCase();
        w.resortBookingRef = document.getElementById('w-ref').value.trim();
        w.suiteBuilding = document.getElementById('w-suite').value.trim() || 'A definir';
        w.transferProvider = document.getElementById('w-tr').value.trim();
        saveState(); renderOverview(); renderFlights(); closeModal(); showToast('Carteira guardada!');
      });
    };
    renderBody();
  }

  async function lookupFlightRoute(flightNumber) {
    const clean = getFlightIata(flightNumber);
    const callsign = getIcaoCallsign(clean);
    const airlines = {
      AC: 'Air Canada', TP: 'TAP Air Portugal', TS: 'Air Transat', WS: 'WestJet',
      AM: 'Aeroméxico', UA: 'United Airlines', AA: 'American Airlines', DL: 'Delta Air Lines',
      LH: 'Lufthansa', IB: 'Iberia', AF: 'Air France', BA: 'British Airways', KL: 'KLM',
      FR: 'Ryanair', U2: 'easyJet', VY: 'Vueling', EK: 'Emirates', QR: 'Qatar Airways',
      TK: 'Turkish Airlines', LX: 'SWISS', AZ: 'ITA Airways', S4: 'Azores Airlines'
    };
    const prefix = clean.slice(0, 2);
    const result = { airline: airlines[prefix] || '', fromCode: '', toCode: '', fromCity: '', toCity: '', fromCoords: null, toCoords: null };

    try {
      const res = await fetch(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(callsign)}`);
      if (res.ok) {
        const json = await res.json();
        const route = json?.response?.flightroute;
        if (route) {
          if (route.airline?.name) result.airline = route.airline.name;
          if (route.origin?.iata_code) result.fromCode = route.origin.iata_code.toUpperCase();
          if (route.origin?.municipality || route.origin?.name) result.fromCity = route.origin.municipality || route.origin.name;
          if (typeof route.origin?.latitude === 'number' && typeof route.origin?.longitude === 'number') {
            result.fromCoords = [route.origin.latitude, route.origin.longitude];
          }
          if (route.destination?.iata_code) result.toCode = route.destination.iata_code.toUpperCase();
          if (route.destination?.municipality || route.destination?.name) result.toCity = route.destination.municipality || route.destination.name;
          if (typeof route.destination?.latitude === 'number' && typeof route.destination?.longitude === 'number') {
            result.toCoords = [route.destination.latitude, route.destination.longitude];
          }
        }
      }
    } catch (err) {
      console.warn('adsbdb route lookup failed:', err);
    }
    return result;
  }

  function openLegModal(id) {
    const isOut = state.flights.outbound.legs.some((l) => l.id === id);
    const dirObj = isOut ? state.flights.outbound : state.flights.inbound;
    const leg = dirObj.legs.find((l) => l.id === id);
    if (!leg) return;
    let lookedUp = null;

    const defaultIso = leg.dateIso || (isOut ? state.trip.startDate : state.trip.endDate);
    const tzChoices = ['WET', 'WEST', 'CET', 'CEST', 'EST', 'EDT', 'CST', 'CDT', 'PST', 'PDT', 'BRT', 'GST', 'JST', 'UTC', ...COMMON_TIMEZONES.map((x) => x.tz)];
    const tzOptionsHtml = (selected) => {
      const list = tzChoices.includes(selected) ? tzChoices : [selected, ...tzChoices].filter(Boolean);
      return list.map((z) => `<option value="${escapeHtml(z)}" ${z === selected ? 'selected' : ''}>${escapeHtml(z)}</option>`).join('');
    };

    openModal(`Alterar Voo ${leg.flightNumber}`, `
      <form id="f-leg" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Nº do Voo / Callsign (ex: AC 811, RYR6ZL)</label><input id="l-num" class="input mono" value="${escapeHtml(leg.flightNumber)}" required /></div>
          <div><label class="field-label">Data do Voo</label><input id="l-date" type="date" class="input mono" value="${escapeHtml(defaultIso)}" required /></div>
        </div>
        <div style="display:flex;justify-content:flex-start;">
          <button type="button" class="btn btn-sm" id="btn-auto-route">🔍 Preencher Companhia &amp; Rota</button>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Companhia Aérea</label><input id="l-air" class="input" value="${escapeHtml(leg.airline || '')}" /></div>
          <div><label class="field-label">Origem → Destino (IATA)</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <input id="l-from" class="input mono" value="${escapeHtml(leg.fromCode)}" maxlength="3" placeholder="LIS" />
              <input id="l-to" class="input mono" value="${escapeHtml(leg.toCode)}" maxlength="3" placeholder="YYZ" />
            </div>
          </div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Cidade Origem</label><input id="l-from-city" class="input" value="${escapeHtml(leg.fromCity || '')}" placeholder="Lisboa" /></div>
          <div><label class="field-label">Cidade Destino</label><input id="l-to-city" class="input" value="${escapeHtml(leg.toCity || '')}" placeholder="Toronto" /></div>
        </div>
        <div class="form-grid form-grid-2">
          <div>
            <label class="field-label">Hora Partida &amp; Fuso</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <input id="l-dep" class="input mono" value="${escapeHtml(leg.depTime)}" placeholder="10:55" />
              <select id="l-dep-tz" class="select mono">${tzOptionsHtml(leg.depTz || 'WET')}</select>
            </div>
          </div>
          <div>
            <label class="field-label">Hora Chegada &amp; Fuso</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <input id="l-arr" class="input mono" value="${escapeHtml(leg.arrTime)}" placeholder="14:00" />
              <select id="l-arr-tz" class="select mono">${tzOptionsHtml(leg.arrTz || 'CET')}</select>
            </div>
          </div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Terminal Partida</label><input id="l-from-term" class="input" value="${escapeHtml(leg.fromTerminal || '')}" placeholder="Terminal 1" /></div>
          <div><label class="field-label">Terminal Chegada</label><input id="l-to-term" class="input" value="${escapeHtml(leg.toTerminal || '')}" placeholder="Terminal 1" /></div>
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Porta (Gate)</label><input id="l-gate" class="input mono" value="${escapeHtml(leg.gate || '')}" /></div>
          <div><label class="field-label">Lugar (Seat)</label><input id="l-seat" class="input mono" value="${escapeHtml(leg.seat || '')}" /></div>
        </div>
        <div><label class="field-label">Nota / Bagagem (opcional)</label><input id="l-note" class="input" value="${escapeHtml(leg.baggageNote || '')}" placeholder="Ex: Bagagem segue até ao destino final" /></div>
        <div style="display:flex;justify-content:flex-end;margin-top:6px;"><button type="submit" class="btn btn-primary">Guardar Alterações</button></div>
      </form>
    `);

    document.getElementById('btn-auto-route').addEventListener('click', async () => {
      const num = document.getElementById('l-num').value.trim().toUpperCase();
      if (!num) return;
      showToast('A procurar rota...');
      lookedUp = await lookupFlightRoute(num);
      if (lookedUp.airline) document.getElementById('l-air').value = lookedUp.airline;
      if (lookedUp.fromCode) document.getElementById('l-from').value = lookedUp.fromCode;
      if (lookedUp.toCode) document.getElementById('l-to').value = lookedUp.toCode;
      if (lookedUp.fromCity) document.getElementById('l-from-city').value = lookedUp.fromCity;
      if (lookedUp.toCity) document.getElementById('l-to-city').value = lookedUp.toCity;
      showToast(lookedUp.fromCode && lookedUp.toCode ? `Rota encontrada: ${lookedUp.fromCode} → ${lookedUp.toCode}!` : 'Companhia preenchida.');
    });

    document.getElementById('f-leg').addEventListener('submit', (e) => {
      e.preventDefault();
      const newNum = document.getElementById('l-num').value.trim().toUpperCase();
      const newFrom = document.getElementById('l-from').value.trim().toUpperCase();
      const newTo = document.getElementById('l-to').value.trim().toUpperCase();
      const isoDate = document.getElementById('l-date').value;

      const validFlight = /^[A-Z0-9][A-Z0-9\s-]{1,14}$/;
      const validIata = /^[A-Z]{3}$/;

      if (!validFlight.test(newNum)) {
        showToast('Introduza um nº de voo ou callsign válido (ex: AC 811, RYR6ZL).');
        return;
      }
      if (!validIata.test(newFrom) || !validIata.test(newTo)) {
        showToast('Origem e Destino devem ser códigos de 3 letras (ex: LIS, FCO, CUN).');
        return;
      }

      if (isoDate) {
        leg.dateIso = isoDate;
        dirObj.dateLabel = formatDateLongPt(isoDate);
      }
      if (newNum !== leg.flightNumber) {
        leg.flightNumber = newNum;
        leg.liveStatus = null;
      }
      leg.airline = document.getElementById('l-air').value.trim() || leg.airline;
      leg.fromCode = newFrom;
      leg.fromCity = document.getElementById('l-from-city').value.trim() || (lookedUp && lookedUp.fromCode === newFrom ? lookedUp.fromCity : cityName(newFrom));
      leg.fromCoords = (lookedUp && lookedUp.fromCode === newFrom && lookedUp.fromCoords) ? lookedUp.fromCoords : (KNOWN_AIRPORTS[newFrom] || leg.fromCoords || null);
      leg.toCode = newTo;
      leg.toCity = document.getElementById('l-to-city').value.trim() || (lookedUp && lookedUp.toCode === newTo ? lookedUp.toCity : cityName(newTo));
      leg.toCoords = (lookedUp && lookedUp.toCode === newTo && lookedUp.toCoords) ? lookedUp.toCoords : (KNOWN_AIRPORTS[newTo] || leg.toCoords || null);

      leg.depTime = document.getElementById('l-dep').value.trim() || leg.depTime;
      leg.depTz = document.getElementById('l-dep-tz').value || leg.depTz;
      leg.arrTime = document.getElementById('l-arr').value.trim() || leg.arrTime;
      leg.arrTz = document.getElementById('l-arr-tz').value || leg.arrTz;
      leg.fromTerminal = document.getElementById('l-from-term').value.trim();
      leg.toTerminal = document.getElementById('l-to-term').value.trim();
      leg.gate = document.getElementById('l-gate').value.trim() || 'A definir';
      leg.seat = document.getElementById('l-seat').value.trim() || 'A definir';
      leg.baggageNote = document.getElementById('l-note').value.trim();

      // Auto-calculate duration from updated times/timezones
      const depMs = hmToUtcMs(leg.dateIso, leg.depTime, leg.depTz);
      let arrMs = hmToUtcMs(leg.dateIso, leg.arrTime, leg.arrTz);
      if (depMs != null && arrMs != null) {
        while (arrMs <= depMs) arrMs += 86400000;
        leg.duration = formatDurationMs(arrMs - depMs);
      }

      saveState();
      renderAll();
      closeModal();
      fetchAdsbLive(leg.id);
    });
  }

  function openAddAgendaModal() {
    const day = state.days[activeDayIndex];
    if (!day) return;
    openModal(`Adicionar a ${day.shortDate}`, `
      <form id="f-ag" class="form-grid">
        <div class="form-grid form-grid-2">
          <div><label class="field-label">Hora</label><input type="time" id="a-time" class="input mono" value="19:30" required /></div>
          <div><label class="field-label">Plano / Reserva</label><input id="a-title" class="input" placeholder="Ex: Jantar, Excursão..." required /></div>
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
    if (!v || !state.days.length) return;
    openModal(`Agendar ${v.name}`, `
      <form id="f-sv" class="form-grid">
        <div><label class="field-label">Escolher Dia</label><select id="sv-d" class="select">${state.days.map((d, i) => `<option value="${i}" ${i === activeDayIndex ? 'selected' : ''}>${escapeHtml(d.shortDate)}</option>`).join('')}</select></div>
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

  // ---------- Event Bindings ----------
  document.querySelectorAll('[data-view-target]').forEach((b) => b.addEventListener('click', () => switchView(b.getAttribute('data-view-target'))));
  document.getElementById('brand-home-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView(publicMode ? 'flights' : 'overview');
  });
  document.getElementById('hero-btn-flights')?.addEventListener('click', () => switchView('flights'));
  document.getElementById('btn-refresh-map-radar')?.addEventListener('click', () => fetchAdsbLive());
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
  document.getElementById('planner-dinner-select')?.addEventListener('change', (e) => {
    if (state.days[activeDayIndex]) {
      state.days[activeDayIndex].dinnerChoice = e.target.value;
      saveState(); renderPlanner();
    }
  });
  document.getElementById('planner-day-notes')?.addEventListener('input', (e) => {
    if (state.days[activeDayIndex]) {
      state.days[activeDayIndex].notes = e.target.value;
      saveState();
    }
  });

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

  [['conv-mxn', 'DEST'], ['conv-eur', 'EUR'], ['conv-usd', 'USD'], ['conv-cad', 'CAD']].forEach(([id, c]) =>
    document.getElementById(id)?.addEventListener('input', (e) => updateCurrency(c, e.target.value))
  );

  document.getElementById('form-add-expense')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const l = document.getElementById('exp-label');
    const a = document.getElementById('exp-amount');
    const c = document.getElementById('exp-currency');
    const p = document.getElementById('exp-paid-by');
    const s = document.getElementById('exp-split-mode');
    if (l.value.trim() && a.value) {
      state.expenses.push({
        id: `e-${Date.now()}`,
        label: l.value.trim(),
        amount: parseFloat(a.value),
        currency: c.value,
        paidBy: p?.value || getExpenseParticipants()[0],
        splitMode: s?.value || 'equal',
        createdAt: new Date().toISOString()
      });
      l.value = ''; a.value = '';
      saveState(); renderExpenses();
      showToast('Despesa registada!');
    }
  });

  /* ========================================================================
     Cocktails Rating (Privado) — 1 Card per Cocktail, Multiple Reviews, Auto User
     ======================================================================== */
  function getCurrentReviewer() {
    let savedLocal = '';
    try { savedLocal = localStorage.getItem('pyp_user_display_name') || ''; } catch {}
    if (sbUser) {
      const metaName = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name;
      const emailPrefix = sbUser.email ? sbUser.email.split('@')[0].replace(/[._-]+/g, ' ') : '';
      const displayName = metaName || savedLocal || (emailPrefix ? emailPrefix.split(' ').map(capitalize).join(' ') : 'Utilizador');
      return { userId: sbUser.id || sbUser.email || displayName.toLowerCase(), by: displayName };
    }
    return { userId: 'local', by: savedLocal || 'Viajante' };
  }

  document.getElementById('f-settings-profile')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = document.getElementById('st-user-name')?.value.trim();
    if (!newName) return;

    const prevMe = getCurrentReviewer();
    try { localStorage.setItem('pyp_user_display_name', newName); } catch {}

    if (sbClient && sbUser) {
      const { data, error } = await sbClient.auth.updateUser({ data: { full_name: newName } });
      if (error) {
        showToast(`Erro ao atualizar perfil: ${error.message}`);
        return;
      }
      if (data?.user) sbUser = data.user;
      else sbUser.user_metadata = { ...(sbUser.user_metadata || {}), full_name: newName };
    }

    // Update existing reviews belonging to this user so the new name appears everywhere
    const myId = sbUser?.id || sbUser?.email || prevMe.userId;
    (state.cocktails || []).forEach((c) => {
      (c.reviews || []).forEach((r) => {
        if (r.userId === myId || r.userId === prevMe.userId || r.by.toLowerCase() === prevMe.by.toLowerCase()) {
          r.userId = myId;
          r.by = newName;
        }
      });
    });
    (state.venues || []).forEach((v) => {
      (v.reviews || []).forEach((r) => {
        if (r.userId === myId || r.userId === prevMe.userId || r.by.toLowerCase() === prevMe.by.toLowerCase()) {
          r.userId = myId;
          r.by = newName;
        }
      });
    });

    saveState();
    renderAll();
    showToast(`Nome atualizado para "${newName}"!`);
  });

  function getReviewAvg(r) {
    if (r?.aspects) {
      return (Number(r.aspects.flavor || 4) + Number(r.aspects.fresh || 4) + Number(r.aspects.strength || 4) + Number(r.aspects.look || 4)) / 4;
    }
    return Number(r?.rating || 4);
  }

  function getCocktailAvg(c) {
    const revs = Array.isArray(c.reviews) ? c.reviews : [];
    if (!revs.length) return Number(c.rating || 0);
    return revs.reduce((sum, r) => sum + getReviewAvg(r), 0) / revs.length;
  }

  function getCocktailAspectAverages(c) {
    const revs = Array.isArray(c.reviews) ? c.reviews : [];
    if (!revs.length) return null;
    const totals = { flavor: 0, fresh: 0, strength: 0, look: 0 };
    revs.forEach((r) => {
      const fb = Number(r.rating || 4);
      totals.flavor += Number(r.aspects?.flavor ?? fb);
      totals.fresh += Number(r.aspects?.fresh ?? fb);
      totals.strength += Number(r.aspects?.strength ?? fb);
      totals.look += Number(r.aspects?.look ?? fb);
    });
    const n = revs.length;
    return [
      { label: 'Sabor', value: totals.flavor / n },
      { label: 'Frescura', value: totals.fresh / n },
      { label: 'Álcool', value: totals.strength / n },
      { label: 'Visual', value: totals.look / n }
    ];
  }

  function ckNorm(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  document.getElementById('ck-search')?.addEventListener('input', () => renderCocktails());

  function renderCocktails() {
    const grid = document.getElementById('cocktails-list-grid');
    const badge = document.getElementById('cocktails-count-badge');
    const tabSub = document.getElementById('rev-tab-ck-sub');
    if (!grid) return;

    const list = (Array.isArray(state.cocktails) ? state.cocktails : []).filter((c) => Array.isArray(c.reviews) && c.reviews.length > 0);
    const totalReviews = list.reduce((s, c) => s + c.reviews.length, 0);
    if (badge) {
      badge.textContent = `${list.length} ${list.length === 1 ? 'cocktail' : 'cocktails'} · ${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`;
    }
    if (tabSub) {
      tabSub.textContent = list.length > 0 ? `${list.length} no ranking · ${totalReviews} ${totalReviews === 1 ? 'nota' : 'notas'}` : 'Notas de Prova';
    }

    const q = ckNorm(document.getElementById('ck-search')?.value || '');
    const sorted = [...list]
      .filter((c) => !q || ckNorm(c.name).includes(q))
      .sort((a, b) => getCocktailAvg(b) - getCocktailAvg(a));

    if (!sorted.length) {
      grid.innerHTML = `
        <div class="reviews-empty-state">
          <div class="reviews-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 22h8"/><path d="M12 15v7"/><path d="m19 3-7 8-7-8Z"/><path d="M5 3h14"/></svg>
          </div>
          <h3 style="font-size:1.15rem;">Ainda nenhum cocktail avaliado</h3>
          <p style="font-size:0.9rem;color:var(--ink-secondary);max-width:44ch;">Registem o primeiro cocktail no botão <strong>+ Adicionar Cocktail</strong> para começarem o vosso guia de favoritos nos bares!</p>
        </div>`;
      return;
    }

    const medalClasses = ['is-gold', 'is-silver', 'is-bronze'];
    const coupeWatermarkSvg = `<svg class="ck-banner-watermark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14h36L32 34 14 14Z"/><path d="M32 34v18M22 52h20M40 10l6-4"/></svg>`;

    grid.innerHTML = sorted
      .map((c, idx) => {
        const avgNum = getCocktailAvg(c);
        const avg = avgNum.toFixed(1);
        const isGold = idx === 0;
        const rankCls = medalClasses[idx] || '';
        const rankBadgeHtml = `<span class="rank-medallion ${rankCls}">${idx < 3 ? UI_ICONS.trophy : ''}#${idx + 1}</span>`;
        const uniqueBars = [...new Set(c.reviews.map((r) => r.bar || c.bar).filter(Boolean))];
        const uniqueAuthors = [...new Set(c.reviews.map((r) => r.by).filter(Boolean))];
        const sensoryAvgs = getCocktailAspectAverages(c);

        const reviewsHtml = c.reviews
          .map((r) => {
            const rAvg = getReviewAvg(r).toFixed(1);
            const a = r.aspects;
            const revBar = r.bar || c.bar || '';
            return `
              <div class="tasting-note">
                <div class="tasting-note-top">
                  <div class="tasting-author-group">
                    ${renderAvatarHtml(r.by)}
                    <div class="tasting-author-meta">
                      <span class="tasting-author-name">${escapeHtml(r.by)}</span>
                      ${revBar ? `<span class="tasting-author-sub">${UI_ICONS.pin} ${escapeHtml(revBar)}</span>` : ''}
                    </div>
                  </div>
                  <div class="tasting-note-actions">
                    <span class="tasting-score-pill">★ ${rAvg}</span>
                    <button type="button" class="icon-btn" data-edit-ck-rev="${escapeHtml(c.id)}::${escapeHtml(r.id)}" title="Editar esta review">✎</button>
                    <button type="button" class="icon-btn" data-del-ck-rev="${escapeHtml(c.id)}::${escapeHtml(r.id)}" title="Apagar esta review">✕</button>
                  </div>
                </div>
                ${r.note ? `<p class="tasting-quote">“${escapeHtml(r.note)}”</p>` : ''}
                ${a ? `
                  <div class="tasting-subscores">
                    <span class="tasting-subpill">Sabor <strong>${a.flavor}★</strong></span>
                    <span class="tasting-subpill">Frescura <strong>${a.fresh}★</strong></span>
                    <span class="tasting-subpill">Álcool <strong>${a.strength}★</strong></span>
                    <span class="tasting-subpill">Visual <strong>${a.look}★</strong></span>
                  </div>` : ''}
              </div>`;
          })
          .join('');

        return `
          <article class="ck-card ${isGold ? 'is-gold-card' : ''}">
            ${c.photoUrl ? `
              <div class="ck-card-photo-stage">
                <img src="${escapeHtml(c.photoUrl)}" alt="${escapeHtml(c.name)}" loading="lazy" data-zoom-ck="${escapeHtml(c.id)}" />
                <div class="ck-photo-overlay-bar">
                  ${rankBadgeHtml}
                  <label class="ck-photo-upload-pill">
                    ${UI_ICONS.camera} Alterar foto
                    <input type="file" accept="image/*" style="display:none;" data-upload-ck-photo="${escapeHtml(c.id)}" />
                  </label>
                </div>
              </div>
            ` : `
              <div class="ck-card-banner">
                ${coupeWatermarkSvg}
                ${rankBadgeHtml}
                <label class="ck-photo-upload-pill">
                  ${UI_ICONS.camera} + Foto
                  <input type="file" accept="image/*" style="display:none;" data-upload-ck-photo="${escapeHtml(c.id)}" />
                </label>
              </div>
            `}

            <div class="ck-card-body">
              <div class="ck-identity-row">
                <div style="min-width:0;">
                  <h3 class="ck-card-title">${escapeHtml(c.name)}</h3>
                  ${uniqueBars.length ? `
                    <div class="ck-bars-row">
                      ${uniqueBars.map((b) => `<span class="ck-bar-pin">${UI_ICONS.pin} ${escapeHtml(b)}</span>`).join('')}
                    </div>` : ''}
                </div>
                <div class="score-seal ${isGold ? 'is-top' : ''}">
                  <div class="score-seal-main">
                    <span class="score-seal-num">${avg}</span>
                    <span class="score-seal-star">★</span>
                  </div>
                  <span class="score-seal-sub">${c.reviews.length} ${c.reviews.length === 1 ? 'review' : 'reviews'}</span>
                </div>
              </div>

              ${sensoryAvgs ? renderSensoryMeters(sensoryAvgs, isGold) : ''}

              <div class="tasting-feed">
                <div class="tasting-feed-header">
                  <span class="tasting-feed-kicker">Notas de Prova (${c.reviews.length})</span>
                </div>
                ${reviewsHtml}
              </div>
            </div>

            <div class="ck-card-footer">
              <div class="avatar-stack">
                <div class="avatar-stack-circles">
                  ${uniqueAuthors.slice(0, 4).map((a) => renderAvatarHtml(a)).join('')}
                </div>
                <span class="avatar-stack-label">${
                  uniqueAuthors.length === 1
                    ? `Provado por ${escapeHtml(uniqueAuthors[0])}`
                    : `Provado por ${uniqueAuthors.length} pessoas`
                }</span>
              </div>
              <button type="button" class="btn btn-sm" data-review-ck="${escapeHtml(c.id)}">+ Avaliar</button>
            </div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-zoom-ck]').forEach((img) =>
      img.addEventListener('click', () => {
        const ck = (state.cocktails || []).find((x) => x.id === img.getAttribute('data-zoom-ck'));
        if (ck?.photoUrl) openSingleImageLightbox(ck.photoUrl, ck.name, ck.bar || 'Cocktail');
      })
    );

    grid.querySelectorAll('[data-upload-ck-photo]').forEach((inp) =>
      inp.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        const ck = (state.cocktails || []).find((x) => x.id === inp.getAttribute('data-upload-ck-photo'));
        if (!file || !ck) return;
        const url = await uploadVenueImage(file, 'cocktails');
        if (url) {
          ck.photoUrl = url;
          saveState();
          renderCocktails();
          showToast(`Fotografia de ${ck.name} guardada!`);
        }
      })
    );

    grid.querySelectorAll('[data-review-ck]').forEach((b) =>
      b.addEventListener('click', () => openCocktailReviewModal(b.getAttribute('data-review-ck'), null))
    );

    grid.querySelectorAll('[data-edit-ck-rev]').forEach((b) =>
      b.addEventListener('click', () => {
        const [ckId, revId] = b.getAttribute('data-edit-ck-rev').split('::');
        openCocktailReviewModal(ckId, revId);
      })
    );

    grid.querySelectorAll('[data-del-ck-rev]').forEach((b) =>
      b.addEventListener('click', () => {
        const [ckId, revId] = b.getAttribute('data-del-ck-rev').split('::');
        const ck = (state.cocktails || []).find((x) => x.id === ckId);
        const rev = ck?.reviews?.find((r) => r.id === revId);
        if (!ck || !rev) return;
        const isLast = ck.reviews.length === 1;
        const previewHtml = `
          ${ck.photoUrl ? `<img src="${escapeHtml(ck.photoUrl)}" alt="" style="width:54px;height:54px;object-fit:cover;border-radius:8px;flex-shrink:0;" />` : `<span style="font-size:1.8rem;">🍹</span>`}
          <div>
            <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(ck.name)}</div>
            <div style="font-size:0.8rem;color:var(--ink-secondary);">Review de <strong>${escapeHtml(rev.by)}</strong>${rev.bar ? ` · ${escapeHtml(rev.bar)}` : ''} (★ ${getReviewAvg(rev).toFixed(1)})</div>
          </div>`;
        openConfirmModal({
          title: 'Apagar Review?',
          message: isLast
            ? `Esta é a única review de "${ck.name}". Ao apagá-la, o cocktail também será removido do ranking.`
            : `Tem a certeza que quer apagar a review de ${rev.by} em "${ck.name}"?`,
          previewHtml,
          confirmLabel: 'Apagar Review',
          onConfirm: () => {
            ck.reviews = ck.reviews.filter((r) => r.id !== revId);
            if (!ck.reviews.length) {
              state.cocktails = state.cocktails.filter((x) => x.id !== ckId);
            }
            saveState();
            renderCocktails();
            showToast('Review removida');
          }
        });
      })
    );
  }

  function openCocktailReviewModal(existingCocktailId = null, editReviewId = null) {
    const existing = existingCocktailId ? (state.cocktails || []).find((c) => c.id === existingCocktailId) : null;
    const editingRev = existing && editReviewId ? (existing.reviews || []).find((r) => r.id === editReviewId) : null;
    const me = getCurrentReviewer();

    const bars = state.venues.filter((v) => v.category === 'bars');
    const others = state.venues.filter((v) => v.category !== 'bars');
    const selectedBar = editingRev?.bar || existing?.bar || '';
    const allBarNames = [
      ...bars.map((v) => v.name),
      ...others.map((v) => v.name),
      'Outro Bar / Local'
    ];
    if (selectedBar && !allBarNames.includes(selectedBar)) allBarNames.unshift(selectedBar);
    const barOpts = allBarNames
      .map((name) => `<option value="${escapeHtml(name)}" ${name === selectedBar ? 'selected' : ''}>${escapeHtml(name)}</option>`)
      .join('');

    const prevA = editingRev?.aspects || { flavor: 5, fresh: 5, strength: 4, look: 4 };
    const criteria = [
      { key: 'flavor', inputId: 'ck-flavor', label: '🍋 Sabor & Equilíbrio' },
      { key: 'fresh', inputId: 'ck-fresh', label: '🧊 Frescura & Temperatura' },
      { key: 'strength', inputId: 'ck-strength', label: '🥃 Força / Álcool' },
      { key: 'look', inputId: 'ck-look', label: '🍹 Apresentação' }
    ];

    const modalTitle = editingRev
      ? `Editar Review — ${existing.name}`
      : (existing ? `Avaliar ${existing.name}` : 'Adicionar Cocktail ao Ranking');

    openModal(modalTitle, `
      <form id="form-add-cocktail" class="form-grid">
        ${!existing ? `
          <div class="form-grid form-grid-2">
            <div>
              <label class="field-label" for="ck-name">Nome do Cocktail</label>
              <input type="text" id="ck-name" class="input" placeholder="Ex: Mango Margarita, Mojito..." required />
            </div>
            <div>
              <label class="field-label" for="ck-bar">Local / Bar</label>
              <select id="ck-bar" class="select">${barOpts}</select>
            </div>
          </div>
        ` : `
          <div class="form-grid form-grid-2" style="align-items:end;">
            <div>
              <div style="font-size:0.74rem;color:var(--ink-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Cocktail</div>
              <div style="font-family:var(--font-serif);font-size:1.18rem;font-weight:600;">${escapeHtml(existing.name)}</div>
            </div>
            <div>
              <label class="field-label" for="ck-bar">Local / Bar onde bebeu</label>
              <select id="ck-bar" class="select">${barOpts}</select>
            </div>
          </div>
        `}

        ${renderStarPickerMarkup(criteria, prevA)}

        <div>
          <label class="field-label" for="ck-note">Notas de Prova / Dica (opcional)</label>
          <input type="text" id="ck-note" class="input" value="${escapeHtml(editingRev?.note || '')}" placeholder="Ex: Pedir sem sal na borda, super refrescante..." />
        </div>

        <div>
          <label class="field-label" for="ck-photo">${existing?.photoUrl ? 'Substituir Foto do Cocktail (opcional)' : 'Foto do Cocktail (opcional)'}</label>
          <input type="file" id="ck-photo" accept="image/*" class="input" />
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;">
          <button type="submit" class="btn btn-primary" id="btn-submit-cocktail">${editingRev ? 'Guardar Alterações' : '+ Guardar Review'}</button>
        </div>
      </form>
    `);

    bindStarPickerEvents(criteria);

    const nameInput = document.getElementById('ck-name');
    if (nameInput) {
      const box = document.createElement('div');
      box.style.cssText = 'display:none;margin-top:6px;border:1px solid var(--border,#ddd);border-radius:10px;overflow:hidden;background:var(--surface,#fff);';
      nameInput.insertAdjacentElement('afterend', box);
      nameInput.setAttribute('autocomplete', 'off');
      nameInput.addEventListener('input', () => {
        const q = ckNorm(nameInput.value);
        const matches = q ? (state.cocktails || []).filter((c) => ckNorm(c.name).includes(q)).slice(0, 6) : [];
        if (!matches.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
        box.innerHTML =
          `<div style="padding:6px 10px;font-size:0.72rem;color:var(--ink-muted);font-weight:700;text-transform:uppercase;">Já existe na lista — toque para usar</div>` +
          matches.map((c) => `<button type="button" data-ck-suggest="${escapeHtml(c.name)}" style="display:block;width:100%;text-align:left;padding:8px 10px;border:0;border-top:1px solid var(--border,#eee);background:transparent;cursor:pointer;font:inherit;">${escapeHtml(c.name)}</button>`).join('');
        box.style.display = 'block';
      });
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-ck-suggest]');
        if (!b) return;
        nameInput.value = b.getAttribute('data-ck-suggest');
        box.style.display = 'none';
      });
    }

    document.getElementById('form-add-cocktail').addEventListener('submit', async (e) => {
      e.preventDefault();
      const bar = document.getElementById('ck-bar').value;
      const flavor = Number(document.getElementById('ck-flavor').value) || 4;
      const fresh = Number(document.getElementById('ck-fresh').value) || 4;
      const strength = Number(document.getElementById('ck-strength').value) || 4;
      const look = Number(document.getElementById('ck-look').value) || 4;
      const note = document.getElementById('ck-note').value.trim();
      const photoInput = document.getElementById('ck-photo');
      const photoFile = photoInput?.files?.[0];
      const avg = (flavor + fresh + strength + look) / 4;

      let target = existing;
      if (!target) {
        const name = document.getElementById('ck-name').value.trim();
        if (!name) return;
        const normName = name.toLowerCase();
        target = (state.cocktails || []).find((c) => String(c.name || '').trim().toLowerCase() === normName);
        if (!target) {
          target = { id: `ck-${Date.now()}`, name, bar, photoUrl: '', reviews: [] };
          if (!Array.isArray(state.cocktails)) state.cocktails = [];
          state.cocktails.push(target);
        }
      }

      if (photoFile) {
        const uploadedUrl = await uploadVenueImage(photoFile, 'cocktails');
        if (uploadedUrl) target.photoUrl = uploadedUrl;
      }

      const existingRevIdx = editingRev
        ? target.reviews.findIndex((r) => r.id === editingRev.id)
        : target.reviews.findIndex(
            (r) => (r.userId === me.userId || r.by.toLowerCase() === me.by.toLowerCase()) &&
                   String(r.bar || target.bar || '').toLowerCase() === String(bar || '').toLowerCase()
          );

      const revPayload = {
        id: existingRevIdx >= 0 ? target.reviews[existingRevIdx].id : `rev-${Date.now()}`,
        userId: editingRev?.userId || me.userId,
        by: editingRev?.by || me.by,
        bar,
        rating: avg,
        aspects: { flavor, fresh, strength, look },
        note,
        createdAt: editingRev?.createdAt || new Date().toISOString()
      };

      if (existingRevIdx >= 0) {
        target.reviews[existingRevIdx] = revPayload;
      } else {
        target.reviews.push(revPayload);
      }

      saveState();
      renderCocktails();
      closeModal();
      showToast(`${target.name} (${bar}) atualizado — ${avg.toFixed(1)}★!`);
    });
  }

  document.getElementById('btn-fab-add-cocktail')?.addEventListener('click', () => openCocktailReviewModal(null));

  /* ========================================================================
     Supabase Cloud Sync (Private trip_state + Public public_trip) & Photos
     ======================================================================== */
  const PUBLIC_VIEWS = new Set(['flights', 'photos']);
  let sbClient = null;
  let sbUser = null;
  let syncTimer = null;

  function buildPublicPayload() {
    const t = state.trip;
    const sanitizeLegs = (legs) =>
      (legs || []).map((l) => ({
        id: l.id,
        dateIso: l.dateIso,
        flightNumber: l.flightNumber,
        airline: l.airline,
        fromCode: l.fromCode,
        fromCity: l.fromCity,
        fromCoords: l.fromCoords || null,
        toCode: l.toCode,
        toCity: l.toCity,
        toCoords: l.toCoords || null,
        depTime: l.depTime,
        depTz: l.depTz,
        arrTime: l.arrTime,
        arrTz: l.arrTz,
        duration: l.duration,
        liveStatus: l.liveStatus || null
      }));

    return {
      trip: {
        title: t.title,
        destination: t.destination,
        country: t.country,
        subtitle: t.subtitle,
        headline: t.headline,
        travelers: t.travelers,
        startDate: t.startDate,
        endDate: t.endDate,
        homeCity: t.homeCity,
        homeCode: t.homeCode,
        homeTz: t.homeTz,
        destCity: t.destCity,
        destCode: t.destCode,
        destTz: t.destTz,
        publicShowStay: t.publicShowStay !== false,
        publicNote: t.publicNote || ''
      },
      flights: {
        outbound: {
          dateLabel: state.flights.outbound.dateLabel,
          summary: state.flights.outbound.summary,
          legs: sanitizeLegs(state.flights.outbound.legs)
        },
        inbound: {
          dateLabel: state.flights.inbound.dateLabel,
          summary: state.flights.inbound.summary,
          legs: sanitizeLegs(state.flights.inbound.legs)
        }
      },
      days: (state.days || []).map((d) => ({
        dayNumber: d.dayNumber,
        date: d.date,
        shortDate: d.shortDate
      }))
    };
  }

  async function pushPublicTrip(showErrorToast = false) {
    if (!sbClient || !sbUser) return false;
    const badge = document.getElementById('public-sync-badge');
    try {
      const { error } = await sbClient.from('public_trip').upsert({
        id: 'main-trip',
        data: buildPublicPayload(),
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      if (badge) {
        badge.className = 'tag tag-open';
        badge.textContent = '✓ Link público atualizado';
      }
      return true;
    } catch (err) {
      console.warn('Public trip sync error:', err);
      if (badge) {
        badge.className = 'tag tag-soon';
        badge.textContent = 'Executar supabase.sql p/ partilha pública';
      }
      if (showErrorToast) {
        showToast('Execute o SQL em supabase.sql no Supabase para ativar a tabela public_trip.');
      }
      return false;
    }
  }

  async function pullPublicTrip() {
    if (!sbClient || sbUser) return;
    try {
      const { data, error } = await sbClient.from('public_trip').select('data').eq('id', 'main-trip').maybeSingle();
      if (error || !data || !data.data) return;
      const pub = data.data;
      if (pub.trip) state.trip = { ...state.trip, ...pub.trip };
      if (pub.flights?.outbound?.legs) {
        state.flights.outbound = { ...state.flights.outbound, ...pub.flights.outbound };
      }
      if (pub.flights?.inbound?.legs) {
        state.flights.inbound = { ...state.flights.inbound, ...pub.flights.inbound };
      }
      if (Array.isArray(pub.days) && pub.days.length) {
        state.days = pub.days.map((d) => ({
          ...d,
          theme: d.theme || '',
          dinnerChoice: 'Sem restaurante marcado',
          notes: '',
          items: []
        }));
      }
      renderTripChrome();
      updateClocksAndCountdown();
      chooseDefaultFlightDir();
      renderFlights();
    } catch (err) {
      console.warn('Public trip pull failed:', err);
    }
  }

  function openLoginModal() {
    openModal('Área Privada', `
      <form id="form-modal-login" class="form-grid">
        <p style="font-size:0.84rem;color:var(--ink-secondary);">
          O painel da <strong>Viagem</strong> e as <strong>Fotos</strong> são públicos para amigos e família acompanharem. Inicie sessão para editar Configurações, Plano, Locais, Cocktails e Mala.
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
    document.querySelectorAll('[data-public-only="true"]').forEach((el) => {
      el.style.display = isLoggedIn ? 'none' : '';
    });

    const modeChanged = publicMode === isLoggedIn;
    publicMode = !isLoggedIn;
    document.documentElement.classList.toggle('is-public', publicMode);

    const authBtn = document.getElementById('btn-header-auth');
    const loginIcon = document.getElementById('header-action-icon-login');
    const settingsIcon = document.getElementById('header-action-icon-settings');
    const actionLabel = document.getElementById('header-action-label');
    if (authBtn) {
      authBtn.classList.toggle('is-settings-mode', isLoggedIn);
      authBtn.classList.toggle('is-active', isLoggedIn && activeView === 'settings');
      authBtn.setAttribute('aria-label', isLoggedIn ? 'Abrir Configuração' : 'Entrar na área privada');
    }
    if (loginIcon) loginIcon.style.display = isLoggedIn ? 'none' : '';
    if (settingsIcon) settingsIcon.style.display = isLoggedIn ? '' : 'none';
    if (actionLabel) actionLabel.textContent = isLoggedIn ? 'Configuração' : 'Entrar';

    if (!isLoggedIn && !PUBLIC_VIEWS.has(activeView)) {
      switchView('flights', { pushHistory: false });
    } else if (isLoggedIn && modeChanged) {
      const fromHash = window.location.hash ? window.location.hash.slice(1) : '';
      const initialPrivate = (fromHash && document.getElementById(`view-${fromHash}`)) ? fromHash : 'overview';
      switchView(initialPrivate, { pushHistory: false });
    }
    renderTripChrome();
    if (modeChanged) renderFlights();
    renderPhotosAndSync();
  }

  document.getElementById('btn-header-auth')?.addEventListener('click', () => {
    if (sbUser) {
      if (activeView === 'settings') switchView(lastNonSettingsView || 'overview');
      else switchView('settings');
    } else {
      openLoginModal();
    }
  });
  document.getElementById('btn-settings-logout')?.addEventListener('click', () => {
    if (sbUser && sbClient) {
      sbClient.auth.signOut();
      showToast('Sessão terminada');
    }
  });
  document.getElementById('btn-footer-login')?.addEventListener('click', openLoginModal);

  // Acordeão exclusivo em Configuração (abre uma secção de cada vez)
  document.querySelectorAll('#view-settings .settings-accordion').forEach((det) => {
    det.addEventListener('toggle', () => {
      if (!det.open) return;
      document.querySelectorAll('#view-settings .settings-accordion').forEach((other) => {
        if (other !== det && other.open) other.open = false;
      });
    });
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
        else pullPublicTrip();
      });
      sbClient.auth.onAuthStateChange((_evt, session) => {
        sbUser = session?.user || null;
        updateAuthVisibility();
        loadPhotosGallery();
        if (sbUser) pullStateFromSupabase();
        else pullPublicTrip();
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
        await pushPublicTrip(false);
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
      state = normalizeState(data.data);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
      renderAll();
      // Ensure public_trip stays aligned with the latest private state
      pushPublicTrip(false);
    }
  }

  // ---------- Photos Gallery & Lightbox ----------
  let galleryPhotos = [];

  function tripDayLabel(dayNumber) {
    const d = (state.days || []).find((x) => Number(x.dayNumber) === Number(dayNumber));
    const baseIso = state.trip.startDate || '2026-11-28';
    const iso = d && d.date ? d.date : new Date(Date.parse(`${baseIso}T12:00:00Z`) + (Number(dayNumber) - 1) * 86400000).toISOString().slice(0, 10);
    try {
      return new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
    } catch {
      return '';
    }
  }

  function formatCommentTime(iso) {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
    } catch {
      return '';
    }
  }

  async function loadPhotosGallery() {
    const grid = document.getElementById('photos-gallery-grid');
    if (!grid || !sbClient) return;
    grid.innerHTML = `<p class="photo-empty">A carregar as fotografias…</p>`;

    const [photosRes, commentsRes] = await Promise.all([
      sbClient.from('trip_photos').select('*').order('created_at', { ascending: true }),
      sbClient.from('trip_photo_comments').select('*').order('created_at', { ascending: true }).then((r) => r).catch(() => ({ data: [], error: true }))
    ]);

    const { data: rows, error } = photosRes;
    if (error || !rows || !rows.length) {
      galleryPhotos = [];
      grid.innerHTML = `<div class="photo-empty-card"><span aria-hidden="true">📷</span><p>Ainda não há fotografias.<br/>Assim que forem publicadas, aparecem aqui.</p></div>`;
      return;
    }

    const commentsByPhoto = new Map();
    if (commentsRes && Array.isArray(commentsRes.data)) {
      commentsRes.data.forEach((cm) => {
        const pid = String(cm.photo_id);
        if (!commentsByPhoto.has(pid)) commentsByPhoto.set(pid, []);
        commentsByPhoto.get(pid).push(cm);
      });
    }

    let savedVisitorName = '';
    try { savedVisitorName = localStorage.getItem('pyp_guest_comment_name') || ''; } catch {}
    const defaultCommenterName = sbUser ? getCurrentReviewer().by : savedVisitorName;

    const byDay = new Map();
    rows.forEach((row) => {
      const day = Number(row.day_number) || 1;
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(row);
    });
    const days = [...byDay.keys()].sort((a, b) => b - a);

    galleryPhotos = [];
    const sections = days.map((day) => {
      const dayLabel = tripDayLabel(day);
      const items = byDay.get(day).map((row) => {
        const { data: pub } = sbClient.storage.from('trip-photos').getPublicUrl(row.storage_path);
        const imgUrl = pub?.publicUrl || '';
        if (!imgUrl) return '';
        const idx = galleryPhotos.length;
        galleryPhotos.push({ url: imgUrl, caption: row.caption || '', dayLabel: `Dia ${day} · ${dayLabel}` });

        const pid = String(row.id);
        const cmList = commentsByPhoto.get(pid) || [];
        const cmHtml = cmList
          .map((cm) => `
            <div class="photo-comment-item">
              <div style="min-width:0;flex:1;">
                <div><span class="photo-comment-author">${escapeHtml(cm.author_name)}</span><span class="photo-comment-time">${escapeHtml(formatCommentTime(cm.created_at))}</span></div>
                <div>${escapeHtml(cm.message)}</div>
              </div>
              ${sbUser ? `<button type="button" class="icon-btn" style="padding:2px 5px;font-size:0.75rem;" data-del-comment="${escapeHtml(cm.id)}" data-del-comment-author="${escapeHtml(cm.author_name)}" title="Apagar comentário">✕</button>` : ''}
            </div>`)
          .join('');

        return `
          <figure class="photo-item">
            <button type="button" class="photo-open" data-photo-index="${idx}" aria-label="Ver fotografia em grande${row.caption ? `: ${escapeHtml(row.caption)}` : ''}">
              <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(row.caption || `Fotografia do dia ${day}`)}" loading="lazy" />
            </button>
            ${row.caption || sbUser ? `<figcaption class="photo-caption">
              <span>${escapeHtml(row.caption || '')}</span>
              ${sbUser ? `<div style="display:flex;align-items:center;gap:4px;">
                <button type="button" class="icon-btn" data-edit-photo="${escapeHtml(row.id)}" data-edit-caption="${escapeHtml(row.caption || '')}" title="Editar descrição">✎</button>
                <button type="button" class="icon-btn" data-del-photo="${escapeHtml(row.id)}" data-del-path="${escapeHtml(row.storage_path)}" data-del-url="${escapeHtml(imgUrl)}" data-del-caption="${escapeHtml(row.caption || `Dia ${day}`)}" title="Apagar foto">✕</button>
              </div>` : ''}
            </figcaption>` : ''}
            <div class="photo-comments">
              ${cmList.length ? `<div class="photo-comments-list">${cmHtml}</div>` : ''}
              <button type="button" class="btn btn-sm photo-comment-toggle" data-toggle-cm-form="${escapeHtml(pid)}">
                💬 ${cmList.length ? `Comentar (${cmList.length})` : 'Deixar comentário'}
              </button>
              <form class="photo-comment-form" data-cm-form="${escapeHtml(pid)}" style="display:none;">
                <input type="text" class="input" data-cm-name placeholder="O teu nome..." value="${escapeHtml(defaultCommenterName)}" maxlength="60" required />
                <div class="photo-comment-form-row">
                  <input type="text" class="input" data-cm-msg style="flex:1;min-width:160px;" placeholder="Escreve uma mensagem..." maxlength="500" required />
                  <button type="submit" class="btn btn-primary btn-sm">Enviar</button>
                </div>
              </form>
            </div>
          </figure>`;
      }).join('');
      const count = byDay.get(day).length;
      return `
        <section class="photo-day">
          <h3 class="photo-day-title">Dia ${day}<span class="photo-day-date">${escapeHtml(dayLabel)}</span></h3>
          <p class="photo-day-count">${count} ${count === 1 ? 'fotografia' : 'fotografias'}</p>
          <div class="photo-day-list">${items}</div>
        </section>`;
    });

    grid.innerHTML = sections.join('');
    grid.querySelectorAll('[data-photo-index]').forEach((b) =>
      b.addEventListener('click', () => openLightbox(Number(b.getAttribute('data-photo-index'))))
    );

    grid.querySelectorAll('[data-toggle-cm-form]').forEach((b) =>
      b.addEventListener('click', () => {
        const pid = b.getAttribute('data-toggle-cm-form');
        const form = grid.querySelector(`[data-cm-form="${CSS.escape(pid)}"]`);
        if (!form) return;
        const isOpen = form.style.display !== 'none';
        form.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
          const nameInp = form.querySelector('[data-cm-name]');
          const msgInp = form.querySelector('[data-cm-msg]');
          if (nameInp && !nameInp.value.trim()) nameInp.focus();
          else if (msgInp) msgInp.focus();
        }
      })
    );

    grid.querySelectorAll('[data-cm-form]').forEach((form) =>
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pid = form.getAttribute('data-cm-form');
        const nameVal = form.querySelector('[data-cm-name]')?.value.trim();
        const msgVal = form.querySelector('[data-cm-msg]')?.value.trim();
        if (!nameVal || !msgVal) return;

        try { localStorage.setItem('pyp_guest_comment_name', nameVal); } catch {}
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'A enviar...'; }

        const { error: insErr } = await sbClient.from('trip_photo_comments').insert({
          photo_id: pid,
          author_name: nameVal,
          message: msgVal
        });

        if (insErr) {
          showToast('Para ativar comentários, execute o SQL atualizado em supabase.sql no Supabase.');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Enviar'; }
          return;
        }

        showToast('Comentário publicado!');
        loadPhotosGallery();
      })
    );

    grid.querySelectorAll('[data-del-comment]').forEach((b) =>
      b.addEventListener('click', () => {
        const cmId = b.getAttribute('data-del-comment');
        const author = b.getAttribute('data-del-comment-author') || 'visitante';
        openConfirmModal({
          title: 'Apagar Comentário?',
          message: `Tem a certeza que quer apagar este comentário de ${author}?`,
          confirmLabel: 'Apagar Comentário',
          onConfirm: async () => {
            await sbClient.from('trip_photo_comments').delete().eq('id', cmId);
            showToast('Comentário removido');
            loadPhotosGallery();
          }
        });
      })
    );

    grid.querySelectorAll('[data-edit-photo]').forEach((b) =>
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-edit-photo');
        const currentCaption = b.getAttribute('data-edit-caption') || '';
        openModal('Editar Descrição da Fotografia', `
          <form id="f-edit-photo-cap" class="form-grid">
            <div>
              <label class="field-label" for="epc-text">Descrição / Legenda</label>
              <input id="epc-text" class="input" value="${escapeHtml(currentCaption)}" placeholder="Ex: Pôr do sol na praia..." />
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;">
              <button type="button" class="btn" id="btn-epc-cancel">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
          </form>
        `);
        document.getElementById('btn-epc-cancel')?.addEventListener('click', closeModal);
        document.getElementById('f-edit-photo-cap')?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const newCap = document.getElementById('epc-text').value.trim();
          const { error: upErr } = await sbClient.from('trip_photos').update({ caption: newCap }).eq('id', id);
          if (upErr) {
            showToast(`Erro ao atualizar descrição: ${upErr.message}`);
            return;
          }
          closeModal();
          showToast('Descrição atualizada!');
          loadPhotosGallery();
        });
      })
    );

    grid.querySelectorAll('[data-del-photo]').forEach((b) =>
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-del-photo');
        const path = b.getAttribute('data-del-path');
        const url = b.getAttribute('data-del-url') || '';
        const cap = b.getAttribute('data-del-caption') || 'Fotografia da viagem';
        const previewHtml = `
          ${url ? `<img src="${escapeHtml(url)}" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:10px;flex-shrink:0;" />` : ''}
          <div>
            <div style="font-weight:700;font-size:0.92rem;">${escapeHtml(cap)}</div>
            <div style="font-size:0.78rem;color:var(--ink-secondary);">Será removida da galeria pública e do armazenamento.</div>
          </div>`;
        openConfirmModal({
          title: 'Apagar Fotografia?',
          message: 'Tem a certeza que quer apagar esta fotografia permanentemente?',
          previewHtml,
          confirmLabel: 'Apagar Fotografia',
          onConfirm: async () => {
            await sbClient.storage.from('trip-photos').remove([path]);
            await sbClient.from('trip_photos').delete().eq('id', id);
            showToast('Foto removida');
            loadPhotosGallery();
          }
        });
      })
    );
  }

  let lightboxIndex = 0;
  let lightboxOpen = false;

  function renderLightbox() {
    const p = galleryPhotos[lightboxIndex];
    if (!p) return;
    const img = document.getElementById('lightbox-img');
    img.src = p.url;
    img.alt = p.caption || 'Fotografia da viagem';
    document.getElementById('lightbox-caption').innerHTML =
      `${p.caption ? `<strong>${escapeHtml(p.caption)}</strong>` : ''}<span>${escapeHtml(p.dayLabel)}</span>`;
    document.getElementById('lightbox-counter').textContent = `${lightboxIndex + 1} de ${galleryPhotos.length}`;
    document.getElementById('lightbox-prev').disabled = lightboxIndex === 0;
    document.getElementById('lightbox-next').disabled = lightboxIndex >= galleryPhotos.length - 1;
  }

  function openLightbox(index) {
    if (!galleryPhotos.length) return;
    lightboxIndex = Math.max(0, Math.min(index, galleryPhotos.length - 1));
    renderLightbox();
    document.getElementById('photo-lightbox').hidden = false;
    document.documentElement.classList.add('lightbox-open');
    if (!lightboxOpen) {
      try { history.pushState({ lightbox: true }, ''); } catch {}
    }
    lightboxOpen = true;
    document.getElementById('lightbox-close').focus();
  }

  function hideLightbox() {
    document.getElementById('photo-lightbox').hidden = true;
    document.documentElement.classList.remove('lightbox-open');
    lightboxOpen = false;
  }

  function closeLightbox() {
    if (!lightboxOpen) return;
    if (history.state && history.state.lightbox) history.back();
    else hideLightbox();
  }

  function stepLightbox(delta) {
    const next = lightboxIndex + delta;
    if (next < 0 || next >= galleryPhotos.length) return;
    lightboxIndex = next;
    renderLightbox();
  }

  window.addEventListener('popstate', () => { if (lightboxOpen) hideLightbox(); });
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => stepLightbox(-1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => stepLightbox(1));
  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') stepLightbox(-1);
    else if (e.key === 'ArrowRight') stepLightbox(1);
  });
  (function setupLightboxSwipe() {
    const stage = document.getElementById('lightbox-stage');
    if (!stage) return;
    let startX = null;
    let startY = null;
    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { startX = null; return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) stepLightbox(dx < 0 ? 1 : -1);
    });
  })();

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

  function renderAll() {
    renderTripChrome();
    updateClocksAndCountdown();
    renderOverview();
    renderFlights();
    renderSettings();
    renderPlanner();
    renderResortVenues();
    renderCocktails();
    renderPacking();
    renderExpenses();
  }

  const _origSave = saveState;
  saveState = function () {
    _origSave();
    queueCloudSave();
  };

  activeView = 'flights';
  chooseDefaultFlightDir();
  renderAll();
  updateCurrency('EUR', '20');
  initSupabase();

  setInterval(updateClocksAndCountdown, 30000);
  setInterval(() => {
    if (activeView === 'flights') renderFlightStatus();
  }, 60000);
  // Keep public visitors always up-to-date when they return to the tab or leave it open
  setInterval(() => {
    if (publicMode) pullPublicTrip();
  }, 5 * 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && publicMode) {
      pullPublicTrip();
      loadPhotosGallery();
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  // ---------- Mobile UX: Retractable Header, Planner Swipe & Settings Auto-Save ----------
  (function setupMobileUxEnhancements() {
    // 1. Retractable topbar on mobile scroll
    const topbar = document.querySelector('.topbar');
    if (topbar) {
      let lastY = window.scrollY;
      window.addEventListener('scroll', () => {
        if (window.innerWidth >= 900) {
          topbar.classList.remove('is-hidden');
          return;
        }
        const y = window.scrollY;
        if (y > 80 && y > lastY + 8) topbar.classList.add('is-hidden');
        else if (y < lastY - 8 || y <= 40) topbar.classList.remove('is-hidden');
        lastY = y;
      }, { passive: true });
    }

    // 2. Swipe left/right on Planner to switch days
    const plannerLayout = document.querySelector('#view-planner .planner-layout');
    if (plannerLayout) {
      let sx = null;
      let sy = null;
      plannerLayout.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) { sx = null; return; }
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
      }, { passive: true });
      plannerLayout.addEventListener('touchend', (e) => {
        if (sx == null || !state.days.length) return;
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        sx = null;
        if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          const next = activeDayIndex + (dx < 0 ? 1 : -1);
          if (next >= 0 && next < state.days.length) {
            activeDayIndex = next;
            renderPlanner();
          }
        }
      }, { passive: true });
    }

    // 3. Auto-save on change in Settings forms
    ['f-settings-profile', 'f-settings-trip', 'f-settings-public'].forEach((formId) => {
      const form = document.getElementById(formId);
      if (!form) return;
      form.addEventListener('change', (e) => {
        if (e.target && e.target.matches('input, select, textarea')) {
          if (typeof form.requestSubmit === 'function') form.requestSubmit();
        }
      });
    });
  })();
})();
