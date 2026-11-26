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

    const destTz = state.trip.destTz || 'Europe/Lisbon';
    const destCity = state.trip.destCity || state.trip.destination || 'Destino';
    const destTime = formatTzTime(destTz);
    const ovDestLbl = document.getElementById('overview-dest-tz-label');
    if (ovDestLbl) {
      ovDestLbl.innerHTML = `Hora local em ${escapeHtml(destCity)} (<span class="mono" id="overview-dest-time">${escapeHtml(destTime)}</span>)`;
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

  function switchView(viewName) {
    activeView = viewName;
    if (viewName === 'resort' && activeRestaurantId) {
      activeRestaurantId = null;
      renderResortVenues();
    }
    document.querySelectorAll('.view-panel').forEach((p) => p.classList.toggle('is-active', p.id === `view-${viewName}`));
    document.querySelectorAll('[data-view-target]').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-view-target') === viewName));
    if (viewName === 'flights') {
      setTimeout(() => {
        if (typeof updateFlightMap === 'function') updateFlightMap();
      }, 60);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
    if (openTitle) openTitle.textContent = `Aberto Agora${t.title ? ` · ${t.title.split(' ').slice(0, 2).join(' ')}` : ''}`;

    const nowMins = getDestMinutesNow('live');
    const openVenues = state.venues
      .map((v) => ({ v, st: evaluateVenueStatus(v, nowMins) }))
      .filter((x) => x.st.state === 'open' || x.st.state === 'soon')
      .slice(0, 4);

    const openEl = document.getElementById('overview-open-venues');
    if (openEl) {
      openEl.innerHTML = openVenues.length
        ? openVenues
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
            .join('')
        : `<p style="font-size:0.84rem;color:var(--ink-muted);">Sem locais abertos neste horário (ou ainda sem locais configurados).</p>`;
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
          <p class="sf-meta">Duração ${escapeHtml(durText)} · ${escapeHtml(leg.airline ? `${leg.airline} · ` : '')}Voo ${escapeHtml(leg.flightNumber)}</p>
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
            <div class="bp-flight-badge">
              <span class="bp-step-pill">${stepLabel}</span>
              <span class="bp-flight-num">${escapeHtml(leg.flightNumber)}</span>
              <span>${escapeHtml(leg.airline || 'Companhia')} · Callsign <strong class="mono">${escapeHtml(icao)}</strong></span>
              ${formatStatusBadge(live, inWin, prog)}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn btn-ghost-light btn-sm" data-edit-leg="${escapeHtml(leg.id)}">✎ Editar</button>
              <button type="button" class="btn btn-ghost-light btn-sm" data-refresh-leg="${escapeHtml(leg.id)}">↻ Radar</button>
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

  // ---------- Restaurants: Ranking Postcards + Dedicated Page (Photo, Menu, Dishes & Reviews) ----------
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

  function openRateVenueModal(venueId) {
    const v = state.venues.find((x) => x.id === venueId);
    if (!v) return;
    if (!Array.isArray(v.reviews)) v.reviews = [];
    const me = getCurrentReviewer();
    const myPrev = v.reviews.find((r) => r.userId === me.userId || r.by.toLowerCase() === me.by.toLowerCase());
    const a = myPrev?.aspects || { food: 4, vibe: 4, service: 4, quality: 4 };
    const opts = (val) =>
      [5, 4, 3, 2, 1]
        .map((n) => `<option value="${n}" ${Number(val) === n ? 'selected' : ''}>${'★'.repeat(n)}${'☆'.repeat(5 - n)} (${n})</option>`)
        .join('');

    openModal(myPrev ? `Editar Review — ${v.name}` : `Avaliar ${v.name}`, `
      <form id="f-rate-venue" class="form-grid">
        <div>
          <label class="field-label" for="rv-dishes">O que comeste?</label>
          <input id="rv-dishes" class="input" value="${escapeHtml(myPrev?.dishes || '')}" placeholder="Ex: Bife Ribeye, Ceviche, Massa Trufada, Tiramisu..." required />
        </div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label" for="rv-food">Comida</label><select id="rv-food" class="select">${opts(a.food)}</select></div>
          <div><label class="field-label" for="rv-vibe">Ambiente</label><select id="rv-vibe" class="select">${opts(a.vibe)}</select></div>
          <div><label class="field-label" for="rv-serv">Serviço</label><select id="rv-serv" class="select">${opts(a.service)}</select></div>
          <div><label class="field-label" for="rv-qual">Qualidade / Pratos</label><select id="rv-qual" class="select">${opts(a.quality)}</select></div>
        </div>
        <div>
          <label class="field-label" for="rv-note">Comentário / Dica (opcional)</label>
          <input id="rv-note" class="input" value="${escapeHtml(myPrev?.comment || '')}" placeholder="Ex: Pedir mesa lá fora, sobremesa incrível..." />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
          <button type="submit" class="btn btn-primary">${myPrev ? 'Guardar Alterações' : '+ Guardar Review'}</button>
        </div>
      </form>
    `);

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
        id: myPrev?.id || `vrev-${Date.now()}`,
        userId: me.userId,
        by: me.by,
        dishes,
        rating: avg,
        aspects: { food, vibe, service, quality },
        comment,
        createdAt: new Date().toISOString()
      };

      const idx = v.reviews.findIndex((r) => r.userId === me.userId || r.by.toLowerCase() === me.by.toLowerCase());
      if (idx >= 0) v.reviews[idx] = revPayload;
      else v.reviews.push(revPayload);

      v.visited = true;
      saveState();
      renderResortVenues();
      closeModal();
      showToast(`${v.name} avaliado (${avg.toFixed(1)}★)!`);
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
        <div><label class="field-label" for="nr-cuisine">Tipo / Cozinha</label><input id="nr-cuisine" class="input" placeholder="Ex: Italiano, Marisco, Steakhouse..." /></div>
        <div class="form-grid form-grid-2">
          <div><label class="field-label" for="nr-photo">Foto do Restaurante (opcional)</label><input type="file" id="nr-photo" accept="image/*" class="input" /></div>
          <div><label class="field-label" for="nr-menu">Foto do Menu (opcional)</label><input type="file" id="nr-menu" accept="image/*" class="input" /></div>
        </div>
        <div><label class="field-label" for="nr-desc">Notas (opcional)</label><input id="nr-desc" class="input" placeholder="Ex: Pede reserva, dress code..." /></div>
        <div style="display:flex;justify-content:flex-end;margin-top:4px;"><button type="submit" class="btn btn-primary">+ Criar Restaurante</button></div>
      </form>
    `);

    document.getElementById('f-add-rest').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('nr-name').value.trim();
      const category = document.getElementById('nr-cat').value;
      const cuisine = document.getElementById('nr-cuisine').value.trim() || 'Restaurante';
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
        reservationRequired: false,
        dressCode: '',
        hoursLabel: '',
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
    const me = getCurrentReviewer();
    const myReview = revs.find((r) => r.userId === me.userId || r.by.toLowerCase() === me.by.toLowerCase());

    const reviewsHtml = revs.length
      ? revs
          .map((r) => {
            const rAvg = getVenueReviewAvg(r).toFixed(1);
            const a = r.aspects;
            return `
              <div class="ck-review-row">
                <div class="ck-review-row-top">
                  <span class="ck-review-author">${escapeHtml(r.by)}</span>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="ck-review-score">★ ${rAvg}</span>
                    <button type="button" class="icon-btn" style="padding:2px 5px;font-size:0.75rem;" data-del-v-rev="${escapeHtml(r.id)}" title="Apagar esta review">✕</button>
                  </div>
                </div>
                ${r.dishes ? `<div class="rest-dishes-line">🍽️ <strong>Comeu:</strong> ${escapeHtml(r.dishes)}</div>` : ''}
                ${a ? `
                  <div class="ck-review-mini-metrics" style="margin-top:2px;">
                    <span>Comida ${a.food}★</span>
                    <span>Ambiente ${a.vibe}★</span>
                    <span>Serviço ${a.service}★</span>
                    <span>Qualidade ${a.quality}★</span>
                  </div>` : ''}
                ${r.comment ? `<p class="ck-postcard-quote">"${escapeHtml(r.comment)}"</p>` : ''}
              </div>`;
          })
          .join('')
      : `<p style="font-size:0.88rem;color:var(--ink-secondary);padding:8px 0;">Ainda sem reviews. Sejam os primeiros a dizer o que comeram e a dar a nota!</p>`;

    detailEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
        <button type="button" class="btn btn-sm" id="btn-back-restaurants">← Voltar aos Restaurantes</button>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-sm" id="btn-detail-sched">+ Agendar no Plano</button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-detail-review">${myReview ? '✎ Editar a minha Review' : '+ Adicionar Review'}</button>
        </div>
      </div>

      <div class="surface" style="margin-bottom:18px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
          <div>
            <h2 class="section-title">${escapeHtml(v.name)}</h2>
            <div class="ck-postcard-bar" style="font-size:0.88rem;">${escapeHtml(v.cuisine)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${avg > 0 ? `<span class="tag tag-cenote mono" style="font-size:0.88rem;">★ ${avg.toFixed(1)} / 5</span>` : `<span class="tag">Por avaliar</span>`}
            <span class="tag">${revs.length} ${revs.length === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>
        ${v.description ? `<p style="font-size:0.86rem;color:var(--ink-secondary);margin-top:10px;">${escapeHtml(v.description)}</p>` : ''}
      </div>

      <div class="rest-detail-photos">
        <div class="rest-photo-card">
          <div class="rest-photo-stage">
            ${v.photoUrl
              ? `<img src="${escapeHtml(v.photoUrl)}" alt="Foto de ${escapeHtml(v.name)}" id="img-rest-photo" />`
              : `<span style="font-size:2.4rem;">🍽️</span><span>Sem foto do restaurante</span>`}
          </div>
          <div class="rest-photo-bar">
            <strong style="font-size:0.84rem;">Foto do Restaurante</strong>
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
              : `<span style="font-size:2.4rem;">📄</span><span>Sem foto do menu</span>`}
          </div>
          <div class="rest-photo-bar">
            <strong style="font-size:0.84rem;">Foto do Menu</strong>
            <label class="btn btn-sm" style="cursor:pointer;">
              📄 ${v.menuPhotoUrl ? 'Alterar' : 'Adicionar'}
              <input type="file" id="inp-rest-menu" accept="image/*" style="display:none;" />
            </label>
          </div>
        </div>
      </div>

      <div class="surface">
        <div class="section-header" style="margin-bottom:10px;">
          <div>
            <h3 style="font-size:1.1rem;">Reviews &amp; O Que Comeram</h3>
            <p class="section-subtitle">Cada pessoa pode registar os pratos que provou e a sua nota</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btn-detail-review-2">${myReview ? '✎ Editar a minha' : '+ Adicionar Review'}</button>
        </div>
        <div class="ck-reviews-list">${reviewsHtml}</div>
      </div>
    `;

    document.getElementById('btn-back-restaurants')?.addEventListener('click', () => {
      activeRestaurantId = null;
      renderResortVenues();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.getElementById('btn-detail-sched')?.addEventListener('click', () => openSchedModal(v.id));
    document.getElementById('btn-detail-review')?.addEventListener('click', () => openRateVenueModal(v.id));
    document.getElementById('btn-detail-review-2')?.addEventListener('click', () => openRateVenueModal(v.id));

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

    if (activeRestaurantId) {
      listView.style.display = 'none';
      detailView.style.display = 'block';
      renderRestaurantDetail(activeRestaurantId);
      return;
    }

    listView.style.display = 'block';
    detailView.style.display = 'none';

    const restaurantsOnly = state.venues.filter((v) => v.category !== 'bars');
    const totalReviews = restaurantsOnly.reduce((s, v) => s + (Array.isArray(v.reviews) ? v.reviews.length : 0), 0);
    const badge = document.getElementById('restaurants-count-badge');
    if (badge) {
      badge.textContent = `${restaurantsOnly.length} restaurante${restaurantsOnly.length === 1 ? '' : 's'} · ${totalReviews} review${totalReviews === 1 ? '' : 's'}`;
    }

    let list = restaurantsOnly.filter((v) => {
      if (activeVenueCategory === 'all') return true;
      if (activeVenueCategory === 'ranking') return getVenueAvg(v) > 0;
      return v.category === activeVenueCategory;
    });

    // Always sort by ranking (highest rated first, unrated after)
    list = [...list].sort((a, b) => getVenueAvg(b) - getVenueAvg(a));

    const grid = document.getElementById('venue-cards-grid');
    if (!list.length) {
      grid.innerHTML = `<div class="surface" style="grid-column: 1 / -1; text-align: center; padding: 36px 20px;">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🍽️</div>
        <p style="font-size: 0.92rem; color: var(--ink-secondary);">${
          activeVenueCategory === 'ranking'
            ? 'Ainda nenhum restaurante avaliado. Toque num restaurante para abrir a página e registar o que comeram!'
            : 'Sem restaurantes nesta categoria. Carregue em + Adicionar Restaurante no canto inferior direito.'
        }</p>
      </div>`;
      return;
    }

    const medals = ['🥇 #1', '🥈 #2', '🥉 #3'];
    const medalClasses = ['is-gold', 'is-silver', 'is-bronze'];
    let ratedRank = 0;

    grid.innerHTML = list
      .map((v) => {
        const avg = getVenueAvg(v);
        const revs = Array.isArray(v.reviews) ? v.reviews : [];
        let rankBadge = '';
        if (avg > 0) {
          const rankText = medals[ratedRank] || `#${ratedRank + 1}`;
          const rankCls = medalClasses[ratedRank] || '';
          rankBadge = `<span class="ck-rank-badge ${rankCls}">${rankText}</span>`;
          ratedRank++;
        }

        const recentDishes = revs.map((r) => r.dishes).filter(Boolean).slice(0, 2);

        return `
          <article class="cocktail-postcard is-clickable" data-open-rest="${escapeHtml(v.id)}">
            <div class="ck-postcard-media">
              ${v.photoUrl
                ? `<img src="${escapeHtml(v.photoUrl)}" alt="${escapeHtml(v.name)}" loading="lazy" />`
                : `<span class="ck-postcard-placeholder" aria-hidden="true">🍽️</span>`}
              ${rankBadge}
            </div>
            <div class="ck-postcard-body">
              <div>
                <div class="ck-postcard-head">
                  <div style="min-width:0;">
                    <h3 class="ck-postcard-title">${escapeHtml(v.name)}</h3>
                    <div class="ck-postcard-bar">${escapeHtml(v.cuisine)}</div>
                  </div>
                  ${avg > 0
                    ? `<span class="tag tag-cenote mono">★ ${avg.toFixed(1)}</span>`
                    : `<span class="tag">Por avaliar</span>`}
                </div>
                ${recentDishes.length
                  ? `<div class="rest-dishes-line" style="margin-top:8px;">🍽️ ${escapeHtml(recentDishes.join(' · '))}</div>`
                  : (v.description ? `<p class="ck-postcard-quote" style="margin-top:8px;font-style:normal;">${escapeHtml(v.description)}</p>` : '')}
              </div>
              <div class="ck-postcard-footer">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span>${revs.length} ${revs.length === 1 ? 'review' : 'reviews'}</span>
                  ${v.menuPhotoUrl ? `<span class="tag tag-open" style="padding:1px 7px;font-size:0.7rem;">📄 Menu</span>` : ''}
                </div>
                <span style="font-weight:700;color:var(--cenote-700);">Abrir página →</span>
              </div>
            </div>
          </article>`;
      })
      .join('');

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

    // 1. General trip form
    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
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

    // 4. Custom / manageable venues list
    const venuesListEl = document.getElementById('settings-custom-venues-list');
    if (venuesListEl) {
      const customVenues = state.venues.filter((v) => v.custom);
      venuesListEl.innerHTML = customVenues.length
        ? `<div style="font-size:0.75rem;font-weight:700;color:var(--ink-muted);margin-top:4px;">Locais adicionados (${customVenues.length})</div>` +
          customVenues
            .map((v) => `
              <div class="open-venue-row">
                <div><strong>${escapeHtml(v.name)}</strong> <span style="font-size:0.76rem;color:var(--ink-secondary);">· ${escapeHtml(v.cuisine)}</span></div>
                <button type="button" class="icon-btn" data-del-venue="${escapeHtml(v.id)}" title="Remover">✕</button>
              </div>`)
            .join('')
        : '';
      venuesListEl.querySelectorAll('[data-del-venue]').forEach((b) =>
        b.addEventListener('click', () => {
          state.venues = state.venues.filter((v) => v.id !== b.getAttribute('data-del-venue'));
          saveState(); renderAll(); showToast('Local removido');
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

  function renderExpenses() {
    const listEl = document.getElementById('expenses-list');
    const totEl = document.getElementById('expenses-total-eur');
    const eurToDest = Number(state.rates.eurToDest) || 1;
    const toEur = (a, c) => (c === 'EUR' ? a : c === 'USD' ? a / (state.rates.eurToUsd || 1.06) : a / eurToDest);
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
    if (l.value.trim() && a.value) {
      state.expenses.push({ id: `e-${Date.now()}`, label: l.value.trim(), amount: parseFloat(a.value), currency: c.value });
      l.value = ''; a.value = '';
      saveState(); renderExpenses();
    }
  });

  /* ========================================================================
     Cocktails Rating (Privado) — 1 Card per Cocktail, Multiple Reviews, Auto User
     ======================================================================== */
  function getCurrentReviewer() {
    if (sbUser) {
      const metaName = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name;
      const emailPrefix = sbUser.email ? sbUser.email.split('@')[0].replace(/[._-]+/g, ' ') : '';
      const displayName = metaName || (emailPrefix ? emailPrefix.split(' ').map(capitalize).join(' ') : 'Utilizador');
      return { userId: sbUser.id || sbUser.email || displayName.toLowerCase(), by: displayName };
    }
    return { userId: 'local', by: 'Viajante' };
  }

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

  function renderCocktails() {
    const grid = document.getElementById('cocktails-list-grid');
    const badge = document.getElementById('cocktails-count-badge');
    if (!grid) return;

    const list = (Array.isArray(state.cocktails) ? state.cocktails : []).filter((c) => Array.isArray(c.reviews) && c.reviews.length > 0);
    const totalReviews = list.reduce((s, c) => s + c.reviews.length, 0);
    if (badge) {
      badge.textContent = `${list.length} cocktail${list.length === 1 ? '' : 's'} · ${totalReviews} review${totalReviews === 1 ? '' : 's'}`;
    }

    const sorted = [...list].sort((a, b) => getCocktailAvg(b) - getCocktailAvg(a));

    if (!sorted.length) {
      grid.innerHTML = `<div class="surface" style="grid-column: 1 / -1; text-align: center; padding: 36px 20px;">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🍹</div>
        <p style="font-size: 0.94rem; color: var(--ink-secondary);">Ainda nenhum cocktail no ranking.<br/>Carregue no botão <strong>+ Adicionar Cocktail</strong> no canto inferior direito para começar!</p>
      </div>`;
      return;
    }

    const me = getCurrentReviewer();
    const medals = ['🥇 #1', '🥈 #2', '🥉 #3'];
    const medalClasses = ['is-gold', 'is-silver', 'is-bronze'];

    grid.innerHTML = sorted
      .map((c, idx) => {
        const avg = getCocktailAvg(c).toFixed(1);
        const rankText = medals[idx] || `#${idx + 1}`;
        const rankCls = medalClasses[idx] || '';
        const uniqueBars = [...new Set(c.reviews.map((r) => r.bar || c.bar).filter(Boolean))];
        const barsSubtitle = uniqueBars.join(' · ');

        const reviewsHtml = c.reviews
          .map((r) => {
            const rAvg = getReviewAvg(r).toFixed(1);
            const a = r.aspects;
            const revBar = r.bar || c.bar || '';
            return `
              <div class="ck-review-row">
                <div class="ck-review-row-top">
                  <div>
                    <span class="ck-review-author">${escapeHtml(r.by)}</span>
                    ${revBar ? `<span style="font-size:0.74rem;color:var(--cenote-700);font-weight:600;margin-left:6px;">· ${escapeHtml(revBar)}</span>` : ''}
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="ck-review-score">★ ${rAvg}</span>
                    <button type="button" class="icon-btn" style="padding:2px 5px;font-size:0.75rem;" data-del-ck-rev="${escapeHtml(c.id)}::${escapeHtml(r.id)}" title="Apagar esta review">✕</button>
                  </div>
                </div>
                ${a ? `
                  <div class="ck-review-mini-metrics">
                    <span>Sabor ${a.flavor}★</span>
                    <span>Frescura ${a.fresh}★</span>
                    <span>Álcool ${a.strength}★</span>
                    <span>Visual ${a.look}★</span>
                  </div>` : ''}
                ${r.note ? `<p class="ck-postcard-quote">"${escapeHtml(r.note)}"</p>` : ''}
              </div>`;
          })
          .join('');

        return `
          <article class="cocktail-postcard">
            <div class="ck-postcard-media">
              ${c.photoUrl
                ? `<img src="${escapeHtml(c.photoUrl)}" alt="${escapeHtml(c.name)}" loading="lazy" />`
                : `<span class="ck-postcard-placeholder" aria-hidden="true">🍹</span>`}
              <span class="ck-rank-badge ${rankCls}">${rankText}</span>
            </div>
            <div class="ck-postcard-body">
              <div>
                <div class="ck-postcard-head">
                  <div style="min-width:0;">
                    <h3 class="ck-postcard-title">${escapeHtml(c.name)}</h3>
                    ${barsSubtitle ? `<div class="ck-postcard-bar">${escapeHtml(barsSubtitle)}</div>` : ''}
                  </div>
                  <span class="tag tag-cenote mono">★ ${avg}</span>
                </div>
                <div class="ck-reviews-list">${reviewsHtml}</div>
              </div>
              <div class="ck-postcard-footer">
                <span>${c.reviews.length} ${c.reviews.length === 1 ? 'review' : 'reviews'}</span>
                <button type="button" class="btn btn-sm" data-review-ck="${escapeHtml(c.id)}">+ Adicionar Review</button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-review-ck]').forEach((b) =>
      b.addEventListener('click', () => openCocktailReviewModal(b.getAttribute('data-review-ck')))
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

  function openCocktailReviewModal(existingCocktailId = null) {
    const existing = existingCocktailId ? (state.cocktails || []).find((c) => c.id === existingCocktailId) : null;
    const me = getCurrentReviewer();

    const bars = state.venues.filter((v) => v.category === 'bars');
    const others = state.venues.filter((v) => v.category !== 'bars');
    const barOpts = [
      ...bars.map((v) => `<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)}</option>`),
      ...others.map((v) => `<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)}</option>`),
      '<option value="Outro Bar / Local">Outro Bar / Local</option>'
    ].join('');

    const starOpts = (selVal) =>
      [5, 4, 3, 2, 1]
        .map((n) => `<option value="${n}" ${Number(selVal) === n ? 'selected' : ''}>${'★'.repeat(n)}${'☆'.repeat(5 - n)} (${n})</option>`)
        .join('');

    const showPhotoField = !existing || !existing.photoUrl;
    const modalTitle = existing ? `Avaliar ${existing.name}` : 'Adicionar Cocktail ao Ranking';

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
              <div style="font-size:0.78rem;color:var(--ink-muted);font-weight:600;">Cocktail</div>
              <div style="font-size:1rem;font-weight:700;">${escapeHtml(existing.name)}</div>
            </div>
            <div>
              <label class="field-label" for="ck-bar">Local / Bar onde bebeu</label>
              <select id="ck-bar" class="select">${barOpts}</select>
            </div>
          </div>
        `}
        <div class="form-grid form-grid-2">
          <div><label class="field-label" for="ck-flavor">Sabor &amp; Equilíbrio</label><select id="ck-flavor" class="select">${starOpts(4)}</select></div>
          <div><label class="field-label" for="ck-fresh">Frescura / Temperatura</label><select id="ck-fresh" class="select">${starOpts(4)}</select></div>
          <div><label class="field-label" for="ck-strength">Força / Álcool</label><select id="ck-strength" class="select">${starOpts(4)}</select></div>
          <div><label class="field-label" for="ck-look">Apresentação</label><select id="ck-look" class="select">${starOpts(4)}</select></div>
        </div>
        ${showPhotoField ? `
          <div>
            <label class="field-label" for="ck-photo">Foto do Cocktail (opcional)</label>
            <input type="file" id="ck-photo" accept="image/*" class="input" />
          </div>
        ` : ''}
        <div>
          <label class="field-label" for="ck-note">Notas / Review</label>
          <input type="text" id="ck-note" class="input" placeholder="Ex: Pedir sem sal, bem fresco, muito doce..." />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;">
          <button type="submit" class="btn btn-primary" id="btn-submit-cocktail">+ Guardar Review</button>
        </div>
      </form>
    `);

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

      if (photoFile && !target.photoUrl && sbClient && sbUser) {
        showToast('A carregar foto do cocktail...');
        const ext = (photoFile.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `cocktails/${Date.now()}.${ext}`;
        const { error: upErr } = await sbClient.storage.from('trip-photos').upload(path, photoFile, { upsert: false });
        if (!upErr) {
          const { data: pub } = sbClient.storage.from('trip-photos').getPublicUrl(path);
          target.photoUrl = pub?.publicUrl || '';
        }
      }

      const existingRevIdx = target.reviews.findIndex(
        (r) => (r.userId === me.userId || r.by.toLowerCase() === me.by.toLowerCase()) &&
               String(r.bar || target.bar || '').toLowerCase() === String(bar || '').toLowerCase()
      );
      const revPayload = {
        id: existingRevIdx >= 0 ? target.reviews[existingRevIdx].id : `rev-${Date.now()}`,
        userId: me.userId,
        by: me.by,
        bar,
        rating: avg,
        aspects: { flavor, fresh, strength, look },
        note,
        createdAt: new Date().toISOString()
      };

      if (existingRevIdx >= 0) {
        target.reviews[existingRevIdx] = revPayload;
      } else {
        target.reviews.push(revPayload);
      }

      saveState();
      renderCocktails();
      closeModal();
      showToast(`${target.name} (${bar}) avaliado — ${avg.toFixed(1)}★!`);
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
    if (authBtn) {
      authBtn.textContent = isLoggedIn ? 'Sair' : 'Entrar (Privado)';
      authBtn.className = isLoggedIn ? 'btn btn-sm' : 'btn btn-primary btn-sm';
    }

    if (!isLoggedIn && !PUBLIC_VIEWS.has(activeView)) {
      switchView('flights');
    }
    renderTripChrome();
    if (modeChanged) renderFlights();
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
  document.getElementById('btn-footer-login')?.addEventListener('click', openLoginModal);

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

  async function loadPhotosGallery() {
    const grid = document.getElementById('photos-gallery-grid');
    if (!grid || !sbClient) return;
    grid.innerHTML = `<p class="photo-empty">A carregar as fotografias…</p>`;

    const { data: rows, error } = await sbClient
      .from('trip_photos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !rows || !rows.length) {
      galleryPhotos = [];
      grid.innerHTML = `<div class="photo-empty-card"><span aria-hidden="true">📷</span><p>Ainda não há fotografias.<br/>Assim que forem publicadas, aparecem aqui.</p></div>`;
      return;
    }

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
        return `
          <figure class="photo-item">
            <button type="button" class="photo-open" data-photo-index="${idx}" aria-label="Ver fotografia em grande${row.caption ? `: ${escapeHtml(row.caption)}` : ''}">
              <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(row.caption || `Fotografia do dia ${day}`)}" loading="lazy" />
            </button>
            ${row.caption || sbUser ? `<figcaption class="photo-caption">
              <span>${escapeHtml(row.caption || '')}</span>
              ${sbUser ? `<button type="button" class="icon-btn" data-del-photo="${escapeHtml(row.id)}" data-del-path="${escapeHtml(row.storage_path)}" data-del-url="${escapeHtml(imgUrl)}" data-del-caption="${escapeHtml(row.caption || `Dia ${day}`)}" title="Apagar foto">✕</button>` : ''}
            </figcaption>` : ''}
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
})();
