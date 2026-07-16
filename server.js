// ============================================================
//  KoraLegend Live Server
//  - Serves static files (HTML/CSS/JS)
//  - /api/matches  → live matches from ysscores (cached 60s)
//  - /api/details/:id → live match details (cached 30s for live, 5min for finished)
//  Usage: node server.js
//         node server.js --port=8080
// ============================================================

const http      = require('http');
const fs        = require('fs');
const path      = require('path');
const crypto    = require('crypto');
const axios     = require('axios');
const webPush   = require('web-push');
const ysscores  = require('./ysscores');

// ── Config ───────────────────────────────────────────────────
const rawPort  = process.env.PORT || process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || '3000';
const PORT     = isNaN(rawPort) ? rawPort : parseInt(rawPort, 10);
const TIMEZONE = 'Africa/Cairo';
const BASE_URL = 'https://www.kooora.com';
const HEADERS  = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/json,*/*',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
    'Referer':         'https://www.kooora.com/',
};

// ── Streams (Admin) Setup ────────────────────────────────────
const STREAMS_FILE   = path.join(__dirname, 'streams.json');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kora2024';

if (ADMIN_PASSWORD === 'kora2024') {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: You are using the default ADMIN_PASSWORD ("kora2024"). Please set a strong ADMIN_PASSWORD in environment variables in production!');
}

function loadStreams() {
    try {
        if (fs.existsSync(STREAMS_FILE)) {
            return JSON.parse(fs.readFileSync(STREAMS_FILE, 'utf8'));
        }
    } catch { }
    return {};
}

function saveStreams(streams) {
    try { fs.writeFileSync(STREAMS_FILE, JSON.stringify(streams, null, 2), 'utf8'); } catch { }
}

// In-memory sessions store (token -> expiry timestamp)
const sessions = new Map();

// Parse cookies helper
function parseCookies(req) {
    const list = {};
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name.trim();
        if (!name) return;
        const val = rest.join('=').trim();
        list[name] = decodeURIComponent(val);
    });

    return list;
}

function checkAdminAuth(req) {
    const cookies = parseCookies(req);
    const token = cookies['admin_session'] || '';
    if (!token || !sessions.has(token)) return false;

    const expiry = sessions.get(token);
    if (Date.now() > expiry) {
        sessions.delete(token); // expired
        return false;
    }
    // Extend session (refresh expiry) on activity - 2 hours
    sessions.set(token, Date.now() + 2 * 60 * 60 * 1000);
    return true;
}

// Simple Rate Limiting for Login (IP -> { count, lockUntil })
const loginLimits = new Map();

function isLoginIpBlocked(ip) {
    const limit = loginLimits.get(ip);
    if (!limit) return false;
    if (Date.now() < limit.lockUntil) return true;
    // Lock expired, reset
    loginLimits.delete(ip);
    return false;
}

function recordLoginAttempt(ip, success) {
    if (success) {
        loginLimits.delete(ip);
        return;
    }
    let limit = loginLimits.get(ip) || { count: 0, lockUntil: 0 };
    limit.count++;
    if (limit.count >= 5) {
        limit.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
        console.warn(`🔒 IP ${ip} blocked for 15 minutes due to multiple login failures.`);
    }
    loginLimits.set(ip, limit);
}

function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
}

// POST /api/admin/login
async function handleAdminLogin(req, res) {
    const ip = getClientIp(req);
    if (isLoginIpBlocked(ip)) {
        return sendError(res, 429, 'محاولات كثيرة خاطئة. تم حظرك مؤقتاً لمدة 15 دقيقة.');
    }

    try {
        const body = await readBody(req);
        const user = body.username || '';
        const pwd = body.password || '';
        if (user === ADMIN_USERNAME && pwd === ADMIN_PASSWORD) {
            // Success, create session
            const token = crypto.randomBytes(32).toString('hex');
            const expiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
            sessions.set(token, expiry);
            recordLoginAttempt(ip, true);

            // Set cookie: HttpOnly, Secure if on https, SameSite Strict, Path /
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Set-Cookie': `admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200`
            });
            res.end(JSON.stringify({ ok: true }));
        } else {
            recordLoginAttempt(ip, false);
            sendError(res, 401, 'كلمة السر غير صحيحة!');
        }
    } catch {
        sendError(res, 400, 'Invalid JSON body');
    }
}

// POST /api/admin/logout
function handleAdminLogout(req, res) {
    const cookies = parseCookies(req);
    const token = cookies['admin_session'] || '';
    if (token) sessions.delete(token);

    // Expire the cookie
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': 'admin_session=; HttpOnly; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    });
    res.end(JSON.stringify({ ok: true }));
}

// GET  /api/streams?matchId=xxx  → public, returns stream for one match
// GET  /api/admin/streams        → admin, returns all streams
// POST /api/admin/streams        → admin, upsert stream
// DELETE /api/admin/streams?matchId=xxx → admin, remove stream

function handleGetStream(req, res) {
    const url     = new URL(req.url, 'http://localhost');
    const matchId = url.searchParams.get('matchId') || '';
    if (!matchId) return sendJSON(res, { stream: null });
    const streams = loadStreams();
    sendJSON(res, { stream: streams[matchId] || null });
}

function handleAdminGetStreams(req, res) {
    if (!checkAdminAuth(req)) return sendError(res, 401, 'Unauthorized');
    sendJSON(res, loadStreams());
}

async function handleAdminUpsertStream(req, res) {
    if (!checkAdminAuth(req)) return sendError(res, 401, 'Unauthorized');
    try {
        const body    = await readBody(req);
        const matchId = body.matchId || '';
        if (!matchId) return sendError(res, 400, 'matchId required');
        const streams = loadStreams();
        streams[matchId] = {
            mainStream:   body.mainStream || { iframeUrl: '', externalUrl: '' },
            zones:        Array.isArray(body.zones) ? body.zones : [], // highlights/goals
            homeTeam:     body.homeTeam  || '',
            awayTeam:     body.awayTeam  || '',
            updatedAt:    new Date().toISOString(),
        };
        saveStreams(streams);
        sendJSON(res, { ok: true, stream: streams[matchId] });
    } catch (e) {
        sendError(res, 400, e.message);
    }
}

function handleAdminDeleteStream(req, res) {
    if (!checkAdminAuth(req)) return sendError(res, 401, 'Unauthorized');
    const url     = new URL(req.url, 'http://localhost');
    const matchId = url.searchParams.get('matchId') || '';
    if (!matchId) return sendError(res, 400, 'matchId required');
    const streams = loadStreams();
    delete streams[matchId];
    saveStreams(streams);
    sendJSON(res, { ok: true });
}

// ── Real-Time Viewer Tracking ────────────────────────────────
const activeViewers = {}; // matchId -> { clientId: lastSeenTimestamp }

function getActiveViewerCount(matchId) {
    const now = Date.now();
    const viewers = activeViewers[matchId] || {};
    let count = 0;
    for (const [clientId, ts] of Object.entries(viewers)) {
        if (now - ts < 35000) { // 35 seconds threshold
            count++;
        } else {
            delete viewers[clientId];
        }
    }
    return count;
}

function handleStreamHeartbeat(req, res) {
    const url      = new URL(req.url, 'http://localhost');
    const matchId  = url.searchParams.get('matchId')  || '';
    const clientId = url.searchParams.get('clientId') || '';

    if (!matchId || !clientId) return sendJSON(res, { ok: false });

    if (!activeViewers[matchId]) {
        activeViewers[matchId] = {};
    }
    activeViewers[matchId][clientId] = Date.now();
    sendJSON(res, { ok: true });
}

function handleAdminGetViewers(req, res) {
    if (!checkAdminAuth(req)) return sendError(res, 401, 'Unauthorized');
    const counts = {};
    for (const matchId of Object.keys(activeViewers)) {
        counts[matchId] = getActiveViewerCount(matchId);
    }
    sendJSON(res, counts);
}

// ── VAPID / Push Setup ───────────────────────────────────────
const VAPID_FILE   = path.join(__dirname, 'vapid-keys.json');
const SUBS_FILE    = path.join(__dirname, 'subscriptions.json');

let vapidKeys;
try {
    vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
    console.log('🔑 Loaded existing VAPID keys');
} catch {
    vapidKeys = webPush.generateVAPIDKeys();
    fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), 'utf8');
    console.log('🔑 Generated new VAPID keys');
}

webPush.setVapidDetails(
    'https://www.koralegend.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

function loadSubscriptions() {
    try {
        if (fs.existsSync(SUBS_FILE)) {
            return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
        }
    } catch { }
    return [];
}

function saveSubscriptions(subs) {
    try { fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2), 'utf8'); } catch { }
}

// Push all subscribed clients a message; remove dead subs automatically
async function sendPushToAll(payload) {
    const subs = loadSubscriptions();
    const dead = [];
    console.log(`[Push] Attempting to send to ${subs.length} subscriber(s)...`);
    await Promise.allSettled(
        subs.map(async sub => {
            try {
                console.log(`[Push] Sending to: ${sub.endpoint.substring(0, 50)}...`);
                await webPush.sendNotification(sub, JSON.stringify(payload));
                console.log(`[Push] ✓ Sent successfully`);
            } catch (e) {
                console.error(`[Push] ✗ Error sending:`, {
                    statusCode: e.statusCode,
                    message: e.message,
                    code: e.code,
                    body: e.body
                });
                if (e.statusCode === 410 || e.statusCode === 404) {
                    dead.push(sub.endpoint);
                    console.log(`[Push] Marked as dead (${e.statusCode})`);
                }
            }
        })
    );
    if (dead.length) {
        const cleaned = subs.filter(s => !dead.includes(s.endpoint));
        saveSubscriptions(cleaned);
        console.log(`[Push] Cleaned ${dead.length} dead subscription(s)`);
    }
}

// ── In-memory cache ──────────────────────────────────────────
const cache = new Map(); // key → { data, ts, ttl }

function getCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > entry.ttl) { cache.delete(key); return null; }
    return entry.data;
}
function setCache(key, data, ttlMs) {
    cache.set(key, { data, ts: Date.now(), ttl: ttlMs });
}

// ── Kooora helpers ───────────────────────────────────────────
let cachedBuildId = null;
let buildIdTs     = 0;

async function getBuildId(forceRefresh = false) {
    // Cache for 5 minutes only (kooora deploys frequently)
    if (!forceRefresh && cachedBuildId && Date.now() - buildIdTs < 5 * 60 * 1000) return cachedBuildId;
    const r = await axios.get(BASE_URL, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const m = html.match(/"buildId":"([^"]+)"/);
    if (!m) throw new Error('buildId not found');
    cachedBuildId = m[1];
    buildIdTs     = Date.now();
    return cachedBuildId;
}

function extractNextData(html) {
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    return m ? JSON.parse(m[1]) : null;
}

function formatTime(startDate) {
    if (!startDate) return '';
    try {
        return new Date(startDate).toLocaleTimeString('ar-EG', {
            hour: '2-digit', minute: '2-digit',
            timeZone: TIMEZONE, hour12: false,
        });
    } catch { return ''; }
}

function mapStatus(m) {
    const s = m.status;
    if (s === 'FIXTURE')   return { en: 'Upcoming',  ar: 'قادمة',    isLive: false, isFinished: false, isHalfTime: false, isExtraTime: false };
    if (s === 'RESULT')    return { en: 'Finished',  ar: 'انتهت',    isLive: false, isFinished: true,  isHalfTime: false, isExtraTime: false };
    if (s === 'POSTPONED') return { en: 'Postponed', ar: 'مؤجلة',   isLive: false, isFinished: false, isHalfTime: false, isExtraTime: false };
    if (s === 'CANCELLED') return { en: 'Cancelled', ar: 'ملغاة',   isLive: false, isFinished: false, isHalfTime: false, isExtraTime: false };
    if (s === 'LIVE' || s === 'IN_PROGRESS') {
        const min  = m.period?.minute;
        const type = m.period?.type;
        if (type === 'HALF_TIME')  return { en: 'HT',  ar: 'استراحة',      isLive: true, isFinished: false, isHalfTime: true,  isExtraTime: false };
        if (type === 'EXTRA_TIME') return { en: 'ET',  ar: 'وقت إضافي',    isLive: true, isFinished: false, isHalfTime: false, isExtraTime: true  };
        if (type === 'PENALTY')    return { en: 'PEN', ar: 'ركلات الترجيح', isLive: true, isFinished: false, isHalfTime: false, isExtraTime: true  };
        if (min && min > 90)       return { en: `${min}'`, ar: `${min}'`,    isLive: true, isFinished: false, isHalfTime: false, isExtraTime: true  };
        return { en: min ? `${min}'` : 'Live', ar: min ? `${min}'` : 'مباشر', isLive: true, isFinished: false, isHalfTime: false, isExtraTime: false };
    }
    return { en: s || 'Unknown', ar: s || 'غير معروف', isLive: false, isFinished: false, isHalfTime: false, isExtraTime: false };
}

// ── ysscores: fetch date-based matches ─────────────────────
function ysscoresDateStr(dateStr) {
    const getLocalCairoDateObj = (offsetDays = 0) => {
        const d = new Date();
        if (offsetDays !== 0) {
            d.setDate(d.getDate() + offsetDays);
        }
        return d.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
    };

    if (dateStr === 'today') return getLocalCairoDateObj(0);
    if (dateStr === 'yesterday') return getLocalCairoDateObj(-1);
    if (dateStr === 'tomorrow') return getLocalCairoDateObj(1);
    return dateStr;
}

async function fetchMatchesYSScores(dateStr = 'today') {
    const realDate = ysscoresDateStr(dateStr);
    return ysscores.fetchMatchesForDate(realDate, dateStr);
}

// ── ESPN API for date-based matches (FALLBACK) ────────────────
const ESPN_LEAGUES = [
    // International — most important (World Cup 2026 is active now!)
    { id: 'fifa.world',     name: 'كأس العالم 2026',             country: 'دولي' },
    { id: 'uefa.nations',   name: 'دوري الأمم الأوروبية',        country: 'أوروبا' },
    { id: 'concacaf.nations.league', name: 'دوري أمم الكونكاكاف', country: 'دولي' },
    { id: 'conmebol.copa',  name: 'كوبا أمريكا',                 country: 'دولي' },
    { id: 'conmebol.world', name: 'تصفيات كأس العالم - كونميبول', country: 'دولي' },
    // Europe
    { id: 'eng.1',          name: 'الدوري الإنجليزي الممتاز',   country: 'إنجلترا' },
    { id: 'esp.1',          name: 'الدوري الإسباني',             country: 'إسبانيا' },
    { id: 'ger.1',          name: 'الدوري الألماني',             country: 'ألمانيا' },
    { id: 'ita.1',          name: 'الدوري الإيطالي',             country: 'إيطاليا' },
    { id: 'fra.1',          name: 'الدوري الفرنسي',              country: 'فرنسا' },
    { id: 'ned.1',          name: 'الدوري الهولندي',             country: 'هولندا' },
    { id: 'por.1',          name: 'الدوري البرتغالي',            country: 'البرتغال' },
    { id: 'tur.1',          name: 'الدوري التركي',               country: 'تركيا' },
    { id: 'uefa.champions', name: 'دوري أبطال أوروبا',           country: 'أوروبا' },
    { id: 'uefa.europa',    name: 'الدوري الأوروبي',             country: 'أوروبا' },
    { id: 'uefa.europa.conf', name: 'دوري المؤتمر الأوروبي',    country: 'أوروبا' },
    // Arab
    { id: 'sau.1',          name: 'دوري روشن السعودي',           country: 'السعودية' },
    { id: 'uae.league',     name: 'دوري الخليج العربي',          country: 'الإمارات' },
    { id: 'uae.1',          name: 'دوري ADNOC الإماراتي',        country: 'الإمارات' },
    { id: 'qat.1',          name: 'دوري نجوم قطر',               country: 'قطر' },
    { id: 'mar.1',          name: 'البطولة المغربية',             country: 'المغرب' },
];

const ESPN_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
};

function espnDateStr(dateStr) {
    // Convert YYYY-MM-DD → YYYYMMDD for ESPN
    if (dateStr === 'today')     return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE }).replace(/-/g, '');
    if (dateStr === 'yesterday') { const d = new Date(); d.setDate(d.getDate()-1); return d.toLocaleDateString('en-CA', { timeZone: TIMEZONE }).replace(/-/g, ''); }
    if (dateStr === 'tomorrow')  { const d = new Date(); d.setDate(d.getDate()+1); return d.toLocaleDateString('en-CA', { timeZone: TIMEZONE }).replace(/-/g, ''); }
    return dateStr.replace(/-/g, '');
}

function mapEspnStatus(event) {
    const type = event.status?.type;
    const state = type?.state; // 'pre', 'in', 'post'
    const completed = type?.completed;
    const desc = type?.shortDetail || type?.description || '';
    const descLower = desc.toLowerCase();

    if (state === 'in') {
        const clock = event.status?.displayClock || '';
        const period = event.status?.period || 1;
        // Half time
        if (descLower.includes('half time') || descLower.includes('halftime') || descLower.includes('ht') || descLower === 'end of 1st half') {
            return { ar: 'استراحة', isLive: true, isFinished: false, isHalfTime: true, isExtraTime: false };
        }
        // Extra time / penalties
        if (period > 2 || descLower.includes('extra time') || descLower.includes('overtime') || descLower.includes('et') || descLower.includes('penalty')) {
            const label = descLower.includes('penalty') ? 'ركلات الترجيح' : (clock || 'و.إ');
            return { ar: label, isLive: true, isFinished: false, isHalfTime: false, isExtraTime: true };
        }
        return { ar: clock ? `${clock}'` : 'مباشر', isLive: true, isFinished: false, isHalfTime: false, isExtraTime: false };
    }
    if (state === 'post' || completed) return { ar: 'انتهت', isLive: false, isFinished: true, isHalfTime: false, isExtraTime: false };
    if (descLower.includes('postponed')) return { ar: 'مؤجلة', isLive: false, isFinished: false, isHalfTime: false, isExtraTime: false };
    if (descLower.includes('cancel'))    return { ar: 'ملغاة',  isLive: false, isFinished: false, isHalfTime: false, isExtraTime: false };
    return { ar: 'قادمة', isLive: false, isFinished: false, isHalfTime: false, isExtraTime: false };
}

async function fetchStandingsESPN(leagueName) {
    // Map league name to ESPN league ID
    const league = ESPN_LEAGUES.find(l => l.name === leagueName || leagueName.includes(l.name) || l.name.includes(leagueName));
    if (!league) return null;

    try {
        const r = await axios.get(
            `https://site.api.espn.com/apis/v2/sports/soccer/${league.id}/standings`,
            { headers: ESPN_HEADERS, timeout: 10000 }
        );
        const groups = r.data?.children || [];
        if (!groups.length) return null;

        const tables = groups.map(group => {
            const rows = (group.standings?.entries || []).map((entry, i) => {
                const team = entry.team || {};
                const stats = {};
                (entry.stats || []).forEach(s => { stats[s.name] = s.value; });
                return {
                    position:       Math.round(stats.rank ?? (i + 1)),
                    team:           { name: team.displayName || team.name || '', image: { url: team.logos?.[0]?.href || '' } },
                    played:         Math.round(stats.gamesPlayed ?? 0),
                    won:            Math.round(stats.wins        ?? 0),
                    drawn:          Math.round(stats.ties        ?? 0),
                    lost:           Math.round(stats.losses      ?? 0),
                    goalDifference: Math.round(stats.pointDifferential ?? 0),
                    points:         Math.round(stats.points      ?? 0),
                };
            });
            // Sort by position
            rows.sort((a, b) => a.position - b.position);
            return { name: group.name || '', rankings: rows };
        });

        return { tables };
    } catch (e) {
        console.log('ESPN standings fetch failed:', e.message);
        return null;
    }
}

async function fetchMatchesESPN(dateStr) {
    const espnDate = espnDateStr(dateStr);
    const allMatches = [];

    // Fetch all leagues in parallel (batches of 6 to avoid overload)
    const batchSize = 6;
    for (let i = 0; i < ESPN_LEAGUES.length; i += batchSize) {
        const batch = ESPN_LEAGUES.slice(i, i + batchSize);
        const results = await Promise.allSettled(
            batch.map(league =>
                axios.get(
                    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard?dates=${espnDate}`,
                    { headers: ESPN_HEADERS, timeout: 10000 }
                ).then(r => ({ league, events: r.data?.events || [] }))
                 .catch(() => ({ league, events: [] }))
            )
        );

        for (const result of results) {
            if (result.status !== 'fulfilled') continue;
            const { league, events } = result.value;
            if (!events.length) continue;

            for (const event of events) {
                const comp = event.competitions?.[0];
                if (!comp) continue;

                const home = comp.competitors?.find(c => c.homeAway === 'home');
                const away = comp.competitors?.find(c => c.homeAway === 'away');
                if (!home || !away) continue;

                const status = mapEspnStatus(event);
                const homeScore = comp.status?.type?.state !== 'pre' ? (parseInt(home.score) ?? null) : null;
                const awayScore = comp.status?.type?.state !== 'pre' ? (parseInt(away.score) ?? null) : null;

                allMatches.push({
                    id:          event.id || '',
                    league:      league.name,
                    leagueLogo:  '',
                    countryName: league.country,
                    homeTeam:    home.team?.shortDisplayName || home.team?.displayName || '',
                    awayTeam:    away.team?.shortDisplayName || away.team?.displayName || '',
                    homeLogo:    home.team?.logo || '',
                    awayLogo:    away.team?.logo || '',
                    homeScore:   homeScore,
                    awayScore:   awayScore,
                    homePenaltyScore: null,
                    awayPenaltyScore: null,
                    time:        event.date ? formatTime(event.date) : '',
                    status:      status.ar,
                    statusAr:    status.ar,
                    isLive:      status.isLive,
                    isFinished:  status.isFinished,
                    isHalfTime:  status.isHalfTime || false,
                    isExtraTime: status.isExtraTime || false,
                    date:        dateStr,
                    startTime:   event.date || '',
                    slug:        '',
                    koooraId:    '',
                });
            }
        }
    }

    return allMatches;
}

function parseCompetitions(competitions, dateLabel) {
    const matches = [];
    for (const comp of competitions) {
        const league     = comp.competition?.name || 'Unknown';
        const leagueLogo = comp.competition?.image?.url || '';
        const area       = comp.competition?.area?.name || '';
        const leagueId   = comp.competition?.id   || '';
        const leagueSlug = comp.competition?.name?.replace(/\s+/g, '-') || '';
        for (const m of (comp.matches || [])) {
            const status = mapStatus(m);
            matches.push({
                id:          m.id || '',
                league,
                leagueLogo,
                countryName: area,
                homeTeam:    m.teamA?.name || 'Home',
                awayTeam:    m.teamB?.name || 'Away',
                homeLogo:    m.teamA?.image?.url || '',
                awayLogo:    m.teamB?.image?.url || '',
                homeId:      m.teamA?.id || '',
                awayId:      m.teamB?.id || '',
                homeScore:   m.score?.teamA ?? null,
                awayScore:   m.score?.teamB ?? null,
                homePenaltyScore: m.penaltyScore?.teamA ?? null,
                awayPenaltyScore: m.penaltyScore?.teamB ?? null,
                time:        formatTime(m.startDate),
                status:      status.en,
                statusAr:    status.ar,
                isLive:      status.isLive,
                isFinished:  status.isFinished,
                isHalfTime:  status.isHalfTime || false,
                isExtraTime: status.isExtraTime || false,
                date:        dateLabel,
                startTime:   m.startDate || '',
                slug:        m.link?.slug || '',
                koooraId:    m.link?.id   || m.id || '',
                leagueId,
                leagueSlug,
                round:       m.gameset?.name || '',
            });
        }
    }
    return matches;
}

// ── Fetch match details ──────────────────────────────────────
async function fetchMatchDetails(slug, koooraId) {
    const details = {
        homeScore: null,
        awayScore: null,
        homePenaltyScore: null,
        awayPenaltyScore: null,
        status: '',
        isLive: false,
        isFinished: false,
        stats: [], events: [],
        lineups: {
            confirmed: false,
            home: { starters: [], subs: [], coach: '', formation: '' },
            away: { starters: [], subs: [], coach: '', formation: '' },
        },
        info: { channel: '', stadium: '', referee: '' },
    };

    if (!slug || !koooraId) return details;

    const slugValue = slug || '';
    const matchUrl = slugValue ? ysscores.resolveMatchUrl(decodeURIComponent(slugValue)) : '';
    if (!matchUrl) return details;

    try {
        return await ysscores.fetchMatchDetails(matchUrl);
    } catch (e) {
        console.error('fetchMatchDetails ysscores error:', e.message);
        return details;
    }
}

// ── Fetch Article ────────────────────────────────────────────
async function fetchArticle(articleUrl) {
    const fullUrl = articleUrl.startsWith('http') ? articleUrl : `${BASE_URL}${articleUrl}`;
    const r    = await axios.get(fullUrl, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const nd   = extractNextData(html);
    const pp   = nd?.props?.pageProps || {};
    const data = pp?.data || {};

    // kooora stores content in different keys depending on article type:
    // /أخبار/   → data.article
    // /القوائم/ → data.slideList
    // /مقالات/  → data.article or data.post
    const a = data.article || data.slideList || data.post || pp.article || null;
    if (!a) return null;

    // Clean body HTML — strip script/ad tags
    let body = (a.body || '').replace(/<script[\s\S]*?<\/script>/gi, '').trim();

    // For slideList: append slides content
    if (data.slideList && Array.isArray(a.slides) && a.slides.length > 0) {
        const slidesHtml = a.slides.map(s => {
            const slideImg = s.media?.url
                ? `<img src="${s.media.url}" alt="${s.headline || ''}" style="width:100%;border-radius:12px;margin:12px 0;" loading="lazy">`
                : '';
            return `<div class="article-slide">
                ${s.headline ? `<h3>${s.headline}</h3>` : ''}
                ${slideImg}
                ${s.body || ''}
            </div>`;
        }).join('<hr style="border-color:rgba(255,255,255,0.1);margin:24px 0;">');
        body = (body ? body + '<hr style="border-color:rgba(255,255,255,0.1);margin:24px 0;">' : '') + slidesHtml;
    }

    // Image: media can be object {url} or array [{url}]
    const mediaObj = a.media;
    const image = (mediaObj && !Array.isArray(mediaObj) ? mediaObj.url || mediaObj.src : null)
               || (Array.isArray(mediaObj) ? mediaObj[0]?.url || mediaObj[0]?.src : null)
               || a.mobileMedia?.url || a.mobileMedia?.src || '';

    // Author
    const authorsArr = Array.isArray(a.authors) ? a.authors : (a.author ? [a.author] : []);
    const author = authorsArr[0]?.name || '';

    // Date from publishTime ISO string
    let date = '';
    if (a.publishTime) {
        date = new Date(a.publishTime).toLocaleString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE,
        });
    }

    // Tags — filter out generic ones
    const skipTags = new Set(['NEWS', 'News other', 'كرة قدم', 'Match']);
    const tags = (a.tags || []).map(t => t.name || t).filter(t => t && !skipTags.has(t));

    return {
        headline: a.headline || '',
        teaser:   a.teaser   || '',
        body,
        image,
        author,
        date,
        tags,
        sourceUrl: fullUrl,
    };
}

// ── API: GET /api/article?url=... ────────────────────────────
async function handleArticle(req, res) {
    const urlObj     = new URL(req.url, `http://localhost`);
    const articleUrl = urlObj.searchParams.get('url') || '';

    if (!articleUrl) return sendError(res, 400, 'url required');

    // Decode if double-encoded
    let cleanUrl = articleUrl;
    try {
        if (cleanUrl.includes('%25')) cleanUrl = decodeURIComponent(cleanUrl);
    } catch(e) {}

    console.log('article fetch:', cleanUrl.slice(0, 80));

    const cacheKey = `article:${cleanUrl}`;
    const cached   = getCache(cacheKey);
    if (cached) return sendJSON(res, cached);

    try {
        const article = await fetchArticle(cleanUrl);
        if (!article) return sendError(res, 404, 'Article not found');
        setCache(cacheKey, article, 10 * 60_000);
        sendJSON(res, article);
    } catch (e) {
        console.error('article error:', e.message);
        sendError(res, 500, e.message);
    }
}

// ── Fetch News ───────────────────────────────────────────────
async function fetchNews() {
    const doFetch = async (forceRefresh = false) => {
        const buildId = await getBuildId(forceRefresh);
        const url = `${BASE_URL}/_next/data/${buildId}/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1.json`;
        const r   = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        return r.data?.pageProps?.cards || [];
    };

    try {
        let cards;
        try {
            cards = await doFetch(false);
        } catch (e) {
            // If 404, buildId is stale — force refresh and retry once
            if (e.response?.status === 404) {
                console.log('News: buildId stale, refreshing...');
                cards = await doFetch(true);
            } else {
                throw e;
            }
        }

        const newsItems = [];
        for (const card of cards.slice(0, 40)) {
            if (!card.headline) continue;

            const title    = card.headline;
            const image    = card.image?.src || card.mobileImage?.src || '';
            const date     = `${card.publishDateString || ''} ${card.publishTimeString || ''}`.trim();
            const href     = card.href || '';
            const link     = href.startsWith('http') ? href : `${BASE_URL}${href}`;
            const tags     = (card.tags || []).map(t => t.name).filter(Boolean);
            const category = tags[0] || 'أخبار';

            let type = 'international';
            const combined = title + category;
            if (combined.includes('مصر') || combined.includes('الأهلي') ||
                combined.includes('الزمالك') || combined.includes('بيراميدز') ||
                combined.includes('الدوري المصري')) {
                type = 'local';
            }

            newsItems.push({
                category,
                title,
                description: card.teaser || title,
                date,
                icon:  type === 'local' ? '⚽' : '🌍',
                type,
                image,
                link,
                href: card.href || '',  // raw kooora path for article page
            });
        }
        return newsItems;
    } catch (e) {
        console.error('fetchNews error:', e.message);
        return [];
    }
}

// ── Fetch Player Data ────────────────────────────────────────
async function fetchPlayerData(playerId, playerName) {
    const url  = `${BASE_URL}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%84%D8%A7%D8%B9%D8%A8/${encodeURIComponent(playerName)}/${playerId}`;
    const r    = await axios.get(url, { headers: HEADERS, timeout: 15000, responseType: 'arraybuffer' });
    const html = Buffer.from(r.data).toString('utf8');
    const nd   = extractNextData(html);
    const data = nd?.props?.pageProps?.data;
    if (!data) return null;

    const p = data.player || {};

    const posMap = {
        'GOALKEEPER':  'حارس مرمى',
        'DEFENDER':    'مدافع',
        'MIDFIELDER':  'لاعب وسط',
        'FORWARD':     'مهاجم',
        'ATTACKER':    'مهاجم',
    };

    // Format date of birth
    let dob = '', age = p.age || '';
    if (p.dateOfBirth) {
        const d = new Date(p.dateOfBirth);
        dob = d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    }

    // Build stats table rows
    const statsRows = (Array.isArray(p.stats) ? p.stats : []).map(s => ({
        competition: s.competition?.name || '',
        season:      s.season?.name || '',
        teamLogo:    s.team?.image?.url || '',
        appearances: s.stats?.appearances ?? 0,
        goals:       s.stats?.goals ?? 0,
        assists:     s.stats?.assists ?? 0,
        yellowCards: s.stats?.yellowCards ?? 0,
        redCards:    s.stats?.redCards ?? 0,
        minutesPlayed: s.stats?.minutesPlayed ?? 0,
        cleanSheets: s.stats?.cleanSheets ?? null,
        goalsConceded: s.stats?.goalsConceded ?? null,
    }));

    return {
        id:          p.id || playerId,
        name:        p.name || playerName,
        firstName:   p.firstName || '',
        lastName:    p.lastName  || '',
        image:       p.image?.url || '',
        position:    posMap[p.position] || p.position || '',
        positionRaw: p.position || '',
        age,
        dob,
        nationality:     p.nationality?.name || '',
        nationalityFlag: p.nationality?.image?.url || '',
        team:        p.team?.name || '',
        teamLogo:    p.team?.image?.url || '',
        teamId:      p.team?.id || '',
        shirtNumber: p.shirtNumber || '',
        stats:       statsRows,
    };
}

// ── Fetch Team Data ──────────────────────────────────────────
async function fetchTeamData(teamId, teamName, tab) {
    // Kooora supports these as URL path segments; 'scorers' and 'info' use the base URL
    const KOOORA_URL_TABS = new Set(['squad', 'matches', 'news', 'videos', 'standings']);

    const doFetch = async (forceRefresh = false) => {
        const buildId = await getBuildId(forceRefresh);
        let url;
        if (tab && KOOORA_URL_TABS.has(tab)) {
            url = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${tab}/${teamId}.json`;
        } else {
            // 'info', 'scorers', and any unknown tab → base team URL (contains all summary data)
            url = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%81%D8%B1%D9%8A%D9%82/${encodeURIComponent(teamName)}/${teamId}.json`;
        }
        console.log(`[team:${tab}] fetching:`, url.slice(url.indexOf('/_next')));
        const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        return r.data?.pageProps?.data;
    };

    try {
        return await doFetch(false);
    } catch (e) {
        // Retry on any 4xx (404 = stale buildId, others may also indicate stale build)
        const status = e.response?.status;
        if (status >= 400 && status < 500) {
            console.log(`Team [${tab}]: HTTP ${status}, refreshing buildId and retrying...`);
            return await doFetch(true);
        }
        throw e;
    }
}

// ── API: GET /api/team?id=...&name=...&tab=... ─────────────────
async function handleTeam(req, res) {
    const url      = new URL(req.url, `http://localhost`);
    const teamId   = url.searchParams.get('id')   || '';
    const name     = url.searchParams.get('name') || '';
    const tab      = url.searchParams.get('tab')  || 'info';

    if (!teamId) return sendError(res, 400, 'id required');
    if (!name) return sendError(res, 400, 'name required');

    const cacheKey = `team:${teamId}:${tab}`;
    const cached   = getCache(cacheKey);
    if (cached) return sendJSON(res, cached);

    try {
        const teamData = await fetchTeamData(teamId, name, tab);
        if (!teamData) return sendError(res, 404, 'Team not found');
        setCache(cacheKey, teamData, 10 * 60_000); // 10 min cache
        sendJSON(res, teamData);
    } catch (e) {
        console.error('team error:', e.message);
        sendError(res, 500, e.message);
    }
}

// ── API: GET /api/news ───────────────────────────────────────
async function handleNews(req, res) {
    const cacheKey = 'news:latest';
    const cached   = getCache(cacheKey);
    if (cached) return sendJSON(res, cached);

    try {
        const news = await fetchNews();
        const result = { news, updatedAt: new Date().toISOString() };
        setCache(cacheKey, result, 2 * 60_000); // 2 min cache
        sendJSON(res, result);
    } catch (e) {
        console.error('news error:', e.message);
        sendError(res, 500, e.message);
    }
}

// ── API: GET /api/player?id=...&name=... ─────────────────────
async function handlePlayer(req, res) {
    const url      = new URL(req.url, `http://localhost`);
    const playerId = url.searchParams.get('id')   || '';
    const name     = url.searchParams.get('name') || '';

    if (!playerId) return sendError(res, 400, 'id required');

    const cacheKey = `player:${playerId}`;
    const cached   = getCache(cacheKey);
    if (cached) return sendJSON(res, cached);

    try {
        const player = await fetchPlayerData(playerId, name);
        if (!player) return sendError(res, 404, 'Player not found');
        setCache(cacheKey, player, 10 * 60_000); // 10 min cache
        sendJSON(res, player);
    } catch (e) {
        console.error('player error:', e.message);
        sendError(res, 500, e.message);
    }
}

// ── API: GET /api/matches?date=today ─────────────────────────
async function handleMatches(req, res) {
    const url = new URL(req.url, `http://localhost`);
    const reqDate = url.searchParams.get('date') || 'today';
    
    const cacheKey = `matches:${reqDate}`;
    const cached   = getCache(cacheKey);
    if (cached) return sendJSON(res, cached);

    let matches = [];
    let source  = 'ysscores';

    try {
        matches = await fetchMatchesYSScores(reqDate);
        console.log(`[ysscores] fetched ${matches.length} matches from ${[...new Set(matches.map(m => m.league))].length} leagues`);
    } catch (e) {
        console.warn('YSScores matches fallback to ESPN:', e.message);
        source = 'espn';
        try {
            matches = await fetchMatchesESPN(reqDate);
        } catch (e2) {
            console.error('ESPN fallback also failed:', e2.message);
            sendError(res, 500, e2.message);
            return;
        }
    }

    // ── Midnight live-match fix ───────────────────────────────
    // When requesting today's matches, check if we're in the first 3 hours of Cairo midnight.
    // If so, also fetch yesterday's matches and include any still-live ones.
    // This prevents live matches from disappearing when crossing midnight.
    if (reqDate === 'today') {
        try {
            const cairoHour = parseInt(
                new Date().toLocaleTimeString('en-CA', { timeZone: TIMEZONE, hour: '2-digit', hour12: false })
            );
            // In first 4 hours after midnight, live matches may still be from "yesterday"
            if (cairoHour < 4) {
                const yesterdayMatches = await fetchMatchesYSScores('yesterday').catch(() => []);
                const stillLive = yesterdayMatches.filter(m => m.isLive);
                if (stillLive.length > 0) {
                    // Merge: avoid duplicates by ID
                    const existingIds = new Set(matches.map(m => m.id));
                    for (const m of stillLive) {
                        if (!existingIds.has(m.id)) {
                            matches.push(m);
                            existingIds.add(m.id);
                        }
                    }
                    console.log(`[midnight-fix] Merged ${stillLive.length} still-live match(es) from yesterday`);
                }
            }
        } catch (e) {
            // Non-fatal: ignore errors in midnight fix
            console.warn('[midnight-fix] Error:', e.message);
        }
    }

    // Sort: live first, then upcoming by time, then finished
    matches.sort((a, b) => {
        const rank = m => m.isLive ? 0 : (!m.isFinished ? 1 : 2);
        if (rank(a) !== rank(b)) return rank(a) - rank(b);
        return (a.startTime || '').localeCompare(b.startTime || '');
    });

    const hasLive = matches.some(m => m.isLive);
    const ttl     = hasLive ? 10_000 : 60_000;

    const result = { matches, updatedAt: new Date().toISOString(), source };
    setCache(cacheKey, result, ttl);
    sendJSON(res, result);
}


// ── API: GET /api/league?id=...&slug=... ────────────────────
async function handleLeague(req, res) {
    const q = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const id = q.get('id');
    const slug = q.get('slug');
    if (!id || !slug) return sendError(res, 400, 'Missing id or slug');

    const cacheKey = `league:${id}`;
    const cached = getCache(cacheKey);
    if (cached) return sendJSON(res, cached);

    const doFetch = async (forceRefresh = false) => {
        const buildId = await getBuildId(forceRefresh);
        const url = `${BASE_URL}/_next/data/${buildId}/%D9%83%D8%B1%D8%A9-%D8%A7%D9%84%D9%82%D8%AF%D9%85/%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A9/${encodeURIComponent(slug)}/${id}.json`;
        const r = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        return r.data?.pageProps?.data;
    };

    let data;
    try {
        data = await doFetch(false);
    } catch (e) {
        if (e.response?.status === 404) {
            console.log('League: buildId stale, refreshing...');
            try {
                data = await doFetch(true);
            } catch (e2) {
                console.error('League fetch failed after refresh:', e2.message);
                return sendError(res, 500, e2.message);
            }
        } else {
            console.error('League fetch error:', e.message);
            return sendError(res, 500, e.message);
        }
    }

    if (!data) return sendError(res, 404, 'League not found');

    const leagueName = data.competition?.name || slug;

    // 1. Try ESPN first for full standings (works for European leagues)
    let standingsData = await fetchStandingsESPN(leagueName);
    if (standingsData) {
        console.log(`[standings] ESPN full standings for: ${leagueName}`);
    }

    // 2. Fallback: summaryStandings from kooora (top 5 rows, but has markers/legend)
    if (!standingsData) {
        const raw = data.summaryStandings || data.tabsInfoTotalStandings;
        if (raw?.tables?.some(t => (t.rankings || []).length > 0)) {
            // Enrich with markers (legend) from summaryStandings
            standingsData = raw;
        }
    }

    // Attach markers (legend) from kooora summaryStandings to ESPN data if available
    if (standingsData && data.summaryStandings?.tables?.[0]?.rankings?.[0]?.markers) {
        // Collect all unique markers across all teams
        const allMarkers = {};
        for (const t of (data.summaryStandings.tables || [])) {
            for (const row of (t.rankings || [])) {
                for (const m of (row.markers || [])) {
                    if (m.id) allMarkers[m.id] = m;
                }
            }
        }
        standingsData._legend = Object.values(allMarkers);

        // Also attach marker to each ESPN row by position matching
        if (standingsData.tables) {
            const koooraRows = data.summaryStandings.tables[0]?.rankings || [];
            const markerByPos = {};
            koooraRows.forEach(r => {
                if (r.position && r.markers?.length) markerByPos[r.position] = r.markers;
            });
            for (const table of standingsData.tables) {
                for (const row of (table.rankings || [])) {
                    if (markerByPos[row.position]) row.markers = markerByPos[row.position];
                }
            }
        }
    }

    const result = {
        competition: data.competition,
        tabs: {
            news:       data.latestNews || data.tabsInfoNewsArchive,
            matches:    data.summaryMatches || data.tabsInfoGamesets,
            standings:  standingsData,
            topPlayers: data.tabsInfoTopPlayers
        },
        updatedAt: new Date().toISOString()
    };

    setCache(cacheKey, result, 300_000); // cache for 5 minutes
    sendJSON(res, result);
}

// ── API: GET /api/details?id=...&slug=...&koooraId=... ───────
async function handleDetails(req, res) {
    const url      = new URL(req.url, `http://localhost`);
    const id       = url.searchParams.get('id')       || '';
    const slug     = url.searchParams.get('slug')     || '';
    const koooraId = url.searchParams.get('koooraId') || id;
    const isLive   = url.searchParams.get('live') === '1';

    if (!slug || !koooraId) {
        return sendJSON(res, {
            stats: [], events: [],
            lineups: { confirmed: false, home: { starters: [], subs: [], coach: '', formation: '' }, away: { starters: [], subs: [], coach: '', formation: '' } },
            info: { channel: '', stadium: '', referee: '' },
        });
    }

    const cacheKey = `details:${koooraId}`;
    const cached   = getCache(cacheKey);
    if (cached) return sendJSON(res, cached);

    try {
        const details = await fetchMatchDetails(slug, koooraId);
        // Live match → 30s cache, finished → 5min, upcoming → 2min
        const ttl = isLive ? 30_000 : details.events.length > 0 ? 5 * 60_000 : 2 * 60_000;
        setCache(cacheKey, details, ttl);
        sendJSON(res, details);
    } catch (e) {
        console.error('details error:', e.message, e.stack?.split('\n')[1]);
        // Return empty details instead of 500 so the page still loads
        sendJSON(res, {
            stats: [], events: [],
            lineups: { confirmed: false, home: { starters: [], subs: [], coach: '', formation: '' }, away: { starters: [], subs: [], coach: '', formation: '' } },
            info: { channel: '', stadium: '', referee: '' },
        });
    }
}

// ── Sitemap handlers ───────────────────────────────────────────
const SITE_URL = 'https://koralegend.com';

function serveSitemapXml(res, xml) {
    res.writeHead(200, {
        'Content-Type':  'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
    });
    res.end(xml);
}

function handleSitemapMatches(req, res) {
    const today = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/matches</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/match-details</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
    <lastmod>${today}</lastmod>
  </url>
</urlset>`;
    serveSitemapXml(res, xml);
}

function handleSitemapNews(req, res) {
    const today = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/news</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/article</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${today}</lastmod>
  </url>
</urlset>`;
    serveSitemapXml(res, xml);
}

function handleSitemapTeams(req, res) {
    const today = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/team</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/league</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/player</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
    <lastmod>${today}</lastmod>
  </url>
</urlset>`;
    serveSitemapXml(res, xml);
}

// ── Static file server ───────────────────────────────────────
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.ico':  'image/x-icon',
    '.svg':  'image/svg+xml',
};

function serveStatic(req, res) {
    const urlParts = req.url.split('?');
    const urlPath = urlParts[0];
    const queryString = urlParts[1] ? '?' + urlParts[1] : '';

    // 1. Redirect from .html to clean URL (except index.html)
    if (urlPath.endsWith('.html') && urlPath !== '/index.html') {
        const cleanPath = urlPath.slice(0, -5) + queryString;
        res.writeHead(301, { 'Location': cleanPath });
        res.end();
        return;
    }

    // 2. Resolve target file path
    let fileToServe = '';
    let ext = '';

    if (urlPath === '/' || urlPath === '') {
        fileToServe = path.join(__dirname, 'matches.html');
        ext = '.html';
    } else if (urlPath === '/admin' || urlPath === '/admin.html') {
        // Authenticate admin before serving admin.html
        if (checkAdminAuth(req)) {
            fileToServe = path.join(__dirname, 'admin.html');
        } else {
            fileToServe = path.join(__dirname, 'admin-login.html');
        }
        ext = '.html';
    } else {
        const diskPath = path.join(__dirname, urlPath);
        ext = path.extname(diskPath);

        if (ext === '') {
            const htmlFilePath = diskPath + '.html';
            if (fs.existsSync(htmlFilePath)) {
                fileToServe = htmlFilePath;
                ext = '.html';
            } else {
                fileToServe = diskPath;
            }
        } else {
            fileToServe = diskPath;
        }
    }

    // 3. Serve the file
    fs.readFile(fileToServe, (err, data) => {
        if (err) {
            const notFoundPath = path.join(__dirname, '404.html');
            fs.readFile(notFoundPath, (err2, html) => {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(err2 ? '<h1>404 - Not Found</h1>' : html);
            });
            return;
        }

        const mime = MIME[ext] || 'application/octet-stream';
        const headers = { 'Content-Type': mime };

        if (fileToServe.endsWith(path.sep + 'service-worker.js') || urlPath === '/service-worker.js') {
            headers['Service-Worker-Allowed'] = '/';
        }

        // Cache configuration: do not hard-cache CSS/JS during updates, cache images for 1 day
        if (ext === '.css' || ext === '.js') {
            headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        } else if (ext === '.png' || ext === '.jpg' || ext === '.ico' || ext === '.svg' || ext === '.webp') {
            headers['Cache-Control'] = 'public, max-age=86400, must-revalidate';
        } else if (ext === '.html') {
            headers['Cache-Control'] = 'no-cache';
        }

        res.writeHead(200, headers);
        res.end(data);
    });
}

// ── Helpers ──────────────────────────────────────────────────
function sendJSON(res, data) {
    const body = Buffer.from(JSON.stringify(data), 'utf-8');
    res.writeHead(200, {
        'Content-Type':                'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control':               'no-store',
        'Content-Length':              body.byteLength,
    });
    res.end(body);
}

function sendError(res, code, msg) {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: msg }));
}

// ── Push API Handlers ─────────────────────────────────────────
function handleVapidPublicKey(req, res) {
    sendJSON(res, { publicKey: vapidKeys.publicKey });
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); }
        });
        req.on('error', reject);
    });
}

async function handleSubscribe(req, res) {
    try {
        const sub  = await readBody(req);
        if (!sub || !sub.endpoint) return sendError(res, 400, 'Invalid subscription');
        const subs = loadSubscriptions();
        const exists = subs.some(s => s.endpoint === sub.endpoint);
        if (!exists) {
            subs.push(sub);
            saveSubscriptions(subs);
            console.log(`[Push] New subscriber. Total: ${subs.length}`);
        }
        sendJSON(res, { ok: true, total: subs.length });
    } catch (e) {
        sendError(res, 400, e.message);
    }
}

async function handleUnsubscribe(req, res) {
    try {
        const { endpoint } = await readBody(req);
        if (!endpoint) return sendError(res, 400, 'endpoint required');
        const subs    = loadSubscriptions();
        const cleaned = subs.filter(s => s.endpoint !== endpoint);
        saveSubscriptions(cleaned);
        console.log(`[Push] Unsubscribed. Remaining: ${cleaned.length}`);
        sendJSON(res, { ok: true, total: cleaned.length });
    } catch (e) {
        sendError(res, 400, e.message);
    }
}

// ── Push Notification Daemon ──────────────────────────────────
const pushState = {
    // matchId → score string "homeScore-awayScore" for change detection
    scores: {},
    // Set of seen news hrefs
    seenNews: new Set(),
    initialized: false,
};

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://www.koralegend.com';

async function pushDaemonTick() {
    try {
        // 1. Fetch latest matches (today)
        let matches = [];
        try { matches = await fetchMatchesYSScores(); } catch { }
        if (!matches.length) { try { matches = await fetchMatchesESPN('today'); } catch { } }

        for (const m of matches) {
            const key   = String(m.id || (m.homeTeam + '-' + m.awayTeam));
            const score = `${m.homeScore ?? '-'}-${m.awayScore ?? '-'}`;
            const prev  = pushState.scores[key];

            if (!pushState.initialized) {
                // First run: seed without notifying
                pushState.scores[key] = { score, isLive: m.isLive };
                continue;
            }

            if (!prev) {
                // New match appeared
                pushState.scores[key] = { score, isLive: m.isLive };
                // Notify when a match just went live
                if (m.isLive) {
                    await sendPushToAll({
                        title: `⚽ بدأت المباراة!`,
                        body:  `${m.homeTeam} 🆚 ${m.awayTeam}`,
                        icon:  m.homeLogo || '/logo.png',
                        data:  { url: m.koooraId ? `/match-details?id=${m.id}` : '/matches' }
                    });
                }
            } else {
                const wasLive = prev.isLive;
                const nowLive = m.isLive;

                // Detect match kick-off
                if (!wasLive && nowLive) {
                    await sendPushToAll({
                        title: `🏁 انطلقت المباراة!`,
                        body:  `${m.homeTeam} ضد ${m.awayTeam}`,
                        icon:  m.homeLogo || '/logo.png',
                        data:  { url: `/match-details?id=${m.id}` }
                    });
                }

                // Detect score change (goal)
                if (prev.score !== score && nowLive) {
                    const hs = m.homeScore ?? 0;
                    const as = m.awayScore ?? 0;
                    await sendPushToAll({
                        title: `🔥 هدف!`,
                        body:  `${m.homeTeam} ${hs} - ${as} ${m.awayTeam}`,
                        icon:  m.homeLogo || '/logo.png',
                        data:  { url: `/match-details?id=${m.id}` }
                    });
                }

                pushState.scores[key] = { score, isLive: nowLive };
            }
        }

        // 2. Fetch latest news
        try {
            const newsItems = await fetchNews();
            for (const item of newsItems) {
                const key = item.href || item.link;
                if (!key) continue;
                if (!pushState.seenNews.has(key)) {
                    if (pushState.initialized) {
                        // New article detected
                        await sendPushToAll({
                            title: `📰 ${item.category || 'خبر جديد'}`,
                            body:  item.title,
                            icon:  item.image || '/logo.png',
                            data:  { url: item.href ? `/article?url=${encodeURIComponent(item.href)}` : '/news' }
                        });
                    }
                    pushState.seenNews.add(key);
                }
            }
        } catch { }

        pushState.initialized = true;

    } catch (e) {
        console.error('[PushDaemon] Tick error:', e.message);
    }
}

function startPushDaemon(intervalMs = 60_000) {
    const subs = loadSubscriptions();
    if (subs.length === 0) {
        console.log('[Push] No subscribers yet — daemon will start sending once users subscribe.');
    } else {
        console.log(`[Push] Daemon started — monitoring for ${subs.length} subscriber(s) every ${intervalMs / 1000}s`);
    }
    // Initial seed tick (no notifications)
    pushDaemonTick().then(() => {
        setInterval(pushDaemonTick, intervalMs);
    });
}

// ── Main server ──────────────────────────────────────────────
const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];

    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
        res.end(); return;
    }

    if (url === '/api/matches')           return handleMatches(req, res);
    if (url === '/api/details')           return handleDetails(req, res);
    if (url === '/api/league')            return handleLeague(req, res);
    if (url === '/api/player')            return handlePlayer(req, res);
    if (url === '/api/team')              return handleTeam(req, res);
    if (url === '/api/news')              return handleNews(req, res);
    if (url === '/api/article')           return handleArticle(req, res);
    if (url === '/api/ping')              { sendJSON(res, { ok: true, ts: Date.now() }); return; }
    if (url === '/api/vapid-public-key')  return handleVapidPublicKey(req, res);
    if (url === '/api/subscribe')         return handleSubscribe(req, res);
    if (url === '/api/unsubscribe')       return handleUnsubscribe(req, res);
    if (url === '/api/test-push') {
        const subs = loadSubscriptions();
        sendJSON(res, { ok: true, subscribers: subs.length });
        if (subs.length > 0) {
            sendPushToAll({
                title: '🔔 اختبار الإشعارات',
                body: 'تم إرسال هذا الإشعار لاختبار عمل النظام',
                icon: '/logo.png',
                data: { url: '/matches' }
            }).catch(e => console.error('[Test Push] Error:', e.message));
        }
        return;
    }
    // ── Streams API ──
    if (url === '/api/streams')           return handleGetStream(req, res);
    if (url === '/api/streams/heartbeat') return handleStreamHeartbeat(req, res);
    if (url === '/api/admin/login' && req.method === 'POST') return handleAdminLogin(req, res);
    if (url === '/api/admin/logout' && req.method === 'POST') return handleAdminLogout(req, res);
    if (url === '/api/admin/viewers')     return handleAdminGetViewers(req, res);
    if (url === '/api/admin/streams') {
        if (req.method === 'GET')    return handleAdminGetStreams(req, res);
        if (req.method === 'POST')   return handleAdminUpsertStream(req, res);
        if (req.method === 'DELETE') return handleAdminDeleteStream(req, res);
        return sendError(res, 405, 'Method Not Allowed');
    }
    if (url === '/favicon.ico')           { res.writeHead(204); res.end(); return; }
    if (url === '/sitemap-matches.xml')   return handleSitemapMatches(req, res);
    if (url === '/sitemap-news.xml')      return handleSitemapNews(req, res);
    if (url === '/sitemap-teams.xml')     return handleSitemapTeams(req, res);

    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`\n🏟️  KoraLegend Live Server`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   API: /api/matches?date=today`);
    console.log(`        /api/details?slug=...&koooraId=...&live=1`);
    console.log(`        /api/news`);
    console.log(`        /api/player?id=...&name=...`);
    console.log(`        /api/vapid-public-key`);
    console.log(`        /api/subscribe  (POST)`);
    console.log(`        /api/unsubscribe (POST)`);
    console.log(`\n   Press Ctrl+C to stop\n`);
    startPushDaemon(60_000);
});
