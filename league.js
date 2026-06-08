// ── league.js ─────────────────────────────────────────────────
// Handles the league details page: fetches data and renders tabs

(function () {
    'use strict';

    const API = '';  // same origin

    // ── Get URL Params ─────────────────────────────────────────
    function getParams() {
        const q = new URLSearchParams(location.search);
        return { id: q.get('id'), slug: q.get('slug') };
    }

    // ── Format date ─────────────────────────────────────────────
    function fmtDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function fmtTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    }

    // ── Render Hero ─────────────────────────────────────────────
    function renderHero(competition) {
        document.title = `${competition.name} - كورة ليجند`;
        document.getElementById('leagueName').textContent = competition.name || '';
        document.getElementById('leagueCountry').textContent = competition.area?.name || '';

        const inner = document.getElementById('leagueHeroInner');
        const logoHtml = competition.image?.url
            ? `<img src="${competition.image.url}" alt="${competition.name}" class="league-hero-logo" loading="lazy" onerror="this.parentElement.innerHTML='<div class=league-hero-logo-placeholder>⚽</div>'">`
            : `<div class="league-hero-logo-placeholder">⚽</div>`;

        inner.innerHTML = `
            ${logoHtml}
            <div class="league-hero-info">
                <h1 id="leagueName">${competition.name || ''}</h1>
                <div class="league-country" id="leagueCountry">${competition.area?.name || ''}</div>
            </div>`;
    }

    // ── Render Info Tab ─────────────────────────────────────────
    function renderInfo(data) {
        const { competition, tabs } = data;
        const teams = competition.teams || [];

        let teamsHtml = '';
        if (Array.isArray(teams) && teams.length) {
            teamsHtml = `
                <h3 style="font-size:1rem;font-weight:700;color:#fff;margin:1.5rem 0 0.75rem;">الأندية (${teams.length})</h3>
                <div class="teams-grid">
                    ${teams.map(t => {
                        const clickAttr = t.id 
                            ? `style="cursor:pointer;" onclick="window.location.href='team?id=${encodeURIComponent(t.id)}&name=${encodeURIComponent(t.name)}'"`
                            : '';
                        return `
                            <div class="team-card-mini" ${clickAttr}>
                                ${t.image?.url ? `<img src="${t.image.url}" alt="${t.name}" onerror="this.style.display='none'" loading="lazy">` : '⚽'}
                                <span>${t.name || ''}</span>
                            </div>`;
                    }).join('')}
                </div>`;
        }

        document.getElementById('tab-info').innerHTML = `
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-label">الدوري</div>
                    <div class="info-card-value">${competition.name || '—'}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">الدولة</div>
                    <div class="info-card-value">${competition.area?.name || '—'}</div>
                </div>
            </div>
            ${teamsHtml}`;
    }

    // ── Render News Tab ─────────────────────────────────────────
    function renderNews(data) {
        const newsList = data.tabs?.news?.cards || data.tabs?.news?.items || data.tabs?.news?.articles || [];

        if (!newsList.length) {
            document.getElementById('tab-news').innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد أخبار متاحة</p>`;
            return;
        }

        document.getElementById('tab-news').innerHTML = `
            <div class="league-news-grid">
                ${newsList.slice(0, 20).map(n => {
                    const title = n.title || n.headline || n.name || '';
                    const img = n.thumbnail?.url || n.image?.url || n.thumbnailUrl || '';
                    const link = n.link?.slug ? `article?slug=${n.link.slug}&id=${n.link.id || ''}` : '#';
                    const date = fmtDate(n.publishedAt || n.date || '');
                    return `
                        <a class="league-news-card" href="${link}">
                            ${img ? `<img class="league-news-img" src="${img}" alt="${title}" onerror="this.style.display='none'" loading="lazy">` : ''}
                            <div class="league-news-body">
                                <div class="league-news-title">${title}</div>
                                <div class="league-news-date">${date}</div>
                            </div>
                        </a>`;
                }).join('')}
            </div>`;
    }

    // ── Render Matches Tab ──────────────────────────────────────
    function renderMatches(data) {
        const gamesets = data.tabs?.matches;
        let matchesHtml = '';

        if (Array.isArray(gamesets)) {
            matchesHtml = gamesets.map(m => renderMatchRow(m)).join('');
        } else if (gamesets && typeof gamesets === 'object') {
            const rounds = gamesets.rounds || gamesets.groups || (Array.isArray(gamesets.items) ? gamesets.items : null);
            const flatMatches = gamesets.matches || gamesets.events || [];

            if (rounds && rounds.length) {
                rounds.forEach(round => {
                    const items = round.matches || round.events || [];
                    if (!items.length) return;
                    matchesHtml += `<h3 style="font-size:0.9rem;color:var(--text-secondary);margin:1rem 0 0.5rem;font-weight:600;">${round.name || ''}</h3>`;
                    matchesHtml += items.map(m => renderMatchRow(m)).join('');
                });
            } else if (flatMatches.length) {
                matchesHtml = flatMatches.map(m => renderMatchRow(m)).join('');
            }
        }

        if (!matchesHtml) {
            document.getElementById('tab-matches').innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد مباريات متاحة</p>`;
            return;
        }

        document.getElementById('tab-matches').innerHTML = matchesHtml;
    }

    function renderMatchRow(m) {
        const home = m.teamA?.name || m.home?.name || m.homeTeam || 'الفريق أ';
        const away = m.teamB?.name || m.away?.name || m.awayTeam || 'الفريق ب';
        const homeLogo = m.teamA?.image?.url || m.home?.logo || '';
        const awayLogo = m.teamB?.image?.url || m.away?.logo || '';
        const homeScore = m.score?.teamA;
        const awayScore = m.score?.teamB;
        const hasScore = homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined;
        const scoreText = hasScore ? `${homeScore} - ${awayScore}` : 'vs';
        const time = m.startDate ? fmtTime(m.startDate) : '';
        const date = m.startDate ? fmtDate(m.startDate) : '';
        const slug = m.link?.slug || '';
        const id = m.link?.id || m.id || '';
        const link = slug ? `match-details?id=${id}&slug=${slug}` : '#';

        const teamImg = (logo, name) => logo
            ? `<img src="${logo}" alt="${name}" onerror="this.style.display='none'" loading="lazy">`
            : '⚽';

        return `
            <a class="summary-match-item" href="${link}" style="text-decoration:none;">
                <div class="summary-team" style="justify-content:flex-end;">
                    <span>${home}</span>
                    ${teamImg(homeLogo, home)}
                </div>
                <div class="summary-score-block">
                    <div class="summary-score">${scoreText}</div>
                    <div class="summary-time">${time || date}</div>
                </div>
                <div class="summary-team">
                    ${teamImg(awayLogo, away)}
                    <span>${away}</span>
                </div>
            </a>`;
    }

    // ── Render Standings Tab ────────────────────────────────────
    function renderStandings(data) {
        const sData = data.tabs?.standings;
        if (!sData) {
            document.getElementById('tab-standings').innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا يوجد ترتيب متاح</p>`;
            return;
        }

        const groups = sData.tables || sData.standings || sData.groups || (Array.isArray(sData) ? sData : null);
        if (!groups || !groups.length) {
            document.getElementById('tab-standings').innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا يوجد ترتيب متاح</p>`;
            return;
        }

        const totalRows = groups.reduce((sum, g) => sum + (g.rankings || g.entries || g.rows || []).length, 0);
        if (totalRows === 0) {
            document.getElementById('tab-standings').innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا يوجد ترتيب متاح</p>`;
            return;
        }

        // Legend colors for markers
        const MARKER_COLORS = {
            'PROMOTION':          '#3b82f6', // blue  - Champions League / promotion
            'PROMOTION_PLAYOFF':  '#8b5cf6', // purple
            'RELEGATION':         '#ef4444', // red   - relegation
            'RELEGATION_PLAYOFF': '#f97316', // orange
        };
        const MARKER_DEFAULTS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

        // Build legend from _legend field
        const legend = sData._legend || [];
        const legendMap = {}; // id → color
        legend.forEach((item, i) => {
            const color = MARKER_COLORS[item.type] || MARKER_DEFAULTS[i % MARKER_DEFAULTS.length];
            legendMap[item.id] = { color, name: item.name };
        });

        const isSummary = totalRows <= 6;

        let html = '';

        // Legend bar
        if (legend.length > 0) {
            html += `<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:1rem;padding:0.75rem 1rem;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">`;
            legend.forEach((item, i) => {
                const color = MARKER_COLORS[item.type] || MARKER_DEFAULTS[i % MARKER_DEFAULTS.length];
                html += `<div style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary);">
                    <span style="width:12px;height:12px;border-radius:3px;background:${color};flex-shrink:0;"></span>
                    <span>${item.name}</span>
                </div>`;
            });
            html += `</div>`;
        }

        if (isSummary) {
            html += `<div style="text-align:center;margin-bottom:0.75rem;">
                <span style="background:rgba(255,170,0,0.12);border:1px solid rgba(255,170,0,0.3);color:#ffaa00;padding:4px 12px;border-radius:10px;font-size:0.78rem;font-weight:600;">
                    ⚡ يعرض أعلى ${totalRows} فرق
                </span>
            </div>`;
        }

        groups.forEach(group => {
            const rows = group.rankings || group.entries || group.teams || group.rows || [];
            if (!rows.length) return;

            if (groups.length > 1 && group.name) {
                html += `<h3 style="font-size:0.9rem;color:var(--text-secondary);margin:1.2rem 0 0.5rem;font-weight:600;">${group.name}</h3>`;
            }

            html += `
                <div style="overflow-x:auto;margin-bottom:1rem;">
                    <table class="standings-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th style="text-align:right;padding-right:1rem;">الفريق</th>
                                <th>لعب</th>
                                <th>فاز</th>
                                <th>تعادل</th>
                                <th>خسر</th>
                                <th>فارق</th>
                                <th>نقاط</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map((entry, i) => {
                                const pos  = entry.position ?? entry.rank ?? (i + 1);
                                const team = entry.team || entry.competitor || entry;
                                const name = team.name || entry.teamName || '';
                                const logo = team.image?.url || team.logo || '';
                                const played = entry.played   ?? entry.gamesPlayed ?? entry.mp ?? '';
                                const won    = entry.win      ?? entry.won  ?? entry.wins  ?? entry.w ?? '';
                                const drawn  = entry.draw     ?? entry.drawn ?? entry.draws ?? entry.d ?? '';
                                const lost   = entry.lose     ?? entry.lost ?? entry.losses ?? entry.l ?? '';
                                const gd     = entry.goalsDifference ?? entry.goalDifference
                                             ?? (entry.goalsFor != null ? `${entry.goalsFor}:${entry.goalsAgainst}` : '');
                                const pts    = entry.points ?? entry.pts ?? '';

                                // Marker color (left border)
                                const markers = entry.markers || [];
                                let borderColor = '';
                                if (markers.length > 0) {
                                    const m = markers[0];
                                    borderColor = legendMap[m.id]?.color || MARKER_COLORS[m.type] || '';
                                }
                                const rowStyle = borderColor
                                    ? `border-right:3px solid ${borderColor};`
                                    : '';

                                const posClass = pos <= 4 ? 'pos-top' : pos >= rows.length - 2 ? 'pos-rel' : '';
                                const rowClickAttr = team.id
                                    ? `style="cursor:pointer;${rowStyle}" onclick="window.location.href='team?id=${encodeURIComponent(team.id)}&name=${encodeURIComponent(name)}'"`
                                    : `style="${rowStyle}"`;

                                return `
                                    <tr ${rowClickAttr}>
                                        <td><span class="standing-pos ${posClass}">${pos}</span></td>
                                        <td>
                                            <div class="team-cell">
                                                ${logo ? `<img src="${logo}" alt="${name}" onerror="this.style.display='none'" loading="lazy">` : ''}
                                                <span>${name}</span>
                                            </div>
                                        </td>
                                        <td>${played}</td>
                                        <td>${won}</td>
                                        <td>${drawn}</td>
                                        <td>${lost}</td>
                                        <td>${gd}</td>
                                        <td style="font-weight:800;color:#fff;">${pts}</td>
                                    </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;
        });

        document.getElementById('tab-standings').innerHTML = html || `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا يوجد ترتيب متاح</p>`;
    }

    function renderTopPlayers(data) {
        const tpData = data.tabs?.topPlayers;
        if (!tpData) {
            document.getElementById('tab-top-players').innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد بيانات متاحة</p>`;
            return;
        }

        let categories = tpData.categories || tpData.sections;
        if (!categories) {
            if (Array.isArray(tpData)) {
                categories = [{ name: 'أفضل اللاعبين', players: tpData }];
            } else if (typeof tpData === 'object') {
                categories = Object.keys(tpData).map(k => {
                    const name = k === 'goals' ? 'الهدافون' : k === 'assists' ? 'صناع اللعب' : k === 'redCards' ? 'بطاقات حمراء' : k === 'yellowCards' ? 'بطاقات صفراء' : k;
                    return { name, players: tpData[k] };
                }).filter(c => Array.isArray(c.players) && c.players.length > 0 && c.players[0].player); // ensure it has actual players
            }
        }

        if (!categories || !categories.length) {
            document.getElementById('tab-top-players').innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد بيانات متاحة</p>`;
            return;
        }

        let html = '';
        categories.forEach(cat => {
            const players = cat.players || cat.entries || cat.items || [];
            if (!players.length) return;
            html += `
                <h3 style="font-size:1rem;font-weight:700;color:#fff;margin:1.2rem 0 0.75rem;">${cat.name || ''}</h3>
                <div class="top-players-list">
                    ${players.slice(0, 10).map((p, i) => {
                        const player = p.player || p;
                        const name = player.name || p.name || '';
                        const teamName = (p.team?.name || player.team?.name || '');
                        const teamId = (p.team?.id || player.team?.id || '');
                        const playerId = player.id || p.id || '';
                        const img = player.image?.url || player.photo || '';
                        const stat = p.value ?? p.goals ?? p.assists ?? p.rating ?? '';
                        const statLabel = cat.name === 'الهدافون' ? 'هدف' : cat.name === 'المساعدون' ? 'تمريرة' : '';
                        
                        const playerHtml = playerId
                            ? `<span style="cursor:pointer;font-weight:600;text-decoration:underline;" onclick="window.location.href='player?id=${encodeURIComponent(playerId)}&name=${encodeURIComponent(name)}'">${name}</span>`
                            : name;
                            
                        const teamHtml = teamId
                            ? `<span style="cursor:pointer;color:var(--text-secondary);text-decoration:underline;" onclick="window.location.href='team?id=${encodeURIComponent(teamId)}&name=${encodeURIComponent(teamName)}'">${teamName}</span>`
                            : teamName;

                        return `
                            <div class="player-row">
                                <div class="player-rank">${i + 1}</div>
                                ${img ? `<img class="player-avatar" src="${img}" alt="${name}" onerror="this.style.display='none'" loading="lazy">` : `<div class="player-avatar" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">👤</div>`}
                                <div class="player-info" style="${playerId ? 'cursor:pointer;' : ''}">
                                    <div class="player-name">${playerHtml}</div>
                                    <div class="player-team">${teamHtml}</div>
                                </div>
                                ${stat !== '' ? `<div style="text-align:center"><div class="player-stat">${stat}</div><div class="player-stat-label">${statLabel}</div></div>` : ''}
                            </div>`;
                    }).join('')}
                </div>`;
        });

        document.getElementById('tab-top-players').innerHTML = html || `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد بيانات متاحة</p>`;
    }

    // ── Tab Switching ───────────────────────────────────────────
    function initTabs() {
        document.querySelectorAll('.league-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.league-tab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.league-tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const tabId = `tab-${btn.dataset.tab}`;
                const el = document.getElementById(tabId);
                if (el) el.classList.add('active');
            });
        });
    }

    // ── Main ────────────────────────────────────────────────────
    async function init() {
        const { id, slug } = getParams();
        if (!id || !slug) {
            document.getElementById('leagueName').textContent = 'دوري غير محدد';
            return;
        }

        initTabs();

        try {
            const res = await fetch(`${API}/api/league?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // Render Hero
            if (data.competition) {
                renderHero(data.competition);
            }

            // Render all tabs
            renderInfo(data);
            renderNews(data);
            renderMatches(data);
            renderStandings(data);
            renderTopPlayers(data);

        } catch (err) {
            console.error('League fetch error:', err);
            ['info', 'news', 'matches', 'standings', 'top-players'].forEach(tab => {
                const el = document.getElementById(`tab-${tab}`);
                if (el) el.innerHTML = `<p style="text-align:center;color:#f87171;padding:2rem;">تعذّر تحميل البيانات. يرجى المحاولة لاحقاً.</p>`;
            });
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
