const ADMIN_SECRET_KEY = 'gmr2026';
const STORAGE_KEY = 'blanco_gmr_goliath_fh6_v7';
const GOLIATH_MAP_SRC = './assets/goliath-map.jpg';

let entries = loadInitialData();
let currentStatusFilter = 'all';

function loadInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('No se pudo leer localStorage, usando datos base.', e);
  }
  return JSON.parse(JSON.stringify(GOLIATH_DATA));
}

function parseTimeToMs(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim();
  const parts = clean.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10);
    const secs = parseFloat(parts[1]);
    if (isNaN(mins) || isNaN(secs)) return null;
    return Math.round((mins * 60 + secs) * 1000);
  } else if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    const secs = parseFloat(parts[2]);
    if (isNaN(hours) || isNaN(mins) || isNaN(secs)) return null;
    return Math.round((hours * 3600 + mins * 60 + secs) * 1000);
  }
  return null;
}

function formatMsToTime(ms, includePlus = false) {
  if (ms === null || isNaN(ms)) return '—';
  const prefix = includePlus ? '+' : '';
  const totalSeconds = Math.floor(ms / 1000);
  const millis = Math.floor(ms % 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad2 = (n) => String(n).padStart(2, '0');
  const pad3 = (n) => String(n).padStart(3, '0');

  if (hours > 0) {
    return `${prefix}${hours}:${pad2(minutes)}:${pad2(seconds)}.${pad3(millis)}`;
  }
  return `${prefix}${pad2(minutes)}:${pad2(seconds)}.${pad3(millis)}`;
}

function getPilotBadgeStyle(pilot) {
  const p = (pilot || '').toLowerCase();
  if (p.includes('iván') || p.includes('ivan')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (p.includes('santi')) return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  if (p.includes('blanco')) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  if (p.includes('jaison')) return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  if (p.includes('helbert')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (p.includes('kate')) return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
  return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
}

function getSortedEntries() {
  return [...entries]
    .map(item => ({
      ...item,
      ms: parseTimeToMs(item.time)
    }))
    .sort((a, b) => {
      if (a.ms !== null && b.ms !== null) return a.ms - b.ms;
      if (a.ms !== null) return -1;
      if (b.ms !== null) return 1;
      return a.id - b.id;
    });
}

function updateKPIs(sorted) {
  const completed = sorted.filter(item => item.ms !== null);
  const totalCars = sorted.length;

  if (completed.length > 0) {
    const best = completed[0];
    const worst = completed[completed.length - 1];

    document.getElementById('kpi-best-time').textContent = best.time;
    document.getElementById('kpi-best-car').textContent = `${best.car} (${best.pilot})`;

    document.getElementById('kpi-worst-time').textContent = worst.time;
    document.getElementById('kpi-worst-car').textContent = `${worst.car} (${worst.pilot})`;
  } else {
    document.getElementById('kpi-best-time').textContent = '--:--.---';
    document.getElementById('kpi-best-car').textContent = 'Sin registros';

    document.getElementById('kpi-worst-time').textContent = '--:--.---';
    document.getElementById('kpi-worst-car').textContent = 'Sin registros';
  }

  document.getElementById('kpi-total-cars').textContent = String(totalCars);
  document.getElementById('kpi-total-cars-sub').textContent =
    `${completed.length} con tiempo • ${totalCars - completed.length} pendientes`;
}

function renderTable() {
  const sorted = getSortedEntries();
  updateKPIs(sorted);

  const leaderMs = sorted.length > 0 && sorted[0].ms !== null ? sorted[0].ms : null;
  const searchQuery = (document.getElementById('search-input').value || '').toLowerCase().trim();

  let rankCounter = 0;
  const ranked = sorted.map(item => {
    if (item.ms !== null) {
      rankCounter += 1;
      return { ...item, rank: rankCounter };
    }
    return { ...item, rank: null };
  });

  const filtered = ranked.filter(item => {
    if (currentStatusFilter === 'completed' && item.ms === null) return false;
    if (currentStatusFilter === 'pending' && item.ms !== null) return false;

    if (searchQuery) {
      const haystack = `${item.pilot} ${item.car}`.toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }
    return true;
  });

  const tbody = document.getElementById('leaderboard-body');
  const emptyState = document.getElementById('empty-state');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  tbody.innerHTML = filtered.map(item => {
    const isCompleted = item.ms !== null;

    let posHtml = `<span class="text-slate-600 font-mono text-xs">—</span>`;
    let rowHighlight = 'hover:bg-white/[0.03]';
    if (item.rank === 1) {
      posHtml = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-xs shadow-sm">1º</span>`;
      rowHighlight = 'bg-amber-500/[0.04] hover:bg-amber-500/[0.07]';
    } else if (item.rank === 2) {
      posHtml = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-300/20 border border-slate-300/40 text-slate-200 font-black text-xs">2º</span>`;
    } else if (item.rank === 3) {
      posHtml = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-orange-600/20 border border-orange-500/40 text-orange-300 font-black text-xs">3º</span>`;
    } else if (item.rank !== null) {
      posHtml = `<span class="text-slate-300 font-mono font-bold text-xs">${item.rank}º</span>`;
    }

    const timeHtml = isCompleted
      ? `<span class="tabular-telemetry font-bold text-sm sm:text-base ${item.rank === 1 ? 'text-forza-gold' : 'text-white'}">${escapeHtml(item.time)}</span>`
      : `<span class="text-xs font-medium text-slate-500 italic">Pendiente</span>`;

    let diffHtml = `<span class="text-slate-600 font-mono text-xs">—</span>`;
    if (isCompleted && leaderMs !== null) {
      if (item.rank === 1) {
        diffHtml = `<span class="px-2 py-0.5 rounded bg-forza-gold/15 text-forza-gold font-mono text-[11px] font-bold">LÍDER</span>`;
      } else {
        const diffMs = item.ms - leaderMs;
        diffHtml = `<span class="tabular-telemetry text-xs font-semibold text-rose-400">${formatMsToTime(diffMs, true)}</span>`;
      }
    }

    let streamHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[11px] font-semibold">⏳ Pendiente</span>`;
    if (item.streamResult === 'win') {
      streamHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold">✅ 1.º Victoria</span>`;
    } else if (item.streamResult === 'loss') {
      const posLabel = item.finishPos ? `${item.finishPos}.º` : 'Sin puesto';
      streamHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-300 text-[11px] font-bold">❌ ${escapeHtml(posLabel)}</span>`;
    }

    const videoHtml = item.videoUrl
      ? `<a href="${escapeHtml(item.videoUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-forza-crimson/20 hover:bg-forza-crimson text-rose-200 hover:text-white border border-forza-crimson/40 text-xs font-bold transition" title="Ver episodio en YouTube">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <span>Ver</span>
        </a>`
      : `<span class="text-slate-600 text-xs">—</span>`;

    return `
      <tr class="${rowHighlight} transition-colors">
        <td class="py-3.5 px-4 text-center whitespace-nowrap">${posHtml}</td>
        <td class="py-3.5 px-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-bold ${getPilotBadgeStyle(item.pilot)}">
            ${escapeHtml(item.pilot)}
          </span>
        </td>
        <td class="py-3.5 px-4 font-bold text-slate-100 whitespace-nowrap">${escapeHtml(item.car)}</td>
        <td class="py-3.5 px-4 text-right whitespace-nowrap">${timeHtml}</td>
        <td class="py-3.5 px-4 text-right whitespace-nowrap">${diffHtml}</td>
        <td class="py-3.5 px-4 text-center whitespace-nowrap">${streamHtml}</td>
        <td class="py-3.5 px-4 text-center whitespace-nowrap">${videoHtml}</td>
      </tr>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setStatusFilter(status) {
  currentStatusFilter = status;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-white/10', 'text-white');
    btn.classList.add('text-slate-400');
  });
  const activeBtn = document.getElementById(`filter-${status}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-white/10', 'text-white');
    activeBtn.classList.remove('text-slate-400');
  }
  renderTable();
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  setStatusFilter('all');
}

function toggleFinishPosInput() {
  const streamVal = document.getElementById('admin-stream').value;
  const wrapper = document.getElementById('admin-pos-wrapper');
  if (streamVal === 'loss') {
    wrapper.classList.remove('hidden');
  } else {
    wrapper.classList.add('hidden');
  }
}

function openAdminModal() {
  populateAdminSelect();
  updateJsonExportBox();
  document.getElementById('admin-modal').classList.remove('hidden');
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.add('hidden');
}

function populateAdminSelect() {
  const select = document.getElementById('admin-select-car');
  const currentVal = select.value;
  select.innerHTML = `<option value="__NEW__">+ Añadir nuevo vehículo a la lista...</option>`;
  entries.forEach(item => {
    const statusTag = item.time ? `[${item.time}]` : '[Pendiente]';
    const opt = document.createElement('option');
    opt.value = String(item.id);
    opt.textContent = `${item.pilot} — ${item.car} ${statusTag}`;
    select.appendChild(opt);
  });
  if ([...select.options].some(o => o.value === currentVal)) {
    select.value = currentVal;
  }
  loadCarIntoForm();
}

function loadCarIntoForm() {
  const val = document.getElementById('admin-select-car').value;
  if (val === '__NEW__') {
    document.getElementById('admin-pilot').value = '';
    document.getElementById('admin-car').value = '';
    document.getElementById('admin-time').value = '';
    document.getElementById('admin-stream').value = 'pending';
    document.getElementById('admin-finish-pos').value = '2';
    document.getElementById('admin-video').value = '';
    toggleFinishPosInput();
    return;
  }
  const item = entries.find(e => String(e.id) === val);
  if (item) {
    document.getElementById('admin-pilot').value = item.pilot || '';
    document.getElementById('admin-car').value = item.car || '';
    document.getElementById('admin-time').value = item.time || '';
    document.getElementById('admin-stream').value = item.streamResult || 'pending';
    document.getElementById('admin-finish-pos').value = item.finishPos ? String(item.finishPos) : '2';
    document.getElementById('admin-video').value = item.videoUrl || '';
    toggleFinishPosInput();
  }
}

function saveAdminEntry() {
  const val = document.getElementById('admin-select-car').value;
  const pilot = document.getElementById('admin-pilot').value.trim();
  const car = document.getElementById('admin-car').value.trim();
  const rawTime = document.getElementById('admin-time').value.trim();
  const streamResult = document.getElementById('admin-stream').value;
  const finishPos = streamResult === 'loss'
    ? parseInt(document.getElementById('admin-finish-pos').value, 10)
    : (streamResult === 'win' ? 1 : null);
  const videoUrl = document.getElementById('admin-video').value.trim();

  if (!pilot || !car) {
    showToast('Escribe al menos el piloto y el nombre del coche.', '⚠️');
    return;
  }

  if (rawTime && parseTimeToMs(rawTime) === null) {
    showToast('Formato de tiempo inválido. Usa MM:SS.mmm (ej. 24:10.500)', '⚠️');
    return;
  }

  const cleanTime = rawTime ? rawTime : null;

  if (val === '__NEW__') {
    const maxId = entries.reduce((max, item) => Math.max(max, item.id), 0);
    entries.push({
      id: maxId + 1,
      pilot,
      car,
      time: cleanTime,
      streamResult,
      finishPos,
      videoUrl
    });
  } else {
    const idx = entries.findIndex(e => String(e.id) === val);
    if (idx !== -1) {
      entries[idx] = {
        ...entries[idx],
        pilot,
        car,
        time: cleanTime,
        streamResult,
        finishPos,
        videoUrl
      };
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage.', e);
  }

  populateAdminSelect();
  updateJsonExportBox();
  renderTable();
  showToast('Tabla actualizada ✔', '🏁');
}

function resetLocalChanges() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  entries = JSON.parse(JSON.stringify(GOLIATH_DATA));
  populateAdminSelect();
  updateJsonExportBox();
  renderTable();
  showToast('Datos restaurados a data.js.', '🔄');
}

function updateJsonExportBox() {
  const formatted = `const GOLIATH_DATA = ${JSON.stringify(entries, null, 2)};`;
  document.getElementById('json-export-box').value = formatted;
}

function copyJsonToClipboard() {
  const box = document.getElementById('json-export-box');
  box.select();
  box.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(box.value).then(() => {
    showToast('Copiado. Pégalo en data.js en GitHub.', '📋');
  }).catch(() => {
    showToast('Selecciona el cuadro y pulsa Ctrl+C.', 'ℹ️');
  });
}

function showToast(message, icon = '✔') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = message;
  document.getElementById('toast-icon').textContent = icon;
  toast.classList.remove('translate-y-[-120%]', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-[-120%]', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3200);
}

function initTableScrollWrapper() {
  const tbody = document.getElementById('leaderboard-body');
  const table = tbody ? tbody.closest('table') : null;
  if (!table || !table.parentElement || table.parentElement.classList.contains('table-scroll-wrapper')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll-wrapper';
  table.parentNode.insertBefore(wrapper, table);
  wrapper.appendChild(table);
}

function injectGoliathMapCard(imageSrc = GOLIATH_MAP_SRC) {
  const container = document.getElementById('leaderboard-container');
  const targetParent = container ? container.parentElement : document.body;
  if (!targetParent || document.getElementById('goliath-map-card')) return;

  const card = document.createElement('section');
  card.id = 'goliath-map-card';
  card.className = 'circuit-map-card hide-in-obs';
  card.innerHTML = `
    <img src="${escapeHtml(imageSrc)}" alt="Mapa del circuito The Goliath - 85.4 km" loading="lazy" />
    <div class="circuit-map-info">
      <h3>Circuito Oficial: The Goliath (85.4 km)</h3>
      <p>
        Vuelta completa al perímetro del mapa. Tramos de máxima velocidad punta combinados con zonas técnicas donde la estabilidad y la gestión de rebobinados (máx. 3) marcan la diferencia.
      </p>
    </div>
  `;

  if (container) {
    targetParent.insertBefore(card, container);
  } else {
    targetParent.prepend(card);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initTableScrollWrapper();
  injectGoliathMapCard();

  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === ADMIN_SECRET_KEY) {
    openAdminModal();
  }
  renderTable();
});
