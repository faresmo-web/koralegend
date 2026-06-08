// ── team.js ─────────────────────────────────────────────────
// Handles the team details page: fetches data and renders tabs dynamically

document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get('id') || '';
    const teamName = params.get('name') || '';

    if (!teamId || !teamName) {
        document.getElementById('teamHeroContainer').innerHTML = 
            '<p style="text-align:center;color:#ff6b6b;padding:3rem;">معرّف الفريق غير صحيح</p>';
        return;
    }

    // Cache to prevent duplicate fetches
    const loadedTabs = {};

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const mainNav    = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', e => { 
            e.stopPropagation(); 
            menuToggle.classList.toggle('active'); 
            mainNav.classList.toggle('active'); 
        });
    }

    // Tab buttons registration
    const tabButtons = document.querySelectorAll('.team-tab-btn');
    const tabPanels  = document.querySelectorAll('.team-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', async function () {
            const tabName = this.getAttribute('data-tab');

            // Switch active tab UI
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            this.classList.add('active');
            const targetPanel = document.getElementById(`panel-${tabName}`);
            if (targetPanel) targetPanel.classList.add('active');

            // Load tab content if not loaded yet
            if (!loadedTabs[tabName]) {
                await loadTabContent(teamId, teamName, tabName);
            }
        });
    });

    // Helper to format date
    function fmtDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // Helper to format time
    function fmtTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }

    // Initial load: Fetch main team info (info tab)
    await loadTabContent(teamId, teamName, 'info');

    // Fetch and render tab data
    async function loadTabContent(id, name, tab) {
        const panel = document.getElementById(`panel-${tab}`);
        if (!panel) return;

        // Show loading spinner
        panel.innerHTML = '<div class="team-loading"><div class="spin">⚽</div><p>جاري التحميل...</p></div>';

        try {
            const res = await fetch(`/api/team?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&tab=${tab}`, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            loadedTabs[tab] = data;

            // Render Hero section only on initial load
            if (tab === 'info') {
                renderHero(data);
            }

            // Render tab-specific panel
            switch (tab) {
                case 'info':
                    renderInfo(data, panel);
                    break;
                case 'news':
                    renderNews(data, panel);
                    break;
                case 'videos':
                    renderVideos(data, panel);
                    break;
                case 'matches':
                    renderMatches(data, panel);
                    break;
                case 'squad':
                    renderSquad(data, panel);
                    break;
                case 'standings':
                    renderStandings(data, panel);
                    break;
                case 'scorers':
                    renderScorers(data, panel);
                    break;
            }
        } catch (e) {
            console.error(`Error loading tab ${tab}:`, e);
            panel.innerHTML = `<p style="text-align:center;color:#ff6b6b;padding:2rem;">تعذّر تحميل البيانات: ${e.message}</p>`;
        }
    }

    // Render Hero Card
    function renderHero(data) {
        const team = data.team || {};
        const container = document.getElementById('teamHeroContainer');
        if (!container) return;

        document.title = `${team.name || teamName} - كورة ليجند`;

        const logoHtml = team.image?.url
            ? `<img src="${team.image.url}" alt="${team.name}" class="team-hero-img" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' width=\\'80\\' height=\\'80\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\' fill=\\'%23222\\'/></svg>';">`
            : '<div class="team-hero-img" style="font-size:4rem;display:flex;align-items:center;justify-content:center;">🏟️</div>';

        container.innerHTML = `
            <div class="team-hero">
                <div class="team-hero-img-wrap">
                    ${logoHtml}
                </div>
                <div class="team-hero-info">
                    <h1 class="team-hero-name">${team.name || teamName}</h1>
                    <div class="team-hero-meta">
                        ${team.shortName ? `<span class="team-meta-pill">🏷️ ${team.shortName}</span>` : ''}
                        ${team.longName && team.longName !== team.name ? `<span class="team-meta-pill">📋 ${team.longName}</span>` : ''}
                        <span class="team-meta-pill">🏟️ نادي رياضي</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Info Panel
    function renderInfo(data, panel) {
        const team = data.team || {};
        const comp = data.competition || {};

        let contentHtml = `
            <div class="info-card-grid">
                <div class="info-block">
                    <div class="info-block-label">اسم الفريق</div>
                    <div class="info-block-value">${team.name || '—'}</div>
                </div>
                ${team.shortName ? `
                <div class="info-block">
                    <div class="info-block-label">الاسم المختصر</div>
                    <div class="info-block-value">${team.shortName}</div>
                </div>` : ''}
                ${team.longName ? `
                <div class="info-block">
                    <div class="info-block-label">الاسم الكامل</div>
                    <div class="info-block-value" style="font-size: 1rem; line-height: 1.4;">${team.longName}</div>
                </div>` : ''}
                ${comp.name ? `
                <div class="info-block">
                    <div class="info-block-label">البطولة الحالية</div>
                    <div class="info-block-value" style="font-size: 1.05rem;">${comp.name}</div>
                </div>` : ''}
            </div>
        `;

        panel.innerHTML = contentHtml;
    }

    // Render News Panel
    function renderNews(data, panel) {
        const newsArchive = data.newsArchive || data.latestNews || {};
        const newsList = newsArchive.news?.cards || newsArchive.cards || [];

        if (!newsList.length) {
            panel.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد أخبار متاحة حالياً للفريق</p>';
            return;
        }

        panel.innerHTML = `
            <div class="news-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">
                ${newsList.map(n => {
                    const title = n.title || n.headline || '';
                    const teaser = n.teaser || '';
                    const img = n.image?.url || '';
                    const link = n.link?.slug 
                        ? `article?slug=${encodeURIComponent(n.link.slug)}&id=${n.link.id || ''}` 
                        : (n.href ? `article?url=${encodeURIComponent(n.href)}` : '#');
                    const date = fmtDate(n.publishTime || n.updateTime || '');
                    
                    const imgHtml = img
                        ? `<img src="${img}" alt="${title}" style="width:100%;height:180px;object-fit:cover;" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=height:180px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);font-size:3rem;>📰</div>';">`
                        : `<div style="height:180px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);font-size:3rem;">📰</div>`;

                    return `
                        <a href="${link}" style="text-decoration:none;color:inherit;display:block;">
                            <div class="news-card" style="height:100%;">
                                <div class="news-image" style="height:180px;position:relative;overflow:hidden;border-radius:12px 12px 0 0;">
                                    ${imgHtml}
                                </div>
                                <div class="news-content" style="padding:15px;">
                                    <h3 class="news-title" style="font-size:1.1rem;margin-bottom:8px;line-height:1.4;">${title}</h3>
                                    <p class="news-description" style="font-size:0.85rem;color:var(--text-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:10px;">${teaser}</p>
                                    <div class="news-date" style="font-size:0.8rem;color:var(--text-muted);">${date}</div>
                                </div>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Render Videos Panel
    function renderVideos(data, panel) {
        const videosArchive = data.videosArchive || {};
        const videoList = videosArchive.news?.cards || videosArchive.cards || [];

        if (!videoList.length) {
            panel.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد مقاطع فيديو متاحة حالياً للفريق</p>';
            return;
        }

        panel.innerHTML = `
            <div class="news-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">
                ${videoList.map(n => {
                    const title = n.title || n.headline || '';
                    const img = n.image?.url || '';
                    const link = n.link?.slug 
                        ? `article?slug=${encodeURIComponent(n.link.slug)}&id=${n.link.id || ''}` 
                        : (n.href ? `article?url=${encodeURIComponent(n.href)}` : '#');
                    const date = fmtDate(n.publishTime || n.updateTime || '');
                    
                    const imgHtml = img
                        ? `<img src="${img}" alt="${title}" style="width:100%;height:180px;object-fit:cover;" onerror="this.style.display='none';">`
                        : `<div style="height:180px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);font-size:3rem;">🎥</div>`;

                    return `
                        <a href="${link}" style="text-decoration:none;color:inherit;display:block;">
                            <div class="news-card" style="height:100%;position:relative;">
                                <div class="news-image" style="height:180px;position:relative;overflow:hidden;border-radius:12px 12px 0 0;">
                                    ${imgHtml}
                                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50px;height:50px;border-radius:50%;background:rgba(0,102,255,0.85);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,102,255,0.6);font-size:1.6rem;color:white;">▶</div>
                                </div>
                                <div class="news-content" style="padding:15px;">
                                    <h3 class="news-title" style="font-size:1.1rem;margin-bottom:8px;line-height:1.4;">${title}</h3>
                                    <div class="news-date" style="font-size:0.8rem;color:var(--text-muted);">${date}</div>
                                </div>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Render Matches Panel
    function renderMatches(data, panel) {
        const matchesList = data.matches || data.summaryMatches || [];

        if (!matchesList.length) {
            panel.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد مباريات متوفرة حالياً</p>';
            return;
        }

        const renderLogo = (logo, name) => logo
            ? `<img src="${logo}" alt="${name}" class="team-logo-small" width="28" height="28" onerror="this.style.display='none';this.parentElement.innerHTML='<span class=emoji-logo-small>⚽</span>';">`
            : '<span class="emoji-logo-small">⚽</span>';

        panel.innerHTML = `
            <div class="matches-list">
                ${matchesList.slice(0, 30).map(m => {
                    const home = m.teamA?.name || 'الفريق الأول';
                    const away = m.teamB?.name || 'الفريق الثاني';
                    const homeLogo = m.teamA?.image?.url || '';
                    const awayLogo = m.teamB?.image?.url || '';
                    
                    const isLive = m.status === 'LIVE' || m.status === 'IN_PROGRESS';
                    const isFinished = m.status === 'RESULT';
                    const isUpcoming = !isLive && !isFinished;

                    let centerHtml = '', statusBadge = '';
                    const time = m.startDate ? fmtTime(m.startDate) : '';
                    const date = m.startDate ? fmtDate(m.startDate) : '';

                    if (isUpcoming) {
                        centerHtml = `<div class="match-time-badge">${time || 'قادمة'}</div><div class="match-vs-badge">ضد</div>`;
                        statusBadge = `<span class="match-status-badge status-upcoming">${date}</span>`;
                    } else {
                        const hs = m.score?.teamA !== undefined ? m.score.teamA : '-';
                        const as = m.score?.teamB !== undefined ? m.score.teamB : '-';
                        centerHtml = `
                            <div class="match-time-badge">${time || date}</div>
                            <div class="match-score-badge ${isLive ? 'live' : ''}">
                                <span class="score-num">${hs}</span>
                                <span class="score-divider">-</span>
                                <span class="score-num">${as}</span>
                            </div>
                        `;
                        statusBadge = `<span class="match-status-badge ${isLive ? 'status-live' : 'status-finished'}">${isLive ? 'مباشر' : 'انتهت'}</span>`;
                    }

                    return `
                        <div class="match-row-item" style="cursor:pointer;" onclick="if ('${m.id || ''}') window.location.href='match-details.html?id=${m.id}'">
                            <div class="match-team home">
                                <span class="match-team-name">${home}</span>
                                <div class="team-logo-container">${renderLogo(homeLogo, home)}</div>
                            </div>
                            <div class="match-info-center">
                                ${centerHtml}
                                ${statusBadge}
                                ${m.gameset?.name ? `<span style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;display:block;">${m.gameset.name}</span>` : ''}
                            </div>
                            <div class="match-team away">
                                <div class="team-logo-container">${renderLogo(awayLogo, away)}</div>
                                <span class="match-team-name">${away}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Render Squad Panel
    function renderSquad(data, panel) {
        const squad = data.squad || data.tabsInfoSquad || {};
        const players = squad.players || [];
        const coach = squad.coach || {};

        if (!players.length) {
            panel.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد قائمة لاعبين متوفرة حالياً</p>';
            return;
        }

        // Group players by position
        const groups = {
            'GOALKEEPER': { name: 'حراس المرمى', list: [] },
            'DEFENDER': { name: 'المدافعون', list: [] },
            'MIDFIELDER': { name: 'لاعبو الوسط', list: [] },
            'FORWARD': { name: 'المهاجمون', list: [] },
            'ATTACKER': { name: 'المهاجمون', list: [] },
            'OTHER': { name: 'لاعبون', list: [] }
        };

        players.forEach(p => {
            // Position may be at p.player.position (squad tab) or p.position (tabsInfoSquad)
            const person = p.player || p.person || p;
            const rawPos = person.position || p.position || 'OTHER';
            const groupKey = groups[rawPos] ? rawPos : 'OTHER';
            groups[groupKey].list.push(p);
        });

        let contentHtml = '';

        // Add Coach Info
        if (coach.name) {
            const coachImg = coach.image?.url && !coach.image.url.includes('default.png')
                ? `<img src="${coach.image.url}" class="player-card-img" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' width=\\'50\\' height=\\'50\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\' fill=\\'%23222\\'/></svg>';">`
                : '<div class="player-card-img" style="font-size:1.8rem;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);border-radius:50%;width:45px;height:45px;">👔</div>';

            contentHtml += `
                <div class="squad-section">
                    <div class="squad-pos-title">👔 المدير الفني</div>
                    <div class="squad-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                        <div class="player-card" style="cursor:default;">
                            ${coachImg}
                            <div class="player-card-info">
                                <div class="player-card-name">${coach.name}</div>
                                <div class="player-card-meta">مدرب الفريق</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Render player positions
        Object.values(groups).forEach(g => {
            if (g.list.length === 0) return;

            contentHtml += `
                <div class="squad-section">
                    <div class="squad-pos-title">⚽ ${g.name} (${g.list.length})</div>
                    <div class="squad-grid">
                        ${g.list.map(p => {
                            // Support both squad tab structure (p.player) and tabsInfoSquad (p.person / flat p)
                            const person = p.player || p.person || p;
                            const name = person.name || 'لاعب';
                            const shirt = p.shirtNumber || person.shirtNumber || '';
                            const img = person.image?.url || person.photo || '';
                            const age = person.age ? `${person.age} سنة` : '';
                            
                            const pImg = img && !img.includes('default.png')
                                ? `<img src="${img}" alt="${name}" class="player-card-img" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' width=\\'50\\' height=\\'50\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\' fill=\\'%23222\\'/></svg>';">`
                                : '<div class="player-card-img" style="font-size:1.8rem;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);border-radius:50%;width:45px;height:45px;">👤</div>';

                            const clickAttr = person.id ? `onclick="window.location.href='player?id=${encodeURIComponent(person.id)}&name=${encodeURIComponent(name)}'"` : '';

                            return `
                                <div class="player-card" ${clickAttr}>
                                    ${pImg}
                                    <div class="player-card-info">
                                        <div class="player-card-name">${name}</div>
                                        <div class="player-card-meta">
                                            ${shirt ? `<span style="color:var(--primary-color);font-weight:700;">#${shirt}</span> • ` : ''}
                                            ${age}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        panel.innerHTML = contentHtml || '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد قائمة لاعبين متوفرة حالياً</p>';
    }

    // Render Standings Panel
    function renderStandings(data, panel) {
        // summaryStandings → { tables: [...] }  (base/standings tab)
        // tabsInfoStandings → { 0: [...], 1: [...], ... } (numeric-keyed from info tab)
        const raw = data.summaryStandings || data.tabsInfoStandings || {};
        
        // Normalise to { tables: [...] }
        let standings;
        if (raw.tables) {
            standings = raw;
        } else {
            // Convert numeric-keyed object to tables array
            const numericValues = Object.values(raw).filter(v => Array.isArray(v));
            if (numericValues.length) {
                standings = { tables: numericValues.map(rankings => ({ rankings })) };
            } else {
                standings = { tables: [] };
            }
        }
        
        const tables = standings.tables || [];

        if (!tables.length) {
            panel.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا يوجد ترتيب متوفر حالياً للفريق</p>';
            return;
        }

        let html = '';
        tables.forEach(group => {
            const rows = group.rankings || [];
            if (!rows.length) return;

            if (tables.length > 1 && group.name) {
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
                                <th>نقاط</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(entry => {
                                const pos = entry.position || '';
                                const team = entry.team || {};
                                const isCurrentTeam = team.id === teamId;
                                const rowStyle = isCurrentTeam
                                    ? `background:rgba(27,117,240,0.12);border-right:3px solid var(--primary-color);`
                                    : '';

                                const clickAttr = team.id ? `style="cursor:pointer;${rowStyle}" onclick="window.location.href='team?id=${encodeURIComponent(team.id)}&name=${encodeURIComponent(team.name)}'"` : `style="${rowStyle}"`;

                                return `
                                    <tr ${clickAttr}>
                                        <td><span class="standing-pos ${pos <= 4 ? 'pos-top' : ''}">${pos}</span></td>
                                        <td>
                                            <div class="team-cell">
                                                ${team.image?.url ? `<img src="${team.image.url}" alt="${team.name}" width="20" height="20" loading="lazy">` : ''}
                                                <span style="${isCurrentTeam ? 'font-weight:800;color:#fff;' : ''}">${team.name}</span>
                                            </div>
                                        </td>
                                        <td>${entry.played ?? ''}</td>
                                        <td>${entry.won ?? ''}</td>
                                        <td>${entry.drawn ?? ''}</td>
                                        <td>${entry.lost ?? ''}</td>
                                        <td style="font-weight:800;color:#fff;">${entry.points ?? ''}</td>
                                    </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;
        });

        panel.innerHTML = html || '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا يوجد ترتيب متوفر حالياً للفريق</p>';
    }

    // Render Scorers/Top Players Panel
    function renderScorers(data, panel) {
        const topPlayers = data.tabsInfoTopPlayers || {};
        const categories = topPlayers.categories || [];

        if (!categories.length) {
            panel.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد بيانات هدافين متوفرة حالياً</p>';
            return;
        }

        let html = '';
        categories.forEach(cat => {
            const players = cat.players || [];
            if (!players.length) return;

            // Filter players to show only players of current team if needed, but kooora's scorers/top players endpoint
            // on team page returns the league-wide scorers or team scorers. Let's list whatever kooora returns!
            html += `
                <h3 style="font-size:1rem;font-weight:700;color:#fff;margin:1.2rem 0 0.75rem;">${cat.name || ''}</h3>
                <div class="top-players-list" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:15px;overflow:hidden;margin-bottom:1.5rem;">
                    ${players.slice(0, 10).map((p, i) => {
                        const player = p.player || {};
                        const name = player.name || '';
                        const team = p.team?.name || '';
                        const img = player.image?.url || '';
                        const stat = p.value ?? '';
                        const statLabel = cat.name === 'الهدافون' ? 'هدف' : cat.name === 'المساعدون' ? 'تمريرة' : '';
                        
                        const clickAttr = player.id ? `style="cursor:pointer;" onclick="window.location.href='player?id=${encodeURIComponent(player.id)}&name=${encodeURIComponent(name)}'"` : '';

                        return `
                            <div class="scorer-item" ${clickAttr}>
                                <div class="scorer-info">
                                    <div class="scorer-rank">${i + 1}</div>
                                    ${img && !img.includes('default.png') 
                                        ? `<img class="player-avatar" src="${img}" alt="${name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" loading="lazy">` 
                                        : `<div class="player-avatar" style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:1.1rem;">👤</div>`}
                                    <div>
                                        <div class="scorer-name">${name}</div>
                                        ${team ? `<div class="scorer-team" style="font-size:0.75rem;color:var(--text-secondary);">${team}</div>` : ''}
                                    </div>
                                </div>
                                ${stat !== '' ? `<div class="scorer-goals">${stat} <span style="font-size:0.75rem;font-weight:500;color:var(--text-secondary);">${statLabel}</span></div>` : ''}
                            </div>`;
                    }).join('')}
                </div>`;
        });

        panel.innerHTML = html || '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">لا توجد بيانات هدافين متوفرة حالياً</p>';
    }
});
