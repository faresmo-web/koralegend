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
    
    const homeScore = match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '-';
    const awayScore = match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '-';
    
    const homePenalty = match.homePenaltyScore !== undefined && match.homePenaltyScore !== null ? match.homePenaltyScore : (details?.homePenaltyScore ?? null);
    const awayPenalty = match.awayPenaltyScore !== undefined && match.awayPenaltyScore !== null ? match.awayPenaltyScore : (details?.awayPenaltyScore ?? null);
    
    const hasPenalty = homePenalty !== null && awayPenalty !== null;
    const penaltyHtml = hasPenalty 
        ? `<div class="match-hero-penalty-badge" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.03)); border: 1px solid rgba(255, 215, 0, 0.45); color: #ffd700; padding: 4px 12px; border-radius: 12px; font-size: 0.82rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); direction: rtl; font-family: 'Cairo', 'Orbitron', sans-serif;">
            <span>ركلات الترجيح:</span>
            <span style="font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">${homePenalty} - ${awayPenalty}</span>
           </div>`
        : '';

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
            
            <!-- Center Score -->
            <div class="match-hero-center">
                <div class="match-hero-score">
                    <span class="${isLive ? 'score-live-pulse' : ''}">${homeScore}</span>
                    <span>-</span>
                    <span class="${isLive ? 'score-live-pulse' : ''}">${awayScore}</span>
                </div>
                <span class="match-hero-status ${statusClass}">${match.status}</span>
                ${penaltyHtml}
                <span style="font-size: 0.85rem; color: var(--text-secondary); font-family: 'Orbitron', sans-serif; margin-top: 4px;">${match.time}</span>
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
        // Skip referee metadata or 0 min metadata if it's empty
        if (evt.min === '0' && !evt.descText) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = `timeline-event-wrapper ${evt.team}`;
        
        let icon = '📢';
        let detailText = '';
        let playerText = evt.descText;
        
        if (evt.type === 'goal') {
            icon = '⚽';
            detailText = currentLang === 'ar' ? 'هدف لصالح الفريق' : 'Goal Scored';
        } else if (evt.type === 'penalty') {
            icon = '⚽';
            playerText += currentLang === 'ar' ? ' (ركلة جزاء)' : ' (Pen)';
            detailText = currentLang === 'ar' ? 'ركلة جزاء ناجحة' : 'Penalty Goal';
        } else if (evt.type === 'own-goal') {
            icon = '⚽';
            playerText += currentLang === 'ar' ? ' (هدف في مرماه)' : ' (Own Goal)';
            detailText = currentLang === 'ar' ? 'هدف عكسي' : 'Own Goal';
        } else if (evt.type === 'yellow') {
            icon = '🟨';
            detailText = currentLang === 'ar' ? 'بطاقة صفراء' : 'Yellow Card';
        } else if (evt.type === 'red') {
            icon = '🟥';
            detailText = currentLang === 'ar' ? 'بطاقة حمراء' : 'Red Card';
        } else if (evt.type === 'sub') {
            icon = '🔄';
            detailText = currentLang === 'ar' ? 'تبديل' : 'Substitution';
        }
        
        wrapper.innerHTML = `
            <div class="timeline-minute-badge">${evt.min}'</div>
            <div class="timeline-event-item">
                <div>
                    <span class="event-type-icon">${icon}</span>
                    <span class="event-player">${playerText}</span>
                </div>
                <div class="event-detail">${detailText}</div>
            </div>
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

    // Pitch SVG background — horizontal layout (home=left, away=right)
    pitchWrapper.innerHTML = `
        <div style="position:relative;width:100%;padding-bottom:60%;border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,0.15);box-shadow:0 8px 32px rgba(0,0,0,0.6);">
            <!-- Pitch base with stripe pattern -->
            <svg style="position:absolute;top:0;left:0;width:100%;height:100%;" viewBox="0 0 160 96" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Stripe background -->
                <defs>
                    <pattern id="stripes" x="0" y="0" width="20" height="96" patternUnits="userSpaceOnUse">
                        <rect width="10" height="96" fill="#2d9e4a"/>
                        <rect x="10" width="10" height="96" fill="#2a9145"/>
                    </pattern>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="35%">
                        <stop offset="0%" stop-color="rgba(255,255,255,0.07)"/>
                        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
                    </radialGradient>
                </defs>
                <rect width="160" height="96" fill="url(#stripes)"/>
                <rect width="160" height="96" fill="url(#centerGlow)"/>
                <!-- Outer border -->
                <rect x="2" y="2" width="156" height="92" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.7"/>
                <!-- Center line -->
                <line x1="80" y1="2" x2="80" y2="94" stroke="rgba(255,255,255,0.7)" stroke-width="0.7"/>
                <!-- Center circle -->
                <circle cx="80" cy="48" r="11" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.7"/>
                <circle cx="80" cy="48" r="1" fill="rgba(255,255,255,0.9)"/>
                <!-- Home penalty area (left) -->
                <rect x="2" y="22" width="24" height="52" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.7"/>
                <rect x="2" y="33" width="11" height="30" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.7"/>
                <circle cx="18" cy="48" r="5.5" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" stroke-dasharray="2,1"/>
                <!-- Away penalty area (right) -->
                <rect x="134" y="22" width="24" height="52" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.7"/>
                <rect x="147" y="33" width="11" height="30" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.7"/>
                <circle cx="142" cy="48" r="5.5" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" stroke-dasharray="2,1"/>
                <!-- Goals -->
                <rect x="0" y="40" width="2" height="16" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.8)" stroke-width="0.4"/>
                <rect x="158" y="40" width="2" height="16" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.8)" stroke-width="0.4"/>
                <!-- Corner arcs -->
                <path d="M2,2 A3,3 0 0,1 5,5" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="0.6"/>
                <path d="M158,2 A3,3 0 0,0 155,5" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="0.6"/>
                <path d="M2,94 A3,3 0 0,0 5,91" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="0.6"/>
                <path d="M158,94 A3,3 0 0,1 155,91" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="0.6"/>
            </svg>
            <!-- Players container -->
            <div id="pitchPlayers" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>
        </div>
    `;
    container.appendChild(pitchWrapper);

    // Render players on pitch — horizontal layout
    // kooora coords: x=0-100 (left=right flank, right=left flank / width of pitch)
    //                y=0-100 (0=own goal/keeper, 100=opponent goal/striker)
    // On horizontal pitch: y → left/right position, x → top/bottom position
    // Home team on LEFT half, Away team on RIGHT half (mirrored)
    const pitchEl = pitchWrapper.querySelector('#pitchPlayers');

    const renderPitchPlayer = (player, isHome) => {
        const el = document.createElement('div');
        const xRaw = player.x ?? 50;  // width of pitch (0-100), maps to top%
        const yRaw = player.y ?? 50;  // depth from own goal (0=keeper, 100=striker), maps to left%

        // Pitch usable area: left 3%–97%, top 3%–97%
        // y (depth) → horizontal position
        // x (width) → vertical position
        let leftPct, topPct;
        if (isHome) {
            // Home on left: y=0 (keeper) → left=3%, y=100 (striker) → left=50%
            leftPct = 3  + (yRaw / 100) * 47;
            topPct  = 3  + (xRaw / 100) * 94;
        } else {
            // Away on right (mirrored): y=0 (keeper) → left=97%, y=100 (striker) → left=50%
            leftPct = 97 - (yRaw / 100) * 47;
            topPct  = 3  + (xRaw / 100) * 94;
        }

        // Circle style: home = black, away = white
        const circleBg     = isHome ? '#111' : '#fff';
        const circleColor  = isHome ? '#fff' : '#111';
        const circleBorder = isHome ? '2.5px solid rgba(255,255,255,0.8)' : '2.5px solid rgba(0,0,0,0.25)';
        const captainRing  = player.isCaptain ? `outline:2px solid gold;outline-offset:2px;` : '';

        el.style.cssText = `position:absolute;left:${leftPct}%;top:${topPct}%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;cursor:${player.id ? 'pointer' : 'default'};z-index:2;`;
        el.innerHTML = `
            <div style="width:36px;height:36px;border-radius:50%;background:${circleBg};border:${circleBorder};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.7);${captainRing}transition:transform 0.15s;">
                <span style="font-size:0.82rem;font-weight:800;color:${circleColor};font-family:'Orbitron',sans-serif;line-height:1;">${player.num}</span>
            </div>
            <span style="font-size:0.6rem;color:white;text-shadow:0 1px 4px rgba(0,0,0,1),0 0 8px rgba(0,0,0,0.9);white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis;text-align:center;font-weight:600;">${player.name.split(' ').slice(-1)[0]}</span>
        `;
        el.title = `${player.num ? '#' + player.num + ' ' : ''}${player.name}${player.isCaptain ? ' (C)' : ''}`;
        if (player.id) {
            el.addEventListener('mouseenter', () => el.querySelector('div').style.transform = 'scale(1.15)');
            el.addEventListener('mouseleave', () => el.querySelector('div').style.transform = 'scale(1)');
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
