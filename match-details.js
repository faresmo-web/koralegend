// Match Details Controller

document.addEventListener('DOMContentLoaded', async function() {
    // Force HTTPS on production for Twitch and security policies
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        window.location.href = window.location.href.replace('http:', 'https:');
        return;
    }

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
    
    // Mobile menu toggle is already initialized globally in script.js
    
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

    // 3.5 Load stream data to link events (goals) to video clips
    window.matchStreamData = null;
    try {
        const streamRes = await fetch(`/api/streams?matchId=${encodeURIComponent(matchId)}`, { cache: 'no-store' });
        if (streamRes.ok) {
            const streamJson = await streamRes.json();
            window.matchStreamData = streamJson.stream;
        }
    } catch (_) {}

    // 4. Render everything
    renderHeroCard(matchInfo, matchDetails, dateType);
    renderEvents(matchDetails, window.matchStreamData);
    renderStats(matchDetails);
    renderLineups(matchDetails, matchInfo);
    renderStandings(matchDetails, matchInfo);

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

    // 7. Load stream link (non-blocking)
    loadAndRenderStream(matchId);
});

// ── Stream Loading ────────────────────────────────────────────
async function loadAndRenderStream(matchId) {
    try {
        const stream = window.matchStreamData;

        const tabBtn    = document.getElementById('tab-stream');
        const container = document.getElementById('mainStreamContainer');
        if (!tabBtn || !container || !stream) return;

        // Check if there is anything to show
        const hasMain  = stream.mainStream && (stream.mainStream.hlsUrl || stream.mainStream.iframeUrl || stream.mainStream.externalUrl);
        const hasZones = Array.isArray(stream.zones) && stream.zones.length > 0;
        const hasFallback = !hasMain && (stream.iframeUrl || stream.externalUrl);

        if (!hasMain && !hasZones && !hasFallback) return;

        // Show the tab
        tabBtn.classList.add('visible');

        // --- Render MAIN stream (always in mainStreamContainer) ---
        if (hasMain) {
            renderMainStream(container, stream.mainStream);
        } else if (hasFallback) {
            renderMainStream(container, { iframeUrl: stream.iframeUrl || '', externalUrl: stream.externalUrl || '' });
        } else {
            // No main stream — show placeholder so user knows clips are available
            container.innerHTML = `
            <div class="stream-card">
                <div class="stream-top-bar">
                    <div class="stream-title"><span class="live-dot"></span>أهداف ولقطات المباراة</div>
                </div>
                <div class="stream-notice">
                    <div class="notice-icon">⚽</div>
                    <p style="font-size:1rem;font-weight:700;color:var(--text-primary)">اضغط على أي هدف في الأحداث لمشاهدته</p>
                    <p style="font-size:0.85rem;color:var(--text-secondary);margin-top:6px">متوفر ${hasZones ? stream.zones.length + ' لقطة' : ''}</p>
                </div>
            </div>`;
        }

        // Store zones globally for event-clip access
        window._streamZonesData = stream.zones || [];
        window._streamHasMain   = hasMain || hasFallback;

        // Start viewer counting heartbeat
        startViewerHeartbeat(matchId);

    } catch (_) { /* silently fail */ }
}

let viewerHeartbeatInterval = null;
function startViewerHeartbeat(matchId) {
    if (viewerHeartbeatInterval) clearInterval(viewerHeartbeatInterval);
    
    let clientId = localStorage.getItem('kora_viewer_id');
    if (!clientId) {
        clientId = 'v_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('kora_viewer_id', clientId);
    }

    const beat = () => {
        fetch(`/api/streams/heartbeat?matchId=${encodeURIComponent(matchId)}&clientId=${encodeURIComponent(clientId)}`)
            .catch(() => {});
    };

    beat();
    viewerHeartbeatInterval = setInterval(beat, 20000); // Send heartbeat every 20 seconds
}

function fixTwitchUrl(url) {
    if (!url || !url.includes('player.twitch.tv')) return url;
    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('parent', window.location.hostname);
        return urlObj.toString();
    } catch (_) {
        if (url.includes('parent=')) {
            return url.replace(/parent=[^&]+/g, 'parent=' + window.location.hostname);
        }
        return url + (url.includes('?') ? '&' : '?') + 'parent=' + window.location.hostname;
    }
}

function isTwitterUrl(url) {
    if (!url) return false;
    return url.includes('x.com') || url.includes('twitter.com');
}

function extractTweetId(url) {
    if (!url) return null;
    const match = url.match(/\/(?:status|statuses)\/(\d+)/);
    return match ? match[1] : null;
}

function isM3u8Url(url) {
    if (!url) return false;
    return url.split('?')[0].endsWith('.m3u8') || url.includes('.m3u8?');
}

// ─── Gumlet helpers ─────────────────────────────────────────────
// Detects stream.gumlet.io HLS URLs (which block cross-origin XHR)
function isGumletUrl(url) {
    if (!url) return false;
    return url.includes('stream.gumlet.io') || url.includes('play.gumlet.io');
}

// Converts  https://stream.gumlet.io/{col}/{assetId}/main.m3u8
// →         https://play.gumlet.io/embed/{assetId}
function gumletToEmbedUrl(url) {
    try {
        const u = new URL(url);
        // Path: /{collectionId}/{assetId}/main.m3u8  →  parts[2] = assetId
        const parts = u.pathname.replace(/^\//, '').split('/');
        const assetId = parts[1] || parts[0];
        return `https://play.gumlet.io/embed/${assetId}`;
    } catch (_) {
        return url;
    }
}

function setupHlsPlayer(video, targetUrl) {
    const playHls = () => {
        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                maxMaxBufferLength: 10,
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(targetUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(() => {});
            });
            video.hlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari / iOS)
            video.src = targetUrl;
            video.addEventListener('loadedmetadata', function() {
                video.play().catch(() => {});
            });
        }
    };

    if (window.Hls) {
        playHls();
    } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = playHls;
        document.body.appendChild(script);
    }
}

// Renders the MAIN broadcast in mainStreamContainer
function renderMainStream(container, mainStream) {
    // Priority: hlsUrl > iframeUrl > externalUrl
    const hlsUrl    = mainStream.hlsUrl    || '';
    const iframeUrl = mainStream.iframeUrl || '';
    const extUrl    = mainStream.externalUrl || '';
    const targetUrl = hlsUrl || iframeUrl || extUrl;

    let bodyHtml = '';
    if (!targetUrl) return;

    const isM3u8 = hlsUrl ? true : isM3u8Url(targetUrl);

    if (isTwitterUrl(targetUrl)) {
        const tweetId = extractTweetId(targetUrl);
        if (tweetId) {
            bodyHtml = `
            <div class="stream-twitter-wrap" style="display:flex;justify-content:center;padding:1.5rem;background:rgba(0,0,0,0.2);border-radius:12px;min-height:250px;align-items:center;width:100%;">
                <div id="mainTweetContainer" style="width:100%;max-width:550px;">
                    <div style="text-align:center;color:var(--text-secondary);font-size:0.9rem;"><p>جاري تحميل البث...</p></div>
                </div>
            </div>`;
            setTimeout(() => {
                const el = document.getElementById('mainTweetContainer');
                if (!el) return;
                const load = () => { el.innerHTML = ''; window.twttr.widgets.createTweet(tweetId, el, { theme:'dark', align:'center', conversation:'none', width:550 }); };
                if (window.twttr?.widgets) { load(); } else {
                    const s = document.createElement('script'); s.src='https://platform.twitter.com/widgets.js'; s.async=true; document.body.appendChild(s); s.onload=load;
                }
            }, 50);
        } else {
            bodyHtml = `<div class="stream-notice"><div class="notice-icon">🐦</div><p style="font-size:1rem;font-weight:700;color:var(--text-primary)">البث موجود على X</p><a href="${targetUrl}" target="_blank" rel="noopener" class="btn-stream-ext" style="margin-top:1rem;display:inline-flex">🌐 افتحه في نافذة جديدة</a></div>`;
        }
    } else if (isM3u8) {
        let playUrl = hlsUrl || targetUrl;
        if (isGumletUrl(playUrl)) {
            // Pass Gumlet URLs through the stream proxy to bypass CORS
            playUrl = `/api/stream-proxy?url=${encodeURIComponent(playUrl)}`;
        }
        bodyHtml = `
        <div class="stream-video-wrap" style="width: 100%; background: #000; border-radius: 12px; overflow: hidden; position: relative;">
            <video id="mainStreamVideo" controls autoplay playsinline style="width:100%; display:block; aspect-ratio: 16/9; max-height: 480px;"></video>
        </div>`;
        setTimeout(() => {
            const video = document.getElementById('mainStreamVideo');
            if (!video) return;
            setupHlsPlayer(video, playUrl);
        }, 50);
    } else if (iframeUrl) {
        const finalUrl = fixTwitchUrl(iframeUrl);
        bodyHtml = `
        <div class="stream-iframe-wrap">
            <iframe id="mainStreamIframe"
                src="${finalUrl}"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
            ></iframe>
        </div>`;
    } else {
        bodyHtml = `
        <div class="stream-notice">
            <div class="notice-icon">📺</div>
            <p style="font-size:1rem;font-weight:700;color:var(--text-primary)">بث مباشر</p>
            <a href="${mainStream.externalUrl}" target="_blank" rel="noopener" class="btn-stream-ext" style="margin-top:1rem;display:inline-flex">🌐 شاهد الآن</a>
        </div>`;
    }

    const fullscreenBtn = (iframeUrl || isM3u8) && !isTwitterUrl(targetUrl)
        ? `<button class="btn-fullscreen" onclick="document.getElementById('${isM3u8 ? 'mainStreamVideo' : 'mainStreamIframe'}')?.requestFullscreen()">□ ملء الشاشة</button>` : '';
    const extBtn = extUrl
        ? `<a class="btn-stream-ext" href="${extUrl}" target="_blank" rel="noopener">🌐 نافذة جديدة</a>` : '';

    container.innerHTML = `
    <div class="stream-card">
        <div class="stream-top-bar">
            <div class="stream-title"><span class="live-dot"></span>📡 البث المباشر</div>
            <div class="stream-actions">${fullscreenBtn}${extBtn}</div>
        </div>
        ${bodyHtml}
    </div>`;
}

// Open a clip in the drawer below the main stream (does NOT touch the main stream)
function renderClipInDrawer(zone) {
    const drawer     = document.getElementById('clipsDrawer');
    const drawerBody = document.getElementById('clipsDrawerBody');
    const titleEl    = document.getElementById('clipDrawerTitle');
    const extLinkEl  = document.getElementById('clipDrawerExtLink');
    if (!drawer || !drawerBody) return;

    titleEl.textContent = (zone.isMain ? '📡' : '⚽') + ' ' + (zone.label || 'لقطة');

    if (zone.externalUrl) {
        extLinkEl.href = zone.externalUrl;
        extLinkEl.style.display = 'inline-flex';
    } else {
        extLinkEl.style.display = 'none';
    }

    const targetUrl = zone.iframeUrl || zone.externalUrl || '';
    let bodyHtml = '';

    const isM3u8 = isM3u8Url(targetUrl);

    if (isTwitterUrl(targetUrl)) {
        const tweetId = extractTweetId(targetUrl);
        if (tweetId) {
            drawerBody.innerHTML = `
            <div style="display:flex;justify-content:center;padding:1.5rem;background:rgba(0,0,0,0.2);min-height:200px;align-items:center;">
                <div id="clipTweetContainer" style="width:100%;max-width:550px;">
                    <div style="text-align:center;color:var(--text-secondary);"><p>جاري تحميل اللقطة...</p></div>
                </div>
            </div>`;
            setTimeout(() => {
                const el = document.getElementById('clipTweetContainer');
                if (!el) return;
                const load = () => { el.innerHTML=''; window.twttr.widgets.createTweet(tweetId, el, {theme:'dark',align:'center',conversation:'none',width:500}); };
                if (window.twttr?.widgets) { load(); } else {
                    const s=document.createElement('script'); s.src='https://platform.twitter.com/widgets.js'; s.async=true; document.body.appendChild(s); s.onload=load;
                }
            }, 50);
            drawer.style.display = 'block';
            return;
        } else {
            bodyHtml = `<div class="stream-notice" style="padding:2rem 1rem;"><div class="notice-icon">🐦</div><p style="font-weight:700;color:var(--text-primary)">اللقطة على X (تويتر)</p><a href="${targetUrl}" target="_blank" rel="noopener" class="btn-stream-ext" style="margin-top:1rem;display:inline-flex">🌐 افتحها في نافذة جديدة</a></div>`;
        }
    } else if (isM3u8) {
        bodyHtml = `
        <div class="stream-video-wrap" style="width: 100%; background: #000; border-radius: 12px; overflow: hidden; position: relative;">
            <video id="clipDrawerVideo" controls autoplay playsinline style="width:100%; display:block; aspect-ratio: 16/9; max-height: 480px;"></video>
        </div>`;
        setTimeout(() => {
            const video = document.getElementById('clipDrawerVideo');
            if (!video) return;
            setupHlsPlayer(video, targetUrl);
        }, 50);
    } else if (zone.iframeUrl) {
        const finalUrl = fixTwitchUrl(zone.iframeUrl);
        bodyHtml = `
        <div class="stream-iframe-wrap">
            <iframe id="clipDrawerIframe"
                src="${finalUrl}"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
            ></iframe>
        </div>`;
    } else if (zone.externalUrl) {
        bodyHtml = `<div class="stream-notice" style="padding:2rem 1rem;"><div class="notice-icon">📺</div><p style="font-weight:700;color:var(--text-primary)">${escHtml(zone.label||'مشاهدة')}</p><a href="${zone.externalUrl}" target="_blank" rel="noopener" class="btn-stream-ext" style="margin-top:1rem;display:inline-flex">🌐 شاهد الآن</a></div>`;
    }

    drawerBody.innerHTML = bodyHtml;
    drawer.style.display = 'block';
    drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeClipsDrawer() {
    const drawer = document.getElementById('clipsDrawer');
    if (!drawer) return;
    // Stop any playing iframe
    const iframe = document.getElementById('clipDrawerIframe');
    if (iframe) iframe.src = 'about:blank';
    // Stop any playing video
    const video = document.getElementById('clipDrawerVideo');
    if (video) {
        video.pause();
        video.src = '';
        video.load();
    }
    drawer.style.display = 'none';
    document.getElementById('clipsDrawerBody').innerHTML = '';
}

// Legacy: renderStreamZones now only renders clips — used by old zone-switcher (not used in new layout)
function renderStreamZones(container, zones, activeIdx) {
    // No-op in the new split layout
}

function escHtml(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}


function renderHeroCard(match, details, dateType) {
    const cardContainer = document.getElementById('matchHeroCard');
    if (!cardContainer) return;
    
    const isLive = match.isLive;
    const isUpcoming = !match.isLive && !match.isFinished;
    const statusText = match.statusAr || match.status || '';
    const isHalfTime = match.isHalfTime || statusText === 'استراحة';
    const isExtraTime = match.isExtraTime || statusText === 'وقت إضافي' || statusText === 'ركلات الترجيح' || statusText === 'و.إ';
    
    let statusClass = 'finished';
    if (isHalfTime)  statusClass = 'half-time';
    else if (isExtraTime) statusClass = 'extra-time';
    else if (isLive)      statusClass = 'live';
    else if (isUpcoming)  statusClass = 'upcoming';
    
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

function renderEvents(details, stream) {
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

        // Check if there is a highlight clip linked to this event's minute
        let watchBtnHtml = '';
        if (stream && Array.isArray(stream.zones) && evt.min) {
            const eventMinVal = parseInt(evt.min) || 0;
            const eventMinStr = String(evt.min).trim();
            const localIdx = stream.zones.findIndex(z => {
                if (z.minute == null) return false;
                const zoneMinVal = parseInt(z.minute) || 0;
                const zoneMinStr = String(z.minute).trim();
                return zoneMinVal === eventMinVal || zoneMinStr === eventMinStr;
            });
            
            if (localIdx !== -1) {
                watchBtnHtml = `
                <button class="event-watch-btn" onclick="playEventClip(${localIdx})" title="شاهد اللقطة">
                    📺 شاهد اللقطة
                </button>`;
            }
        }

        wrapper.innerHTML = `
            <div class="timeline-event-content" style="display:flex; flex-direction:column; align-items: ${evt.team === 'home' ? 'flex-end' : 'flex-start'}; gap: 4px;">
                ${infoHtml}
                ${watchBtnHtml}
            </div>
            <div class="timeline-minute-badge"><span class="min-tick">'</span>${evt.min}</div>
            <div style="grid-column: ${evt.team === 'home' ? '3' : '1'}"></div>
        `;
        
        container.appendChild(wrapper);
    });
}

// Global action: opens clip in the drawer WITHOUT closing the main stream
window.playEventClip = function(zoneIdx) {
    const zones = window._streamZonesData || [];
    if (!zones.length) return;

    const zone = zones[zoneIdx];
    if (!zone) return;

    // Switch to stream tab first if not already visible
    const tabStreamBtn = document.getElementById('tab-stream');
    if (tabStreamBtn && !document.getElementById('panel-stream')?.classList.contains('active')) {
        tabStreamBtn.click();
    }

    // Render clip in the drawer (below main stream) without touching main stream
    renderClipInDrawer(zone);

    // Scroll drawer into view smoothly
    setTimeout(() => {
        document.getElementById('clipsDrawer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
};

window.closeClipsDrawer = closeClipsDrawer;

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
        .player-node:hover .node-core { transform: scale(1.15) !important; box-shadow: 0 0 30px currentColor !important; border-width: 2.5px !important; }
        .player-node:hover .name-tag { background: currentColor !important; color: #000 !important; border-color: transparent !important; transform: scale(1.1); }
        .player-node:hover .name-tag span { color: #000 !important; font-weight: 900 !important; }
        </style>

        <div style="position:relative;width:100%;padding-bottom:62%;border-radius:16px;overflow:hidden;background:#2d7a1f;border:2px solid rgba(0,0,0,0.4);box-shadow:0 15px 40px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.2);">
            <!-- Grass Stripes -->
            <div style="position:absolute;inset:0;background-image:repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 20px, transparent 20px, transparent 40px);pointer-events:none;"></div>
            
            <svg style="position:absolute;top:0;left:0;width:100%;height:100%;" viewBox="0 0 160 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="pitchLight" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stop-color="rgba(255,255,255,0.07)"/>
                        <stop offset="100%" stop-color="rgba(0,0,0,0.15)"/>
                    </radialGradient>
                </defs>
                
                <!-- Pitch vignette light -->
                <rect width="160" height="100" fill="url(#pitchLight)"/>
                
                <!-- Pitch Lines (white like real football) -->
                <g stroke="rgba(255,255,255,0.92)" stroke-width="0.7" fill="none">
                    <!-- Outer border -->
                    <rect x="5" y="5" width="150" height="90" />
                    <!-- Center line -->
                    <line x1="80" y1="5" x2="80" y2="95" />
                    <!-- Center circle -->
                    <circle cx="80" cy="50" r="14" />
                    <!-- Center spot -->
                    <circle cx="80" cy="50" r="0.9" fill="rgba(255,255,255,0.9)" stroke="none"/>
                    
                    <!-- Home penalty area (left) -->
                    <rect x="5" y="24" width="22" height="52" />
                    <rect x="5" y="36" width="8" height="28" />
                    <!-- Home penalty spot -->
                    <circle cx="19" cy="50" r="0.8" fill="rgba(255,255,255,0.9)" stroke="none"/>
                    <path d="M27,42 A10,10 0 0,1 27,58" />
                    
                    <!-- Away penalty area (right) -->
                    <rect x="133" y="24" width="22" height="52" />
                    <rect x="147" y="36" width="8" height="28" />
                    <!-- Away penalty spot -->
                    <circle cx="141" cy="50" r="0.8" fill="rgba(255,255,255,0.9)" stroke="none"/>
                    <path d="M133,42 A10,10 0 0,0 133,58" />
                    
                    <!-- Corner Arcs -->
                    <path d="M5,9 A4,4 0 0,1 9,5" />
                    <path d="M155,9 A4,4 0 0,0 151,5" />
                    <path d="M5,91 A4,4 0 0,0 9,95" />
                    <path d="M155,91 A4,4 0 0,1 151,95" />
                </g>
                
                <!-- Goalmouth lines -->
                <line x1="5" y1="5" x2="155" y2="5" stroke="rgba(255,255,255,0.92)" stroke-width="0.7"/>
                <line x1="5" y1="95" x2="155" y2="95" stroke="rgba(255,255,255,0.92)" stroke-width="0.7"/>
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

        // Home: Blue | Away: Red — clear on green pitch
        const mainColor   = isHome ? '#3b9dff' : '#ff4444';
        const ringColor   = isHome ? 'rgba(59,157,255,0.7)' : 'rgba(255,68,68,0.7)';
        
        const isCapt = player.isCaptain;
        const captStyle = isCapt ? `box-shadow: 0 0 12px ${mainColor}, 0 0 0 2px #fff; border: 2.5px solid #fff;` : `box-shadow: 0 2px 8px rgba(0,0,0,0.5); border: 2px solid ${mainColor};`;

        el.className = 'player-node';
        el.style.cssText = `position:absolute;left:${leftPct}%;top:${topPct}%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:${player.id ? 'pointer' : 'default'};z-index:2;color:${mainColor};`;
        
        el.innerHTML = `
            <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center; margin-bottom: 5px;">
                <!-- Animated Radar Pulse -->
                <div style="position:absolute; inset:-8px; border:1px solid ${ringColor}; border-radius:50%; animation: radarPulse 2s infinite; pointer-events:none;"></div>
                
                <!-- Player Photo Circle -->
                <div class="node-core" style="position:absolute; width:40px; height:40px; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; transition:all 0.3s; ${captStyle} background:#1a2a40;">
                    ${player.image
                        ? `<img src="${player.image}" alt="${player.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.parentNode.querySelector('.fallback-num').style.display='flex';">`
                        : ''
                    }
                    <span class="fallback-num" style="${player.image ? 'display:none;' : 'display:flex;'} align-items:center; justify-content:center; width:100%; height:100%; font-size:0.8rem; font-weight:900; color:#ffffff; font-family:'Orbitron', sans-serif; text-shadow:0 0 5px #ffffff;">${player.num}</span>
                </div>
                ${isCapt ? `<div style="position:absolute; top:-6px; right:-6px; background:gold; color:#000; font-size:0.55rem; font-weight:900; width:15px; height:15px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:5; box-shadow:0 0 8px gold;">C</div>` : ''}
            </div>
            
            <div class="name-tag" style="background:rgba(0,0,0,0.75); border:1px solid ${mainColor}70; border-radius:4px; padding:2px 5px; transition:all 0.3s; backdrop-filter:blur(4px);">
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

function renderStandings(details, matchInfo) {
    const container = document.getElementById('standingsContainer');
    if (!container) return;

    const sData = details ? details.standings : null;
    if (!sData || !sData.list_match || sData.list_match.length === 0) {
        container.innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:2rem;">الترتيب غير متاح حالياً لهذه المباراة</p>`;
        return;
    }

    let html = '';

    // Extract stages
    const stages = sData.stages || [];
    const listMatch = sData.list_match;

    // Loop over each stage in list_match
    listMatch.forEach((stageItem, stageIdx) => {
        const stageInfo = stages[stageIdx] || {};
        const stageName = stageInfo.title || '';

        if (stageName && listMatch.length > 1) {
            html += `<h3 style="font-size:1.1rem;color:var(--primary-color);margin:1.5rem 0 0.75rem;font-weight:700;">${stageName}</h3>`;
        }

        // Parse groups / tables in this stage
        const groupKeys = Object.keys(stageItem || {});
        if (groupKeys.length === 0) return;

        // Check if it's a flat array or a dictionary of groups
        const firstKey = groupKeys[0];
        const firstVal = stageItem[firstKey];

        // Let's check if the firstVal is a team object (has team_name or points)
        const isFlatTable = firstVal && (firstVal.team_name || firstVal.points !== undefined);

        const groupsToRender = [];
        if (isFlatTable) {
            const teams = Object.values(stageItem).sort((a, b) => {
                const diffA = a.diff ?? 0;
                const diffB = b.diff ?? 0;
                const ptsA = a.points ?? 0;
                const ptsB = b.points ?? 0;
                if (ptsA !== ptsB) return ptsB - ptsA;
                return diffB - diffA;
            });
            groupsToRender.push({ name: '', teams });
        } else {
            groupKeys.forEach(gName => {
                const gObj = stageItem[gName] || {};
                const teams = Object.values(gObj).sort((a, b) => {
                    const diffA = a.diff ?? 0;
                    const diffB = b.diff ?? 0;
                    const ptsA = a.points ?? 0;
                    const ptsB = b.points ?? 0;
                    if (ptsA !== ptsB) return ptsB - ptsA;
                    return diffB - diffA;
                });
                const groupTitle = gName.length === 1 ? `المجموعة ${gName}` : gName;
                groupsToRender.push({ name: groupTitle, teams });
            });
        }

        // Render each group
        groupsToRender.forEach(g => {
            if (g.name) {
                html += `<h4 style="font-size:0.95rem;color:var(--text-secondary);margin:1.2rem 0 0.5rem;font-weight:600;">${g.name}</h4>`;
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
                                <th>له:عليه</th>
                                <th>الفارق</th>
                                <th>النقاط</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            g.teams.forEach((team, idx) => {
                const pos = idx + 1;
                const teamNameObj = team.team_name || {};
                const name = teamNameObj.title || teamNameObj.short_title || team.name || '';
                const logo = teamNameObj.image || '';
                
                const played = team.play ?? 0;
                const won = team.wins ?? 0;
                const drawn = team.draw ?? 0;
                const lost = team.lose ?? 0;
                const goalsFor = team.for ?? 0;
                const goalsAgainst = team.against ?? 0;
                const gd = team.diff ?? 0;
                const pts = team.points ?? 0;

                // Check highlight (is home or away team of this match)
                const isHome = matchInfo && (team.team_id == matchInfo.homeId || name === matchInfo.homeTeam);
                const isAway = matchInfo && (team.team_id == matchInfo.awayId || name === matchInfo.awayTeam);
                const highlightClass = (isHome || isAway) ? 'highlight-row' : '';

                // Add special style to top/relegation position indicator
                let posClass = '';
                if (pos <= 2) posClass = 'pos-top';
                else if (pos === 3 || pos === 4) posClass = 'pos-qual';
                else if (g.teams.length > 4 && pos >= g.teams.length - 1) posClass = 'pos-rel';

                // Border style from team note / color
                let borderRightStyle = '';
                if (team.color) {
                    borderRightStyle = `style="border-right: 3px solid ${team.color};"`;
                } else if (team.team_note && team.team_note.color) {
                    borderRightStyle = `style="border-right: 3px solid ${team.team_note.color};"`;
                }

                html += `
                    <tr class="${highlightClass}" ${borderRightStyle}>
                        <td><span class="standing-pos ${posClass}">${pos}</span></td>
                        <td>
                            <div class="team-cell">
                                ${logo ? `<img src="${logo}" alt="${name}" onerror="this.style.display='none'" loading="lazy">` : '⚽'}
                                <span style="font-weight:600;">${name}</span>
                            </div>
                        </td>
                        <td>${played}</td>
                        <td>${won}</td>
                        <td>${drawn}</td>
                        <td>${lost}</td>
                        <td>${goalsFor}:${goalsAgainst}</td>
                        <td>${gd > 0 ? '+' + gd : gd}</td>
                        <td style="font-weight:800;color:var(--primary-color);">${pts}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });
    });

    container.innerHTML = html;
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
            renderEvents(details, window.matchStreamData);
            
            // Update stats
            renderStats(details);
            
            // Update lineups (in case of substitutions)
            renderLineups(details, matchInfo);

            // Update standings
            renderStandings(details, matchInfo);
            
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
