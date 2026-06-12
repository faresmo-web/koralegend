// ============================================================
//  KoraLegend — Live Matches Client
//  Fetches data from /api/matches every 30s (live) or 60s
//  Falls back to static matchesDatabase if server is offline
// ============================================================

let selectedLeague = 'all';
let selectedDate   = 'today';   // 'YYYY-MM-DD' or 'today'
let selectedStatus = 'all';     // 'all' | 'live'
let refreshTimer   = null;
let lastMatches    = [];
let isServerOnline = false;
let liveClockTimer = null;
let liveClockBaseTime = {};  // matchId -> { minute, second, timestamp }



// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    // Update copyright year dynamically
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('[data-en], [data-ar]').forEach(element => {
        const enText = element.getAttribute('data-en');
        const arText = element.getAttribute('data-ar');
        
        if (enText && enText.includes('YEAR')) {
            element.setAttribute('data-en', enText.replace(/YEAR/g, currentYear));
        }
        if (arText && arText.includes('YEAR')) {
            element.setAttribute('data-ar', arText.replace(/YEAR/g, currentYear));
        }
    });
    



    // Status filter buttons
    document.querySelectorAll('.status-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.status-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedStatus = btn.dataset.status;
            renderMatches(lastMatches);
        });
    });

    // League filter
    const leagueFilter = document.getElementById('leagueFilter');
    if (leagueFilter) leagueFilter.addEventListener('change', e => {
        selectedLeague = e.target.value;
        renderMatches(lastMatches);
    });

    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const mainNav    = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        console.log('✅ Menu toggle initialized (live-matches)');
        menuToggle.addEventListener('click', e => {
            e.stopImmediatePropagation();
            e.preventDefault();
            console.log('🔄 Toggle clicked (live-matches)');
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            console.log('Active class:', menuToggle.classList.contains('active'));
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', e => {
            setTimeout(() => {
                if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                    menuToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                }
            }, 10);
        });
        
        // Close menu when clicking on a nav link
        const navLinks = mainNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    } else {
        console.warn('❌ Menu toggle or mainNav not found (live-matches)', { menuToggle, mainNav });
    }

    // Click handler for teams using capture phase to prevent match detail navigation
    const container = document.getElementById('matchesList');
    if (container) {
        container.addEventListener('click', function(e) {
            const teamEl = e.target.closest('.match-team[data-team-id]');
            if (teamEl) {
                const teamId = teamEl.getAttribute('data-team-id');
                const teamName = teamEl.getAttribute('data-team-name');
                if (teamId) {
                    e.stopPropagation();
                    e.preventDefault();
                    window.location.href = `team?id=${encodeURIComponent(teamId)}&name=${encodeURIComponent(teamName)}`;
                }
            }
        }, true);
    }

    loadLive();
});

// ── Main fetch ───────────────────────────────────────────────
async function loadLive(silent = false) {
    clearTimeout(refreshTimer);

    // Only show loading spinner on first load, not on background refresh
    if (!silent) {
        const container = document.getElementById('matchesList');
        if (container) container.innerHTML = '';
        showLoading();
    }

    const dateParam = 'today';

    try {
        const res  = await fetch(`/api/matches?date=${dateParam}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        isServerOnline = true;
        const newMatches = json.matches || [];

        updateIndicator(true, json.updatedAt);

        // Silent update: only re-render if data actually changed
        if (silent && JSON.stringify(newMatches) === JSON.stringify(lastMatches)) {
            // Nothing changed — skip render entirely
        } else {
            lastMatches = newMatches;
            renderMatches(lastMatches, silent);
        }

        if (typeof hidePageLoading === 'function') hidePageLoading();

        // Update live count badge
        const liveCount = lastMatches.filter(m => m.isLive).length;
        const liveBtn   = document.getElementById('liveFilterBtn');
        if (liveBtn) {
            liveBtn.innerHTML = liveCount > 0
                ? `مباشر <span class="live-count">${liveCount}</span>`
                : 'مباشر';
        }

        // Schedule next refresh silently
        const hasLive = lastMatches.some(m => m.isLive);
        // Refresh data every 10s for fast bot sync, else 60s
        refreshTimer = setTimeout(() => {
            loadLive(true);
        }, hasLive ? 10_000 : 60_000);

    } catch (e) {
        isServerOnline = false;
        updateIndicator(false);

        if (!silent) {
            if (typeof matchesDatabase !== 'undefined') {
                const todayStr    = toDateStr(new Date());
                const yesterday   = new Date(); yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = toDateStr(yesterday);
                const tomorrow    = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr  = toDateStr(tomorrow);

                let dateKey = 'today';
                if (selectedDate === 'yesterday' || selectedDate === yesterdayStr) dateKey = 'yesterday';
                else if (selectedDate === 'tomorrow' || selectedDate === tomorrowStr) dateKey = 'tomorrow';
                else if (selectedDate !== 'today' && selectedDate !== todayStr) dateKey = selectedDate;

                lastMatches = matchesDatabase[currentLang]?.[dateKey]
                           || matchesDatabase[currentLang]?.['today']
                           || [];
                renderMatches(lastMatches, false);
            } else {
                showError('تعذّر الاتصال بالسيرفر. شغّل: node server.js');
            }
        }

        refreshTimer = setTimeout(() => loadLive(true), 15_000);
    }
}

// ── Render ───────────────────────────────────────────────────
function renderMatches(matches, silent = false) {
    const container = document.getElementById('matchesList');
    if (!container) return;

    // Sort: live first, then upcoming, then finished
    const sorted = [...matches].sort((a, b) => {
        const rank = m => m.isLive ? 0 : (!m.isFinished ? 1 : 2);
        return rank(a) - rank(b);
    });

    // Filter by status
    let filtered = selectedStatus === 'live'
        ? sorted.filter(m => m.isLive)
        : sorted;

    // Filter by league
    if (selectedLeague !== 'all') {
        filtered = filtered.filter(m => matchesLeagueFilter(m.league, selectedLeague));
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:3rem;color:var(--text-secondary);">
                <p style="font-size:2rem;margin-bottom:1rem;">📅</p>
                <h3>${selectedStatus === 'live' ? 'لا توجد مباريات مباشرة الآن' : 'لا توجد مباريات'}</h3>
            </div>`;
        return;
    }

    // Group by league
    const groups = {};
    filtered.forEach(m => {
        if (!groups[m.league]) groups[m.league] = { name: m.league, logo: m.leagueLogo, leagueId: m.leagueId, leagueSlug: m.leagueSlug, matches: [], hasLive: false };
        groups[m.league].matches.push(m);
        if (m.isLive) groups[m.league].hasLive = true;
    });

    // Sort groups: leagues with live matches first
    const sortedGroups = Object.values(groups).sort((a, b) => {
        if (a.hasLive && !b.hasLive) return -1;
        if (!a.hasLive && b.hasLive) return 1;
        return 0;
    });

    // ── Silent patch: detect state changes and update ──────────
    if (silent && container.children.length > 0) {
        // Check if any match changed state (upcoming→live, live→finished)
        let needsFullRender = false;
        filtered.forEach(match => {
            const row = container.querySelector(`.match-row-item[data-id="${match.id}"]`);
            if (!row) { needsFullRender = true; return; }

            // Check if state changed by comparing data attributes
            const oldStatus = row.dataset.statusStr || '';
            const newStatus = `${match.isLive ? 'L' : match.isFinished ? 'F' : 'U'}_${match.homeScore}_${match.awayScore}_${match.statusAr || ''}`;
            if (oldStatus !== newStatus) {
                // State changed — rebuild this row entirely
                const newRow = document.createElement('div');
                newRow.innerHTML = matchRowHtml(match);
                const newRowEl = newRow.firstElementChild;
                if (newRowEl) {
                    newRowEl.dataset.statusStr = newStatus;
                    newRowEl.addEventListener('click', () => {
                        window.location.href = `match-details?id=${match.id}`;
                    });
                    row.replaceWith(newRowEl);
                }
            }
        });

        if (needsFullRender) {
            // New matches appeared or disappeared — do full render
            renderMatches(filtered, false);
        }
        return; // Done — no full re-render
    }

    // ── Full render with Lazy Loading (Intersection Observer) ──
    // Build using DocumentFragment for minimal reflow
    const fragment = document.createDocumentFragment();

    // Intersection Observer to lazy-load off-screen league groups
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const idx = parseInt(el.dataset.groupIdx, 10);
            if (el.dataset.loaded === '1') return;
            el.dataset.loaded = '1';
            observer.unobserve(el);
            // Inject full match rows
            const listEl = el.querySelector('.league-matches-list');
            if (listEl && sortedGroups[idx]) {
                listEl.innerHTML = sortedGroups[idx].matches.map(m => matchRowHtml(m)).join('');
                // Attach click handlers
                listEl.querySelectorAll('.match-row-item[data-id]').forEach(row => {
                    row.addEventListener('click', () => {
                        window.location.href = `match-details?id=${row.dataset.id}`;
                    });
                });
            }
        });
    }, { rootMargin: '200px 0px' }); // Pre-load 200px before entering viewport

    sortedGroups.forEach((group, gi) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'league-group';
        groupEl.dataset.groupIdx = gi;
        groupEl.style.animation = `slideUp 0.5s ease-out ${gi * 0.06}s backwards`;

        const logoHtml = group.logo
            ? `<img src="${group.logo}" alt="${group.name}" class="league-group-logo" width="24" height="24" loading="lazy" onerror="this.style.display='none';">`
            : '';
        const liveTag = group.hasLive
            ? `<span style="margin-right:8px;background:#c0392b;border:1px solid #e74c3c;color:#ffffff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:10px;animation:pulse 1.5s infinite alternate;">● مباشر</span>`
            : '';
        const arrowHtml = group.leagueId
            ? `<span style="margin-right:auto;color:var(--text-secondary);font-size:0.8rem;">&#x276E;</span>`
            : '';

        const headerHref = group.leagueId
            ? `league?id=${encodeURIComponent(group.leagueId)}&slug=${encodeURIComponent(group.leagueSlug || group.name)}`
            : null;
        const headerEl = headerHref
            ? `<a href="${headerHref}" class="league-group-header league-group-header-link" style="text-decoration:none;cursor:pointer;">${logoHtml}<span class="league-group-title">${group.name}</span>${liveTag}${arrowHtml}</a>`
            : `<div class="league-group-header">${logoHtml}<span class="league-group-title">${group.name}</span>${liveTag}</div>`;

        // Render first 2 groups immediately (above fold), rest are lazy
        const isAboveFold = gi < 2;
        groupEl.dataset.loaded = isAboveFold ? '1' : '0';

        const matchesHtml = isAboveFold
            ? group.matches.map(m => matchRowHtml(m)).join('')
            : `<div style="height:${group.matches.length * 64}px"></div>`; // height placeholder

        groupEl.innerHTML = `${headerEl}<div class="league-matches-list">${matchesHtml}</div>`;
        fragment.appendChild(groupEl);

        if (!isAboveFold) observer.observe(groupEl);
    });

    container.innerHTML = '';
    container.appendChild(fragment);

    // Attach click handlers for above-fold rows
    container.querySelectorAll('[data-loaded="1"] .match-row-item[data-id]').forEach(row => {
        row.addEventListener('click', () => {
            window.location.href = `match-details?id=${row.dataset.id}`;
        });
    });


}

// ── Match row HTML ────────────────────────────────────────────
function matchRowHtml(match) {
    const renderLogo = (logo, name) => logo
        ? `<img src="${logo}" alt="${name}" class="team-logo-small" width="28" height="28" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<span class=emoji-logo-small>⚽</span>';">`
        : '<span class="emoji-logo-small">⚽</span>';

    const isLive     = match.isLive;
    const isFinished = match.isFinished;
    const isUpcoming = !isLive && !isFinished;

    let centerHtml, statusBadge;

    if (selectedDate === 'tomorrow' || isUpcoming) {
        centerHtml  = `<div class="match-time-badge" style="font-family: 'Cairo', sans-serif; font-weight: 700; color: var(--primary-color); font-size: 0.95rem; letter-spacing: 0.5px;">${match.time || '—'}</div><div class="match-vs-badge">ضد</div>`;
        statusBadge = `<span class="match-status-badge status-upcoming">قادمة</span>`;
    } else if (isLive) {
        const hs = match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '0';
        const as = match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '0';
        const statusText = match.statusAr || match.status || 'مباشر';

        centerHtml  = `<div class="match-time-badge" style="font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 0.85rem;">${match.time || ''}</div>
                       <div class="match-score-badge live">
                           <span class="score-num">${hs}</span>
                           <span class="score-divider">-</span>
                           <span class="score-num">${as}</span>
                       </div>`;
        statusBadge = `<span class="match-status-badge status-live">${statusText}</span>`;
    } else {
        const hs = match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '0';
        const as = match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '0';
        centerHtml  = `<div class="match-time-badge" style="font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 0.85rem;">${match.time || ''}</div>
                       <div class="match-score-badge">
                           <span class="score-num">${hs}</span>
                           <span class="score-divider">-</span>
                           <span class="score-num">${as}</span>
                       </div>`;
        const statusText = match.statusAr || match.status;
        statusBadge = `<span class="match-status-badge status-finished">${statusText}</span>`;
    }

    const hasPenalty = match.homePenaltyScore !== null && match.homePenaltyScore !== undefined &&
                       match.awayPenaltyScore !== null && match.awayPenaltyScore !== undefined;
    const penaltyHtml = hasPenalty ? `<div class="match-penalty-badge">(ر.ت. ${match.homePenaltyScore} - ${match.awayPenaltyScore})</div>` : '';

    const homeAttr = match.homeId ? `data-team-id="${match.homeId}" data-team-name="${match.homeTeam}" style="cursor:pointer;"` : '';
    const awayAttr = match.awayId ? `data-team-id="${match.awayId}" data-team-name="${match.awayTeam}" style="cursor:pointer;"` : '';

    const statusStr = `${match.isLive ? 'L' : match.isFinished ? 'F' : 'U'}_${match.homeScore}_${match.awayScore}_${match.statusAr || ''}`;

    return `
        <div class="match-row-item" data-id="${match.id}" data-status-str="${statusStr}" style="cursor:pointer;">
            <div class="match-team home" ${homeAttr}>
                <span class="match-team-name">${match.homeTeam}</span>
                <div class="team-logo-container">${renderLogo(match.homeLogo, match.homeTeam)}</div>
            </div>
            <div class="match-info-center">
                ${centerHtml}
                ${statusBadge}
                ${penaltyHtml}
                ${match.round ? `<span style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;display:block;text-align:center;">${match.round}</span>` : ''}
            </div>
            <div class="match-team away" ${awayAttr}>
                <div class="team-logo-container">${renderLogo(match.awayLogo, match.awayTeam)}</div>
                <span class="match-team-name">${match.awayTeam}</span>
            </div>
        </div>`;
}


// ── UI helpers ────────────────────────────────────────────────
function showLoading() {
    const container = document.getElementById('matchesList');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align:center;padding:3rem;color:var(--text-secondary);">
            <div style="font-size:2rem;margin-bottom:1rem;animation:spin 1s linear infinite;display:inline-block;">⚽</div>
            <p>جاري تحميل المباريات...</p>
        </div>`;
}

function showError(msg) {
    const container = document.getElementById('matchesList');
    if (container) container.innerHTML = `
        <div style="text-align:center;padding:3rem;color:#ff6b6b;">
            <p style="font-size:1.5rem;margin-bottom:1rem;">⚠️</p>
            <p>${msg}</p>
        </div>`;
}

function updateIndicator(online, updatedAt) {
    const el = document.getElementById('autoRefreshIndicator');
    if (!el) return;
    if (online) {
        const time = updatedAt ? new Date(updatedAt).toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        el.innerHTML = `
            <span style="display:inline-block;width:8px;height:8px;background:#4ade80;border-radius:50%;animation:pulse 2s infinite;"></span>
            <span>مباشر • آخر تحديث: ${time}</span>`;
    } else {
        el.innerHTML = `
            <span style="display:inline-block;width:8px;height:8px;background:#ff6b6b;border-radius:50%;"></span>
            <span>السيرفر غير متصل — يعيد المحاولة...</span>`;
    }
}

// ── League filter ─────────────────────────────────────────────
function matchesLeagueFilter(league, filter) {
    const map = {
        'premier':    ['الدوري الإنجليزي', 'Premier League'],
        'laliga':     ['الدوري الإسباني', 'La Liga', 'LaLiga'],
        'seriea':     ['الدوري الإيطالي', 'Serie A'],
        'bundesliga': ['الدوري الألماني', 'Bundesliga'],
        'ligue1':     ['الدوري الفرنسي', 'Ligue 1'],
        'egyptian':   ['الدوري المصري', 'Egyptian Premier League', 'كأس مصر'],
        'worldcup':   ['كأس العالم', 'World Cup'],
        'spl':        ['الدوري السعودي', 'Saudi Pro League', 'دوري روشن'],
        'ucl':        ['دوري أبطال أوروبا', 'Champions League'],
        'uel':        ['الدوري الأوروبي', 'Europa League'],
    };
    if (!map[filter]) return false;
    return map[filter].some(l => league.toLowerCase().includes(l.toLowerCase()));
}
