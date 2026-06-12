// Match Details Controller

document.addEventListener('DOMContentLoaded', async function() {
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
    
    // Mobile menu - Initialize first before any other checks
    const menuToggle = document.getElementById('menuToggle');
    const mainNav    = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        console.log('✅ Menu toggle initialized (match-details)');
        // Toggle menu when button is clicked
        menuToggle.addEventListener('click', function(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            console.log('🔄 Toggle clicked (match-details)');
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            console.log('Active class:', menuToggle.classList.contains('active'));
        });
        
        // Close menu when clicking on a nav link
        const navLinks = mainNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            setTimeout(() => {
                if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
                    menuToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                }
            }, 10);
        });
    } else {
        console.warn('❌ Menu toggle or mainNav not found (match-details)', { menuToggle, mainNav });
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');
    
    // 1. Language Localization on DOM Load
    document.querySelectorAll('[data-ar]').forEach(el => {
        el.textContent = el.getAttribute('data-ar');
    });
    
    if (!matchId) {
        showErrorMessage('رمز المباراة غير صحيح', 'Invalid Match ID');
        return;
    }

    // 2. Try to get match info from live API first, fallback to static DB
    let matchInfo = null;
    let dateType  = 'today';

    // Try API
    try {
        for (const date of ['today', 'yesterday', 'tomorrow']) {
            const res  = await fetch(`/api/matches?date=${date}`, { cache: 'no-store' });
            if (!res.ok) continue;
            const json = await res.json();
            const found = (json.matches || []).find(m => m.id === matchId);
            if (found) { matchInfo = found; dateType = date; break; }
        }
    } catch (_) {}

    // Fallback to static matchesDatabase
    if (!matchInfo && typeof matchesDatabase !== 'undefined') {
        for (const dateKey of ['today', 'yesterday', 'tomorrow']) {
            const list  = matchesDatabase[currentLang]?.[dateKey] || [];
            const found = list.find(m => m.id === matchId);
            if (found) { matchInfo = found; dateType = dateKey; break; }
        }
    }

    if (!matchInfo) {
        showErrorMessage('لم يتم العثور على المباراة', 'Match not found');
        return;
    }

    // 3. Get match details from live API first, fallback to static DB
    let matchDetails = null;

    try {
        const slug     = matchInfo.slug     || '';
        const koooraId = matchInfo.koooraId || matchId;
        const liveFlag = matchInfo.isLive ? '1' : '0';
        if (slug) {
            const res = await fetch(
                `/api/details?id=${encodeURIComponent(matchId)}&slug=${encodeURIComponent(slug)}&koooraId=${encodeURIComponent(koooraId)}&live=${liveFlag}`,
                { cache: 'no-store' }
            );
            if (res.ok) matchDetails = await res.json();
        }
    } catch (_) {}

    // Fallback to static matchDetailsDatabase
    if (!matchDetails && typeof matchDetailsDatabase !== 'undefined') {
        matchDetails = matchDetailsDatabase[matchId] || null;
    }

    // 4. Render everything
    renderHeroCard(matchInfo, matchDetails, dateType);
    renderEvents(matchDetails);
    renderStats(matchDetails);
    renderLineups(matchDetails, matchInfo);

    // Hide page loading indicator
    if (typeof hidePageLoading === 'function') {
        hidePageLoading();
    }

    // 5. Tab Switches
    const tabButtons = document.querySelectorAll('.details-tab-btn');
    const tabPanels  = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(`panel-${tabName}`)?.classList.add('active');
        });
    });

    // 6. Live polling for live matches
    if (matchInfo.isLive) {
        startLivePolling(matchId, matchInfo);
    }
});

function renderHeroCard(match, details, dateType) {
    const cardContainer = document.getElementById('matchHeroCard');
    if (!cardContainer) return;
    
    const isLive = match.isLive;
    const isUpcoming = !match.isLive && !match.isFinished;
    
    let statusClass = 'finished';
    if (isLive) statusClass = 'live';
    else if (isUpcoming) statusClass = 'upcoming';
    
    const homeScore = match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '0';
    const awayScore = match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '0';
    
    const homePenalty = match.homePenaltyScore !== undefined && match.homePenaltyScore !== null ? match.homePenaltyScore : (details?.homePenaltyScore ?? null);
    const awayPenalty = match.awayPenaltyScore !== undefined && match.awayPenaltyScore !== null ? match.awayPenaltyScore : (details?.awayPenaltyScore ?? null);
    
    const hasPenalty = homePenalty !== null && awayPenalty !== null;
    const penaltyHtml = hasPenalty 
        ? `<div class="match-hero-penalty-badge" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.03)); border: 1px solid rgba(255, 215, 0, 0.45); color: #ffd700; padding: 4px 12px; border-radius: 12px; font-size: 0.82rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); direction: rtl; font-family: 'Cairo', 'Orbitron', sans-serif;">
            <span>ركلات الترجيح:</span>
            <span style="font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">${homePenalty} - ${awayPenalty}</span>
           </div>`
        : '';

    // Build center section based on match state
    let centerInnerHtml;
    if (isUpcoming) {
        // Upcoming: show time prominently, no score
        centerInnerHtml = `
            <div style="font-family: 'Cairo', 'Orbitron', sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--primary-color); letter-spacing: 1px; text-shadow: 0 0 15px rgba(27, 117, 240, 0.4); direction: rtl;">
                ${match.time || '—'}
            </div>
            <div class="match-hero-score" style="font-size: 1.8rem; opacity: 0.3;">
                <span>—</span>
                <span style="font-size: 1rem;">ضد</span>
                <span>—</span>
            </div>
            <span class="match-hero-status ${statusClass}">${match.statusAr || match.status}</span>
        `;
    } else {
        // Live or Finished: show score prominently, time below
        centerInnerHtml = `
            <div class="match-hero-score">
                <span class="${isLive ? 'score-live-pulse' : ''}">${homeScore}</span>
                <span>-</span>
                <span class="${isLive ? 'score-live-pulse' : ''}">${awayScore}</span>
            </div>
            <span class="match-hero-status ${statusClass}">${match.statusAr || match.status}</span>
            ${penaltyHtml}
            <span style="font-size: 0.85rem; color: var(--text-secondary); font-family: 'Cairo', 'Orbitron', sans-serif; margin-top: 4px; direction: rtl;">${match.time || ''}</span>
        `;
    }

    // Get info values
    const channel = details?.info?.channel || (currentLang === 'ar' ? 'غير متوفر' : 'N/A');
    const stadium = details?.info?.stadium || (currentLang === 'ar' ? 'غير متوفر' : 'N/A');
    const referee = details?.info?.referee || (currentLang === 'ar' ? 'غير متوفر' : 'N/A');
    const round   = details?.info?.round || match.round || '';
    
    const renderLogo = (logo, teamName) => {
        if (!logo) return '<span style="font-size: 3rem;">⚽</span>';
        return `<img src="${logo}" alt="${teamName}" class="match-hero-team-logo" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' width=\\'80\\' height=\\'80\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\' fill=\\'%23222\\'/></svg>';">`;
    };
    
    const renderLeagueLogo = match.leagueLogo 
        ? `<img src="${match.leagueLogo}" alt="${match.league}" class="match-hero-league-logo" onerror="this.style.display='none';" loading="lazy">`
        : '';
        
    cardContainer.innerHTML = `
        <!-- League -->
        <div class="match-hero-league">
            ${renderLeagueLogo}
            <span>${match.league}</span>
            ${round ? `<span style="background:rgba(27,117,240,0.15);border:1px solid rgba(27,117,240,0.3);color:var(--primary-color);padding:2px 10px;border-radius:12px;font-size:0.8rem;font-weight:700;">${round}</span>` : ''}
        </div>
        
        <!-- Main Core -->
        <div class="match-hero-main">
            <!-- Home -->
            <div class="match-hero-team" ${match.homeId ? `style="cursor:pointer;" onclick="window.location.href='team?id=${encodeURIComponent(match.homeId)}&name=${encodeURIComponent(match.homeTeam)}'"` : ''}>
                <span class="match-hero-team-name">${match.homeTeam}</span>
                ${renderLogo(match.homeLogo, match.homeTeam)}
            </div>
            
            <!-- Center Score / Time -->
            <div class="match-hero-center">
                ${centerInnerHtml}
            </div>
            
            <!-- Away -->
            <div class="match-hero-team" ${match.awayId ? `style="cursor:pointer;" onclick="window.location.href='team?id=${encodeURIComponent(match.awayId)}&name=${encodeURIComponent(match.awayTeam)}'"` : ''}>
                <span class="match-hero-team-name">${match.awayTeam}</span>
                ${renderLogo(match.awayLogo, match.awayTeam)}
            </div>
        </div>
        
        <!-- Meta Details -->
        <div class="match-hero-meta">
            ${round ? `
            <div class="meta-item">
                <span class="meta-label">الجولة</span>
                <span class="meta-value">${round}</span>
            </div>` : ''}
            <div class="meta-item">
                <span class="meta-label" data-en="Match Time" data-ar="توقيت المباراة">توقيت المباراة</span>
                <span class="meta-value" style="font-family: 'Cairo', sans-serif; font-weight: 700; color: var(--primary-color); font-size: 1.1rem; letter-spacing: 0.5px; direction: rtl;">${match.time || 'غير متوفر'}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label" data-en="Broadcaster" data-ar="القناة الناقلة">القناة الناقلة</span>
                <span class="meta-value">${channel}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label" data-en="Stadium" data-ar="الملعب">الملعب</span>
                <span class="meta-value">${stadium}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label" data-en="Referee" data-ar="الحكم">الحكم</span>
                <span class="meta-value">${referee}</span>
            </div>
        </div>
    `;
}

function renderEvents(details) {
    const container = document.getElementById('eventsTimeline');
    if (!container) return;
    
    if (!details || !details.events || details.events.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-xl) 0; color: var(--text-secondary);">
                <p style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">📅</p>
                <h3 data-en="No events available yet" data-ar="لا توجد أحداث متوفرة حالياً">لا توجد أحداث متوفرة حالياً</h3>
                <p style="font-size: 0.9rem; margin-top: 8px;" data-en="Match timeline will populate once the game starts" data-ar="ستظهر أحداث اللقاء مباشرة فور انطلاقه!">ستظهر أحداث اللقاء مباشرة فور انطلاقه!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Header showing which side is home/away
    const matchHeroMain = document.querySelector('.match-hero-main');
    const homeTeamEl = matchHeroMain?.querySelector('.match-hero-team:first-child .match-hero-team-name') 
                    || matchHeroMain?.querySelector('.match-hero-team-name');
    const allTeamNames = matchHeroMain?.querySelectorAll('.match-hero-team-name');
    const homeTeamName = allTeamNames?.[0]?.textContent || 'الفريق الأول';
    const awayTeamName = allTeamNames?.[1]?.textContent || 'الفريق الثاني';
    
    const headerEl = document.createElement('div');
    headerEl.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:1.5rem;font-size:0.78rem;font-weight:700;';
    headerEl.innerHTML = `
        <span style="color:var(--primary-color);width:44%;text-align:right;">${homeTeamName}</span>
        <span style="width:12%;"></span>
        <span style="color:var(--secondary-color);width:44%;text-align:left;">${awayTeamName}</span>
    `;
    container.appendChild(headerEl);
    const sortedEvents = [...details.events].sort((a, b) => {
        const minA = parseInt(a.min) || 0;
        const minB = parseInt(b.min) || 0;
        return minB - minA; // Show latest events first
    });
    
    sortedEvents.forEach(evt => {
        // Skip referee metadata or empty 0 min metadata
        if (evt.min === '0' && !evt.descText && !evt.score) return;

        const wrapper = document.createElement('div');

        if (evt.type === 'milestone') {
            wrapper.className = `timeline-milestone`;
            let iconHtml = '';
            if (evt.descText && evt.descText.includes('بدأت')) {
                iconHtml = `<div class="milestone-icon">⏱️</div>`;
            } else if (evt.score) {
                iconHtml = `<div class="milestone-score">${evt.score}</div>`;
            }
            wrapper.innerHTML = `
                ${iconHtml}
                <div class="milestone-text">${evt.descText}</div>
            `;
            container.appendChild(wrapper);
            return;
        }

        wrapper.className = `timeline-event-wrapper ${evt.team}`;
        
        let icon = '';
        let iconClass = '';
        
        if (evt.type === 'goal') {
            icon = '⚽';
            iconClass = 'goal-icon';
        } else if (evt.type === 'penalty') {
            icon = '⚽';
            iconClass = 'goal-icon';
        } else if (evt.type === 'own-goal') {
            icon = '⚽';
            iconClass = 'goal-icon-own';
        } else if (evt.type === 'yellow') {
            icon = '🟨';
            iconClass = 'card-icon';
        } else if (evt.type === 'red') {
            icon = '🟥';
            iconClass = 'card-icon';
        } else if (evt.type === 'sub') {
            icon = '🔄';
            iconClass = 'sub-icon';
        } else {
            icon = '📢';
            iconClass = 'default-icon';
        }

        let mainPlayer = evt.descText || '';
        let subPlayer = '';
        
        // Parse "Main Player (Sub Player)"
        const match = evt.descText?.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            mainPlayer = match[1].trim();
            subPlayer = match[2].trim();
            
            // Fix sub icon parsing if it's "sub in <-> sub out"
            if (evt.type === 'sub' && evt.descText.includes('↔')) {
                const parts = evt.descText.split('↔');
                if (parts.length === 2) {
                    mainPlayer = parts[0].trim();
                    subPlayer = parts[1].trim();
                }
            }
        } else if (evt.type === 'sub' && evt.descText?.includes('↔')) {
            const parts = evt.descText.split('↔');
            mainPlayer = parts[0].trim();
            subPlayer = parts[1].trim();
        }
        
        if (evt.type === 'penalty' && !subPlayer) {
            subPlayer = currentLang === 'ar' ? 'ركلة جزاء' : 'Penalty';
        } else if (evt.type === 'own-goal' && !subPlayer) {
            subPlayer = currentLang === 'ar' ? 'هدف في مرماه' : 'Own Goal';
        }

        const infoHtml = `
            <div class="timeline-event-info">
                <div class="event-players">
                    <div class="event-main-player">${mainPlayer}</div>
                    ${subPlayer ? `<div class="event-sub-player">${subPlayer}</div>` : ''}
                </div>
                <div class="event-icon ${iconClass}">${icon}</div>
            </div>
        `;

        wrapper.innerHTML = `
            <div class="timeline-event-content">
                ${infoHtml}
            </div>
            <div class="timeline-minute-badge"><span class="min-tick">'</span>${evt.min}</div>
            <div style="grid-column: ${evt.team === 'home' ? '3' : '1'}"></div>
        `;
        
        container.appendChild(wrapper);
    });
}

function renderStats(details) {
    const container = document.getElementById('statsCard');
    if (!container) return;
    
    if (!details || !details.stats || details.stats.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-xl) 0; color: var(--text-secondary);">
                <p style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">📊</p>
                <h3 data-en="No statistics available" data-ar="لا توجد إحصائيات متوفرة">لا توجد إحصائيات متوفرة</h3>
                <p style="font-size: 0.9rem; margin-top: 8px;" data-en="Stats will start updating once match kicks off" data-ar="ستظهر إحصائيات المباراة مباشرة فور انطلاق اللقاء!">ستظهر إحصائيات المباراة مباشرة فور انطلاق اللقاء!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    details.stats.forEach(stat => {
        const row = document.createElement('div');
        row.className = 'stat-row-item';
        
        // Calculate percentages for visual representation
        let homeVal = parseFloat(stat.home) || 0;
        let awayVal = parseFloat(stat.away) || 0;
        
        // Check if values have "%"
        const isHomePct = stat.home.includes('%');
        const isAwayPct = stat.away.includes('%');
        
        let homePct = 50;
        let awayPct = 50;
        
        if (isHomePct || isAwayPct) {
            homePct = parseFloat(stat.home) || 0;
            awayPct = parseFloat(stat.away) || 0;
        } else {
            const total = homeVal + awayVal;
            if (total > 0) {
                homePct = (homeVal / total) * 100;
                awayPct = (awayVal / total) * 100;
            }
        }
        
        row.innerHTML = `
            <div class="stat-labels">
                <span class="stat-value home">${stat.home}</span>
                <span class="stat-label-title">${stat.name}</span>
                <span class="stat-value away">${stat.away}</span>
            </div>
            <div class="stat-bars-container">
                <div class="stat-bar-home" style="width: ${homePct}%"></div>
                <div class="stat-bar-away" style="width: ${awayPct}%"></div>
            </div>
        `;
        
        container.appendChild(row);
    });
}

function renderLineups(details, matchInfo) {
    const container = document.getElementById('lineupsContainer');
    if (!container) return;
    
    const homeTeam = matchInfo?.homeTeam || 'Home';
    const awayTeam = matchInfo?.awayTeam || 'Away';
    const confirmed = details?.lineups?.confirmed;
    const hasLineups = details?.lineups?.home?.starters?.length > 0 || details?.lineups?.away?.starters?.length > 0;

    if (!details || !details.lineups || !hasLineups) {
        container.style.display = 'block';
        container.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-xl) 0; color: var(--text-secondary);">
                <p style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">📋</p>
                <h3>التشكيلة لم تعلن بعد</h3>
                <p style="font-size: 0.9rem; margin-top: 8px;">تُعرض تشكيلة الفريقين الرسمية فور إعلانها قبل المباراة بقرابة ساعة.</p>
            </div>
        `;
        return;
    }

    container.removeAttribute('style');
    container.innerHTML = '';

    // ── Badge: confirmed or expected ──
    const badgeHtml = confirmed
        ? `<div style="text-align:center;margin-bottom:1rem;"><span style="background:rgba(0,255,136,0.15);border:1px solid rgba(0,255,136,0.4);color:#00ff88;padding:6px 18px;border-radius:20px;font-size:0.85rem;font-weight:700;">✅ التشكيلة الرسمية المؤكدة</span></div>`
        : `<div style="text-align:center;margin-bottom:1rem;"><span style="background:rgba(255,170,0,0.15);border:1px solid rgba(255,170,0,0.4);color:#ffaa00;padding:6px 18px;border-radius:20px;font-size:0.85rem;font-weight:700;">🔮 التشكيلة المتوقعة</span></div>`;

    container.insertAdjacentHTML('beforeend', badgeHtml);

    // ── Pitch View ──
    const homeLineup  = details.lineups.home;
    const awayLineup  = details.lineups.away;
    const homePlayers = homeLineup.starters || [];
    const awayPlayers = awayLineup.starters || [];

    const pitchWrapper = document.createElement('div');
    pitchWrapper.style.cssText = 'position:relative;width:100%;max-width:900px;margin:0 auto 2rem;';

    // Pitch SVG background — Tactical Holographic HUD Layout (Never seen before!)
    pitchWrapper.innerHTML = `
        <style>
        @keyframes radarPulse {
            0% { transform: scale(0.7); opacity: 0.8; border-width: 2px; }
            100% { transform: scale(1.6); opacity: 0; border-width: 1px; }
        }
        @keyframes floatNode {
            0% { transform: translate(-50%, -50%) translateY(0px); }
            50% { transform: translate(-50%, -50%) translateY(-4px); }
            100% { transform: translate(-50%, -50%) translateY(0px); }
        }
        .player-node { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); animation: floatNode 4s infinite ease-in-out; }
        .player-node:nth-child(even) { animation-delay: 2s; }
        .player-node:hover { z-index: 10 !important; animation-play-state: paused; }
        .player-node:hover .node-core { transform: rotate(45deg) scale(1.2) !important; box-shadow: 0 0 30px currentColor !important; }
        .player-node:hover .name-tag { background: currentColor !important; color: #000 !important; border-color: transparent !important; transform: scale(1.1); }
        .player-node:hover .name-tag span { color: #000 !important; font-weight: 900 !important; }
        </style>

        <div style="position:relative;width:100%;padding-bottom:62%;border-radius:16px;overflow:hidden;background:#060a14;border:1px solid rgba(0, 229, 255, 0.25);box-shadow:inset 0 0 80px rgba(0,100,255,0.15), 0 15px 40px rgba(0,0,0,0.6);">
            <!-- High Tech Grid Background -->
            <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px);background-size:25px 25px;opacity:0.8;"></div>
            
            <svg style="position:absolute;top:0;left:0;width:100%;height:100%;" viewBox="0 0 160 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="neonGlowPitch" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <radialGradient id="centerLight" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="rgba(0, 229, 255, 0.12)"/>
                        <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
                    </radialGradient>
                </defs>
                
                <!-- Center Spotlight -->
                <rect width="160" height="100" fill="url(#centerLight)"/>
                
                <!-- Glowing Pitch Lines -->
                <g filter="url(#neonGlowPitch)" stroke="rgba(0, 229, 255, 0.4)" stroke-width="0.6" fill="none">
                    <!-- Outer border -->
                    <rect x="5" y="5" width="150" height="90" rx="3" />
                    <!-- Center line -->
                    <line x1="80" y1="5" x2="80" y2="95" />
                    <!-- Center circle -->
                    <circle cx="80" cy="50" r="14" />
                    <circle cx="80" cy="50" r="0.8" fill="rgba(0, 229, 255, 0.9)" />
                    <!-- Tactical outer ring -->
                    <circle cx="80" cy="50" r="26" stroke="rgba(0, 229, 255, 0.15)" stroke-width="0.4" stroke-dasharray="2,3" />
                    
                    <!-- Home penalty area (left) -->
                    <rect x="5" y="24" width="22" height="52" />
                    <rect x="5" y="36" width="8" height="28" />
                    <circle cx="19" cy="50" r="0.8" fill="rgba(0, 229, 255, 0.9)"/>
                    <path d="M27,42 A10,10 0 0,1 27,58" />
                    
                    <!-- Away penalty area (right) -->
                    <rect x="133" y="24" width="22" height="52" />
                    <rect x="147" y="36" width="8" height="28" />
                    <circle cx="141" cy="50" r="0.8" fill="rgba(0, 229, 255, 0.9)"/>
                    <path d="M133,42 A10,10 0 0,0 133,58" />
                    
                    <!-- Corner Arcs -->
                    <path d="M5,9 A4,4 0 0,1 9,5" />
                    <path d="M155,9 A4,4 0 0,0 151,5" />
                    <path d="M5,91 A4,4 0 0,0 9,95" />
                    <path d="M155,91 A4,4 0 0,1 151,95" />
                </g>
                
                <!-- Data aesthetics (random tech lines & HUD elements) -->
                <path d="M 5 20 L 12 20 L 16 16 L 22 16" stroke="rgba(0, 229, 255, 0.25)" stroke-width="0.4" fill="none" />
                <path d="M 155 80 L 148 80 L 144 84 L 138 84" stroke="rgba(0, 229, 255, 0.25)" stroke-width="0.4" fill="none" />
                <circle cx="22" cy="16" r="0.6" fill="rgba(0, 229, 255, 0.6)" />
                <circle cx="138" cy="84" r="0.6" fill="rgba(0, 229, 255, 0.6)" />
                <text x="8" y="10" fill="rgba(0, 229, 255, 0.3)" font-size="3" font-family="Orbitron, sans-serif">TACTICAL-HUD_V1.0</text>
                <text x="125" y="93" fill="rgba(0, 229, 255, 0.3)" font-size="3" font-family="Orbitron, sans-serif">LIVE // TRACKING</text>
            </svg>
            
            <!-- Players container -->
            <div id="pitchPlayers" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>
        </div>
    `;
    container.appendChild(pitchWrapper);

    // Render players on pitch — HUD layout
    const pitchEl = pitchWrapper.querySelector('#pitchPlayers');

    const renderPitchPlayer = (player, isHome) => {
        const el = document.createElement('div');
        const xRaw = player.x ?? 50;  // width of pitch
        const yRaw = player.y ?? 50;  // depth

        let leftPct, topPct;
        if (isHome) {
            leftPct = 5  + (yRaw / 100) * 43;
            topPct  = 5  + (xRaw / 100) * 90;
        } else {
            leftPct = 95 - (yRaw / 100) * 43;
            topPct  = 5  + (xRaw / 100) * 90;
        }

        // Home: Electric Cyan | Away: Neon Magenta
        const mainColor   = isHome ? '#00e5ff' : '#ff2a75';
        const darkColor   = isHome ? '#0033aa' : '#880033';
        
        const isCapt = player.isCaptain;
        const captStyle = isCapt ? `box-shadow: 0 0 15px ${mainColor}, inset 0 0 10px rgba(255,255,255,0.5); border: 2px solid #fff;` : `box-shadow: 0 0 10px ${mainColor}66; border: 1.5px solid ${mainColor};`;

        el.className = 'player-node';
        el.style.cssText = `position:absolute;left:${leftPct}%;top:${topPct}%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:${player.id ? 'pointer' : 'default'};z-index:2;color:${mainColor};`;
        
        el.innerHTML = `
            <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center; margin-bottom: 6px;">
                <!-- Animated Radar Pulse -->
                <div style="position:absolute; inset:-8px; border:1px solid ${mainColor}; border-radius:50%; animation: radarPulse 2s infinite; pointer-events:none;"></div>
                
                <!-- Core Diamond Node -->
                <div class="node-core" style="position:absolute; width:26px; height:26px; background:linear-gradient(135deg, ${darkColor}dd, ${mainColor}66); backdrop-filter:blur(4px); transform:rotate(45deg); display:flex; align-items:center; justify-content:center; transition:all 0.3s; ${captStyle}">
                    <span style="transform:rotate(-45deg); font-size:0.8rem; font-weight:900; color:#ffffff; font-family:'Orbitron', sans-serif; text-shadow:0 0 5px #ffffff;">${player.num}</span>
                </div>
                ${isCapt ? `<div style="position:absolute; top:-6px; right:-6px; background:gold; color:#000; font-size:0.55rem; font-weight:900; width:15px; height:15px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:5; box-shadow:0 0 8px gold;">C</div>` : ''}
            </div>
            
            <div class="name-tag" style="background:rgba(6,10,20,0.85); border:1px solid ${mainColor}40; border-radius:3px; padding:3px 6px; transition:all 0.3s; backdrop-filter:blur(3px);">
                <span style="font-size:0.6rem; color:#fff; white-space:nowrap; max-width:65px; overflow:hidden; text-overflow:ellipsis; display:block; text-align:center; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; transition:color 0.3s;">${player.name.split(' ').slice(-1)[0]}</span>
            </div>
        `;
        
        el.title = `${player.num ? '#' + player.num + ' ' : ''}${player.name}${player.isCaptain ? ' (C)' : ''}`;
        if (player.id) {
            el.addEventListener('click', () => {
                window.location.href = `player?id=${encodeURIComponent(player.id)}&name=${encodeURIComponent(player.name)}`;
            });
        }
        pitchEl.appendChild(el);
    };

    homePlayers.forEach(p => renderPitchPlayer(p, true));
    awayPlayers.forEach(p => renderPitchPlayer(p, false));

    // ── Formation labels ──
    if (homeLineup.formation || awayLineup.formation) {
        const formDiv = document.createElement('div');
        formDiv.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:0.5rem 1rem;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:1.5rem;font-size:0.9rem;font-weight:700;';
        formDiv.innerHTML = `
            <span style="color:#0066ff;">${homeTeam}: ${homeLineup.formation || '—'}</span>
            <span style="color:var(--text-secondary);">التشكيل</span>
            <span style="color:#ff3366;">${awayTeam}: ${awayLineup.formation || '—'}</span>
        `;
        container.appendChild(formDiv);
    }

    // ── Player lists side by side ──
    const listsGrid = document.createElement('div');
    listsGrid.className = 'lineups-split';
    container.appendChild(listsGrid);

    const buildColumn = (lineup, teamName, side) => {
        const col = document.createElement('div');
        col.className = `team-lineup-column ${side}`;

        let html = `<div class="lineup-title"><span>${teamName}</span>${lineup.formation ? `<span style="font-size:0.8rem;color:var(--text-secondary);">${lineup.formation}</span>` : ''}</div>`;

        if (lineup.starters.length > 0) {
            html += `<div class="lineup-sub-heading">الأساسي</div><ul class="player-list">`;
            lineup.starters.forEach(p => {
                const imgHtml = p.image && !p.image.includes('default.png')
                    ? `<img src="${p.image}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;margin-left:8px;" onerror="this.style.display='none';" loading="lazy">`
                    : '';
                const clickAttr = p.id ? `style="cursor:pointer;" onclick="window.location.href='player?id=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}'"` : '';
                html += `<li class="player-list-item" ${clickAttr}>
                    ${imgHtml}
                    <div class="player-number">${p.num}</div>
                    <span class="player-name">${p.name}${p.isCaptain ? ' <span style="color:gold;font-size:0.8rem;">(C)</span>' : ''}</span>
                </li>`;
            });
            html += `</ul>`;
        }

        if (lineup.subs.length > 0) {
            html += `<div class="lineup-sub-heading">الاحتياطي</div><ul class="player-list">`;
            lineup.subs.forEach(p => {
                const clickAttr = p.id ? `style="cursor:pointer;" onclick="window.location.href='player?id=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}'"` : '';
                html += `<li class="player-list-item" ${clickAttr}>
                    <div class="player-number">${p.num}</div>
                    <span class="player-name">${p.name}</span>
                </li>`;
            });
            html += `</ul>`;
        }

        if (lineup.coach) {
            html += `<div class="coach-wrapper"><span style="font-size:1.25rem;">👔</span> <span>المدرب: </span><span>${lineup.coach}</span></div>`;
        }

        col.innerHTML = html;
        return col;
    };

    listsGrid.appendChild(buildColumn(homeLineup, homeTeam, 'home'));
    listsGrid.appendChild(buildColumn(awayLineup, awayTeam, 'away'));
}

function showErrorMessage(arMsg, enMsg) {
    const card = document.getElementById('matchHeroCard');
    if (card) {
        card.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-lg) 0;">
                <h3 style="color: #ff6b6b; margin-bottom: 8px;">⚠️ ${currentLang === 'ar' ? arMsg : enMsg}</h3>
                <a href="matches" class="btn-back" style="margin-top: 15px;">← ${currentLang === 'ar' ? 'العودة للمباريات' : 'Back to Matches'}</a>
            </div>
        `;
    }
}


function startLivePolling(matchId, matchInfo) {
    const POLL_INTERVAL = 30000; // 30 seconds for live matches
    
    const pollDetails = async () => {
        try {
            const slug     = matchInfo.slug     || '';
            if (!slug) return;
            const koooraId = matchInfo.koooraId || matchId;
            const res = await fetch(
                `/api/details?id=${encodeURIComponent(matchId)}&slug=${encodeURIComponent(slug)}&koooraId=${encodeURIComponent(koooraId)}&live=1`,
                { cache: 'no-store' }
            );
            
            if (!res.ok) return;
            
            const details = await res.json();
            
            // Update events
            renderEvents(details);
            
            // Update stats
            renderStats(details);
            
            // Update lineups (in case of substitutions)
            renderLineups(details, matchInfo);
            
            // Update hero card score and penalty scores if changed
            if (details.homeScore !== undefined && details.awayScore !== undefined) {
                matchInfo.homeScore = details.homeScore;
                matchInfo.awayScore = details.awayScore;
                matchInfo.homePenaltyScore = details.homePenaltyScore;
                matchInfo.awayPenaltyScore = details.awayPenaltyScore;
                matchInfo.status = details.status || matchInfo.status;
                renderHeroCard(matchInfo, details, 'today');
            }
            
            // If match is no longer live, stop polling
            if (!details.isLive && details.isFinished) {
                clearInterval(pollInterval);
                console.log('Match finished, stopped live polling');
            }
        } catch (err) {
            console.error('Live polling error:', err);
        }
    };
    
    // Start polling
    const pollInterval = setInterval(pollDetails, POLL_INTERVAL);
    
    // Also poll immediately to get latest data
    pollDetails();
    
    console.log('Started live polling for match:', matchId);
}
