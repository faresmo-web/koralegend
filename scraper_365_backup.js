// ============================================================
//  KoraLegend Scraper — Powered by Kooora.com
//  Daemon mode: auto-refreshes every 2 minutes
//  Usage:
//    node scraper.js            (run once)
//    node scraper.js --daemon   (continuous, every 2 min)
//    node scraper.js --daemon --interval=5  (every 5 min)
// ============================================================

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const cheerio = require('cheerio');

// ── Config ──────────────────────────────────────────────────
const TIMEZONE     = 'Africa/Cairo';
const MAX_MATCHES_PER_DATE   = 100;  // Max matches fetched per date
const MAX_DETAIL_SCRAPES     = 50;   // Max detail pages scraped per run
const BASE_URL     = 'https://www.kooora.com';

const HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
    'Referer':         'https://www.kooora.com/',
};

// ── Helpers ──────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const formatDate = (date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
};

const getDates = () => {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
    return {
        yesterday: formatDate(yesterday),
        today:     formatDate(today),
        tomorrow:  formatDate(tomorrow),
    };
};

const formatMatchTime = (timeStr) => {
    if (!timeStr) return '';
    try {
        // Kooora time format: "HH:MM"
        return timeStr;
    } catch { return ''; }
};

// ── Fetch Matches from Kooora ────────────────────────────────
async function fetchMatchesForDate(dateStr, dateLabel) {
    const url = `${BASE_URL}/?date=${dateStr}`;
    
    try {
        console.log(`  ⚡ Fetching ${dateLabel} matches from Kooora...`);
        const res = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(res.data);
        
        const matches = [];
        
        // Kooora structure: .matchesContainer .match-item
        $('.match, .matchCard, [class*="match"]').each((i, elem) => {
            if (matches.length >= MAX_MATCHES_PER_DATE) return false;
            
            const $match = $(elem);
            
            // Extract match ID from link
            const matchLink = $match.find('a').first().attr('href') || '';
            const matchIdMatch = matchLink.match(/\/(\d+)\//);
            const matchId = matchIdMatch ? matchIdMatch[1] : `kooora_${Date.now()}_${i}`;
            
            // Extract teams
            const homeTeam = $match.find('.teamA, .home-team, [class*="home"]').first().text().trim();
            const awayTeam = $match.find('.teamB, .away-team, [class*="away"]').first().text().trim();
            
            if (!homeTeam || !awayTeam) return; // Skip if no teams found
            
            // Extract league
            const league = $match.find('.league, .competition, [class*="league"]').first().text().trim() || 'دوري غير معروف';
            
            // Extract time
            const time = $match.find('.time, .match-time, [class*="time"]').first().text().trim();
            
            // Extract scores
            let homeScore = null;
            let awayScore = null;
            const scoreText = $match.find('.score, .result, [class*="score"]').first().text().trim();
            if (scoreText && scoreText.includes('-')) {
                const scores = scoreText.split('-');
                homeScore = parseInt(scores[0]) || null;
                awayScore = parseInt(scores[1]) || null;
            }
            
            // Determine status
            let status = 'Upcoming';
            let statusAr = 'قادمة';
            let isLive = false;
            let isFinished = false;
            
            if ($match.find('[class*="live"]').length > 0 || $match.hasClass('live')) {
                status = 'Live';
                statusAr = 'مباشر';
                isLive = true;
            } else if (homeScore !== null && awayScore !== null) {
                status = 'Finished';
                statusAr = 'انتهت';
                isFinished = true;
            }
            
            matches.push({
                id: matchId,
                league,
                leagueLogo: '',
                countryName: '',
                homeTeam,
                awayTeam,
                homeLogo: '',
                awayLogo: '',
                homeScore,
                awayScore,
                time,
                status,
                statusAr,
                isLive,
                isFinished,
                date: dateLabel,
                gameTime: '',
                startTime: '',
                link: matchLink ? `${BASE_URL}${matchLink}` : '',
            });
        });
        
        console.log(`  ✓ Found ${matches.length} matches for ${dateLabel}`);
        return matches;
    } catch (err) {
        console.error(`  ✗ Error fetching ${dateLabel} matches:`, err.message);
        return [];
    }
}

// ── Fetch News from Multiple Sources ─────────────────────────
async function fetchNews() {
    const allNews = [];
    
    // Generate some sample news with images (fallback)
    const sampleNews = [
        {
            category: "الدوري المصري",
            title: "الأهلي يستعد لمواجهة المصري في ختام الدوري",
            description: "تفاصيل وتحديثات حول: الأهلي يستعد لمواجهة المصري في ختام الدوري",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            icon: "⚽",
            type: "local",
            image: "https://mediayk.gemini.media/img/yallakora/meduim/2026/2/18/42026_2_18_23_47.webp",
            link: "https://www.yallakora.com/tour/160/%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d9%85%d8%b5%d8%b1%d9%8a"
        },
        {
            category: "الدوري المصري",
            title: "الزمالك يواجه سيراميكا في معركة البقاء",
            description: "تفاصيل وتحديثات حول: الزمالك يواجه سيراميكا في معركة البقاء",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            icon: "⚽",
            type: "local",
            image: "https://mediayk.gemini.media/img/yallakora/meduim/2026/2/17/سولية-easy-resize-com2026_2_17_10_57.webp",
            link: "https://www.yallakora.com/tour/160/%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d9%85%d8%b5%d8%b1%d9%8a"
        },
        {
            category: "الدوري المصري",
            title: "بيراميدز يسعى للفوز على سموحة لحسم اللقب",
            description: "تفاصيل وتحديثات حول: بيراميدز يسعى للفوز على سموحة لحسم اللقب",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            icon: "⚽",
            type: "local",
            image: "https://mediayk.gemini.media/img/yallakora/meduim/2026/5/3/162026_5_3_21_19.webp",
            link: "https://www.yallakora.com/tour/160/%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d9%85%d8%b5%d8%b1%d9%8a"
        },
        {
            category: "الدوري الإنجليزي",
            title: "محمد صلاح يواصل تألقه مع ليفربول",
            description: "تفاصيل وتحديثات حول: محمد صلاح يواصل تألقه مع ليفربول",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            icon: "🌍",
            type: "international",
            image: "https://mediayk.gemini.media/img/yallakora/meduim/2026/5/5/image-2026-05-05t234447-7572026_5_5_23_45.webp",
            link: "https://www.yallakora.com/tour/93/%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d8%a5%d9%86%d8%ac%d9%84%d9%8a%d8%b2%d9%8a"
        },
        {
            category: "الدوري الأوروبي",
            title: "نهائي الدوري الأوروبي: فرايبورج vs أستون فيلا",
            description: "تفاصيل وتحديثات حول: نهائي الدوري الأوروبي: فرايبورج vs أستون فيلا",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            icon: "🌍",
            type: "international",
            image: "https://mediayk.gemini.media/img/yallakora/meduim/2026/5/19/شوستر-easy-resize-com2026_5_19_22_22.webp",
            link: "https://www.yallakora.com/tour/129/%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d8%a3%d9%88%d8%b1%d9%88%d8%a8%d9%8a"
        },
        {
            category: "الكونفيدرالية الأفريقية",
            title: "اتحاد العاصمة يشكر جماهيره بعد مواجهة الزمالك",
            description: "تفاصيل وتحديثات حول: اتحاد العاصمة يشكر جماهيره بعد مواجهة الزمالك",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            icon: "🌍",
            type: "international",
            image: "https://mediayk.gemini.media/img/yallakora/meduim/2026/5/17/ابطال-easy-resize-com2026_5_17_0_27.webp",
            link: "https://www.yallakora.com/tour/70/%d8%a7%d9%84%d9%83%d9%88%d9%86%d9%81%d9%8a%d8%af%d8%b1%d8%a7%d9%84%d9%8a%d8%a9-%d8%a7%d9%84%d8%a3%d9%81%d8%b1%d9%8a%d9%82%d9%8a%d8%a9"
        },
        {
            category: "كأس العالم",
            title: "رونالدو يعلق على مشاركته في كأس العالم",
            description: "تفاصيل وتحديثات حول: رونالدو يعلق على مشاركته في كأس العالم",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            icon: "🌍",
            type: "international",
            image: "https://mediayk.gemini.media/img/yallakora/meduim/2025/11/11/رون2025_11_11_15_56.webp",
            link: "https://www.yallakora.com/tour/125/%d9%83%d8%a3%d8%b3-%d8%a7%d9%84%d8%b9%d8%a7%d9%84%d9%85"
        },
        {
            "category": "الدوري المصري",
            "title": "لجنة الكشافة بالأهلي تستعد للموسم الجديد",
            "description": "تفاصيل وتحديثات حول: لجنة الكشافة بالأهلي تستعد للموسم الجديد",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            "icon": "⚽",
            "type": "local",
            "image": "https://mediayk.gemini.media/img/yallakora/meduim/2026/4/19/images2026_4_19_22_36.webp",
            "link": "https://www.yallakora.com/tour/160/%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d9%85%d8%b5%d8%b1%d9%8a"
        },
        {
            "category": "منتخبات",
            "title": "منتخب نيجيريا يضم حارس أرسنال السابق",
            "description": "تفاصيل وتحديثات حول: منتخب نيجيريا يضم حارس أرسنال السابق",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            "icon": "🌍",
            "type": "international",
            "image": "https://mediayk.gemini.media/img/yallakora/meduim/2026/5/19/image-2026-05-19t222208-0832026_5_19_22_23.webp",
            "link": "https://www.yallakora.com/tour/201/%d9%85%d8%a8%d8%a7%d8%b1%d9%8a%d8%a7%d8%aa-%d9%88%d8%af%d9%8a%d8%a9-%d9%85%d9%86%d8%aa%d8%ae%d8%a8%d8%a7%d8%aa"
        },
        {
            "category": "منتخبات",
            "title": "منتخب مصر للناشئين يواجه المغرب",
            "description": "تفاصيل وتحديثات حول: منتخب مصر للناشئين يواجه المغرب",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            "icon": "🌍",
            "type": "international",
            "image": "https://mediayk.gemini.media/img/yallakora/meduim/2026/4/2/منتخب2026_4_2_18_43.webp",
            "link": "https://www.yallakora.com/tour/201/%d9%85%d8%a8%d8%a7%d8%b1%d9%8a%d8%a7%d8%aa-%d9%88%d8%af%d9%8a%d8%a9-%d9%85%d9%86%d8%aa%d8%ae%d8%a8%d8%a7%d8%aa"
        },
        {
            "category": "الدوري الإسباني",
            "title": "لاعب برشلونة السابق ينتقد كومان",
            "description": "تفاصيل وتحديثات حول: لاعب برشلونة السابق ينتقد كومان",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            "icon": "🌍",
            "type": "international",
            "image": "https://mediayk.gemini.media/img/yallakora/meduim/2026/5/11/d-3-2026_5_11_20_14.webp",
            "link": "https://www.yallakora.com/tour/94/%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d8%a5%d8%b3%d8%a8%d8%a7%d9%86%d9%8a"
        },
        {
            "category": "الدوري المصري",
            "title": "سيراميكا تتنازل عن حصتها من التذاكر للزمالك",
            "description": "تفاصيل وتحديثات حول: سيراميكا تتنازل عن حصتها من التذاكر للزمالك",
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
            }),
            "icon": "⚽",
            "type": "local",
            "image": "https://mediayk.gemini.media/img/yallakora/meduim/2026/2/17/سولية-easy-resize-com2026_2_17_10_57.webp",
            "link": "https://www.yallakora.com/tour/160/%d8%a7%d9%84%d8%af%d9%88%d8%b1%d9%8a-%d8%a7%d9%84%d9%85%d8%b5%d8%b1%d9%8a"
        }
    ];
    
    // Try 365scores
    try {
        console.log('  📰 Trying 365scores...');
        const news365 = await fetchNews365();
        if (news365.length > 0) {
            allNews.push(...news365);
            console.log(`  ✓ Got ${news365.length} news from 365scores`);
        }
    } catch (err) {
        console.log('  ⚠️  365scores failed:', err.message);
    }
    
    // Add sample news with images
    allNews.push(...sampleNews);
    
    // Remove duplicates based on title
    const uniqueNews = [];
    const seenTitles = new Set();
    
    for (const item of allNews) {
        const titleKey = item.title.toLowerCase().trim();
        if (!seenTitles.has(titleKey)) {
            seenTitles.add(titleKey);
            uniqueNews.push(item);
        }
    }
    
    // Limit to 30 and shuffle for variety
    const shuffled = uniqueNews.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 30);
}

// ── Fetch News from 365scores (fallback) ─────────────────────
async function fetchNews365() {
    const url = `${BASE_API}/news/`;
    const params = {
        appTypeId:     APP_TYPE_ID,
        langId:        LANG_ID,
        timezoneName:  TIMEZONE,
        userCountryId: COUNTRY_ID,
        sports:        SPORT_ID,
        limit:         30,
    };

    try {
        const res = await axios.get(url, { headers: HEADERS, params, timeout: 15000 });
        const data = res.data;
        
        if (!data || !data.news) return [];

        const newsItems = [];
        const articles = data.news.slice(0, 30);

        for (const article of articles) {
            const competition = article.competitions && article.competitions[0];
            const category = competition ? competition.name : 'أخبار كرة القدم';
            
            let type = 'international';
            if (category && (category.includes('مصر') || category.includes('Egypt') || 
                category.includes('الدوري المصري') || category.includes('Egyptian'))) {
                type = 'local';
            }

            let dateStr = '';
            if (article.publishDate) {
                try {
                    const d = new Date(article.publishDate);
                    dateStr = d.toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: TIMEZONE
                    });
                } catch (e) {
                    dateStr = new Date().toLocaleString('ar-EG', { timeZone: TIMEZONE });
                }
            }

            let image = '';
            if (article.imageUrl) {
                image = article.imageUrl;
            } else if (article.images && article.images.length > 0) {
                const img = article.images[0];
                if (typeof img === 'string') {
                    image = img;
                } else if (img.url) {
                    image = img.url;
                }
            } else if (article.thumbnail) {
                image = article.thumbnail;
            }
            
            if (image && !image.startsWith('http')) {
                image = `https://www.365scores.com${image}`;
            }

            let link = '';
            if (article.url) {
                link = article.url.startsWith('http') ? article.url : `https://www.365scores.com${article.url}`;
            } else if (article.id) {
                link = `https://www.365scores.com/ar/news/football/${article.id}`;
            }

            newsItems.push({
                category,
                title: article.title || '',
                description: article.subtitle || article.description || `تفاصيل وتحديثات حول: ${article.title}`,
                date: dateStr,
                icon: type === 'local' ? '⚽' : '🌍',
                type,
                image,
                link,
            });
        }

        return newsItems;
    } catch (err) {
        console.error('  ✗ Error fetching news from 365scores:', err.message);
        return [];
    }
}

// ── Fetch Match Details from Kooora ──────────────────────────
async function fetchMatchDetails(matchId, matchLink) {
    if (!matchLink) return getEmptyDetails();
    
    const details = {
        stats:   [],
        events:  [],
        lineups: {
            home: { starters: [], subs: [], coach: '', formation: '' },
            away: { starters: [], subs: [], coach: '', formation: '' },
        },
        info: { channel: '', stadium: '', referee: '' },
    };

    try {
        const res = await axios.get(matchLink, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(res.data);
        
        // Extract stadium, referee, channel
        details.info.stadium = $('.stadium, [class*="stadium"]').first().text().trim() || '';
        details.info.referee = $('.referee, [class*="referee"]').first().text().trim() || '';
        details.info.channel = $('.channel, [class*="channel"]').first().text().trim() || '';
        
        // Extract events
        $('.event, .match-event, [class*="event"]').each((i, elem) => {
            const $event = $(elem);
            const minute = $event.find('.minute, .time, [class*="minute"]').first().text().trim();
            const player = $event.find('.player, [class*="player"]').first().text().trim();
            const eventType = $event.attr('class') || '';
            
            let type = 'other';
            if (eventType.includes('goal')) type = 'goal';
            else if (eventType.includes('yellow')) type = 'yellow';
            else if (eventType.includes('red')) type = 'red';
            else if (eventType.includes('sub')) type = 'sub';
            
            const team = $event.hasClass('home') || $event.closest('.home').length > 0 ? 'home' : 'away';
            
            if (minute && player) {
                details.events.push({
                    min: minute,
                    addedMin: '',
                    type,
                    team,
                    descText: player,
                });
            }
        });
        
        // Extract stats
        $('.stat, .match-stat, [class*="stat"]').each((i, elem) => {
            const $stat = $(elem);
            const name = $stat.find('.stat-name, .name, [class*="name"]').first().text().trim();
            const home = $stat.find('.home-value, .home, [class*="home"]').first().text().trim();
            const away = $stat.find('.away-value, .away, [class*="away"]').first().text().trim();
            
            if (name && (home || away)) {
                details.stats.push({ name, home: home || '0', away: away || '0' });
            }
        });
        
        // Extract lineups
        $('.lineup, .team-lineup, [class*="lineup"]').each((i, elem) => {
            const $lineup = $(elem);
            const isHome = $lineup.hasClass('home') || $lineup.closest('.home').length > 0;
            const side = isHome ? 'home' : 'away';
            
            $lineup.find('.player, [class*="player"]').each((j, playerElem) => {
                const $player = $(playerElem);
                const number = $player.find('.number, [class*="number"]').first().text().trim();
                const name = $player.find('.name, [class*="name"]').first().text().trim();
                
                if (name) {
                    const player = { num: number || '', name };
                    if ($player.hasClass('starter') || j < 11) {
                        details.lineups[side].starters.push(player);
                    } else {
                        details.lineups[side].subs.push(player);
                    }
                }
            });
            
            const coach = $lineup.find('.coach, [class*="coach"]').first().text().trim();
            if (coach) details.lineups[side].coach = coach;
        });
        
        return details;
    } catch (err) {
        console.error(`  ✗ Error fetching details for match ${matchId}:`, err.message);
        return getEmptyDetails();
    }
}

function getEmptyDetails() {
    return {
        stats:   [],
        events:  [],
        lineups: {
            home: { starters: [], subs: [], coach: '', formation: '' },
            away: { starters: [], subs: [], coach: '', formation: '' },
        },
        info: { channel: '', stadium: '', referee: '' },
    };
}

// ── Load Existing Match Details Cache ────────────────────────
function loadExistingDetails() {
    const filePath = path.join(__dirname, 'match-details-data.js');
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const match = content.match(/const matchDetailsDatabase\s*=\s*(\{[\s\S]*\});/);
            if (match) {
                return JSON.parse(match[1]);
            }
        }
    } catch (e) {
        // Can't load cache — start fresh
    }
    return {};
}

// ── Main Scrape Run ──────────────────────────────────────────
async function run() {
    const startTime = Date.now();
    const dates = getDates();

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  🏟️  KoraLegend Scraper — Kooora.com         ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log(`📅 Fetching: ${dates.yesterday} | ${dates.today} | ${dates.tomorrow}\n`);

    // ── 1. Fetch Matches ──────────────────────────────────────
    console.log('⚡ Fetching matches from Kooora...');
    const [yesterdayMatches, todayMatches, tomorrowMatches] = await Promise.all([
        fetchMatchesForDate(dates.yesterday, 'yesterday'),
        fetchMatchesForDate(dates.today, 'today'),
        fetchMatchesForDate(dates.tomorrow, 'tomorrow'),
    ]);

    console.log(`  ✓ Yesterday: ${yesterdayMatches.length} | Today: ${todayMatches.length} | Tomorrow: ${tomorrowMatches.length}`);

    // ── 2. Build Matches Database ─────────────────────────────
    const matchesDatabase = {
        en: {
            today:     todayMatches,
            yesterday: yesterdayMatches,
            tomorrow:  tomorrowMatches,
        },
        ar: {
            today:     todayMatches.map(m => ({...m, status: m.statusAr})),
            yesterday: yesterdayMatches.map(m => ({...m, status: m.statusAr})),
            tomorrow:  tomorrowMatches.map(m => ({...m, status: 'قادمة'})),
        },
    };

    // ── 3. Write matches-data.js ──────────────────────────────
    const matchesFilePath = path.join(__dirname, 'matches-data.js');
    const matchesCode = `// Matches Database (Auto-generated by KoraLegend Scraper — 365scores)
// Last updated: ${new Date().toISOString()}
const matchesDatabase = ${JSON.stringify(matchesDatabase, null, 4)};

// Filters
let selectedLeague = 'all';
let selectedDate = 'today';

document.addEventListener('DOMContentLoaded', function() {
    const leagueFilter = document.getElementById('leagueFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (leagueFilter) {
        leagueFilter.addEventListener('change', function(e) {
            selectedLeague = e.target.value;
            loadMatchesContent();
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function(e) {
            selectedDate = e.target.value;
            loadMatchesContent();
        });
    }
});

function loadMatchesContent() {
    const container = document.getElementById('matchesList');
    if (!container) return;
    
    const matches = matchesDatabase[currentLang][selectedDate];
    container.innerHTML = '';
    
    const filteredMatches = selectedLeague === 'all' 
        ? matches 
        : matches.filter(m => matchesLeagueFilter(m.league, selectedLeague));
    
    if (filteredMatches.length === 0) {
        container.innerHTML = \`
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <h3>\${currentLang === 'en' ? 'No matches found' : 'لا توجد مباريات'}</h3>
            </div>
        \`;
        return;
    }
    
    // Group matches by league
    const groups = {};
    filteredMatches.forEach(match => {
        const leagueKey = match.league;
        if (!groups[leagueKey]) {
            groups[leagueKey] = {
                name: leagueKey,
                logo: match.leagueLogo,
                matches: []
            };
        }
        groups[leagueKey].matches.push(match);
    });
    
    Object.values(groups).forEach((group, groupIdx) => {
        const leagueGroup = document.createElement('div');
        leagueGroup.className = 'league-group';
        leagueGroup.style.animation = 'slideUp 0.6s ease-out backwards';
        leagueGroup.style.animationDelay = \`\${groupIdx * 0.15}s\`;
        
        const renderLeagueLogo = group.logo 
            ? \`<img src="\${group.logo}" alt="\${group.name}" class="league-group-logo" onerror="this.style.display='none';" loading="lazy">\`
            : '';
            
        leagueGroup.innerHTML = \`
            <div class="league-group-header">
                \${renderLeagueLogo}
                <span class="league-group-title">\${group.name}</span>
            </div>
            <div class="league-matches-list"></div>
        \`;
        
        const matchesListContainer = leagueGroup.querySelector('.league-matches-list');
        
        group.matches.forEach(match => {
            const matchRow = createMatchRow(match, selectedDate);
            matchesListContainer.appendChild(matchRow);
        });
        
        container.appendChild(leagueGroup);
    });
}

function matchesLeagueFilter(league, filter) {
    const leagueMap = {
        'premier': ['إنجلترا - الدوري الإنجليزي', 'England - Premier League', 'Premier League', 'الدوري الإنجليزي'],
        'laliga':  ['إسبانيا - الدوري الإسباني', 'Spain - La Liga', 'La Liga', 'LaLiga', 'الدوري الإسباني'],
        'seriea':  ['إيطاليا - الدوري الإيطالي', 'Italy - Serie A', 'Serie A', 'الدوري الإيطالي'],
        'bundesliga': ['ألمانيا - الدوري الألماني', 'Germany - Bundesliga', 'Bundesliga', 'الدوري الألماني'],
        'ligue1':  ['فرنسا - الدوري الفرنسي', 'France - Ligue 1', 'Ligue 1', 'الدوري الفرنسي'],
        'egyptian':['مصر - الدوري المصري', 'Egyptian Premier League', 'Egypt Cup', 'الدوري المصري', 'كأس مصر'],
        'afcon':   ['Africa Cup of Nations', 'كأس أمم إفريقيا', 'أمم إفريقيا', 'كأس إفريقيا', 'Africa Cup'],
        'worldcup':['World Cup', 'كأس العالم'],
        'spl':     ['السعودية - الدوري السعودي', 'Saudi Pro League', 'Saudi Professional League', 'الدوري السعودي', 'دوري روشن', 'السعودي الممتاز'],
        'ucl':     ['UEFA Champions League', 'Champions League', 'دوري أبطال أوروبا', 'أبطال أوروبا'],
    };
    
    if (!leagueMap[filter]) return false;
    return leagueMap[filter].some(l => league.toLowerCase().includes(l.toLowerCase()));
}

function createMatchRow(match, dateType) {
    const row = document.createElement('div');
    row.className = 'match-row-item';
    row.style.cursor = 'pointer';
    row.addEventListener('click', function() {
        if (match.id) {
            window.location.href = \`match-details.html?id=\${match.id}\`;
        }
    });
    
    const renderLogo = (logo, teamName) => {
        if (!logo) return '<span class="emoji-logo-small">⚽</span>';
        return \`<img src="\${logo}" alt="\${teamName}" class="team-logo-small" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=emoji-logo-small>⚽</span>';">\`;
    };
    
    const isLive = match.isLive;
    const isFinished = match.isFinished;
    const isUpcoming = !isLive && !isFinished;
    
    let centerHtml = '';
    let statusBadge = '';
    
    if (dateType === 'tomorrow' || isUpcoming) {
        centerHtml = \`
            <div class="match-time-badge">\${match.time}</div>
            <div class="match-vs-badge">\${currentLang === 'en' ? 'VS' : 'ضد'}</div>
        \`;
        statusBadge = \`<span class="match-status-badge status-upcoming">\${currentLang === 'en' ? 'Upcoming' : 'قادمة'}</span>\`;
    } else {
        const statusClass = isLive ? 'status-live' : 'status-finished';
        
        const homeScore = match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '-';
        const awayScore = match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '-';
        
        centerHtml = \`
            <div class="match-time-badge">\${match.time}</div>
            <div class="match-score-badge \${isLive ? 'live' : ''}">
                <span class="score-num">\${homeScore}</span>
                <span class="score-divider">-</span>
                <span class="score-num">\${awayScore}</span>
            </div>
        \`;
        const displayStatus = currentLang === 'ar' ? (match.statusAr || match.status) : match.status;
        statusBadge = \`<span class="match-status-badge \${statusClass}">\${displayStatus}</span>\`;
    }
    
    row.innerHTML = \`
        <!-- Home Team -->
        <div class="match-team home">
            <span class="match-team-name">\${match.homeTeam}</span>
            <div class="team-logo-container">\${renderLogo(match.homeLogo, match.homeTeam)}</div>
        </div>
        
        <!-- Info Center -->
        <div class="match-info-center">
            \${centerHtml}
            \${statusBadge}
        </div>
        
        <!-- Away Team -->
        <div class="match-team away">
            <div class="team-logo-container">\${renderLogo(match.awayLogo, match.awayTeam)}</div>
            <span class="match-team-name">\${match.awayTeam}</span>
        </div>
    \`;
    
    return row;
}
`;
    fs.writeFileSync(matchesFilePath, matchesCode, 'utf-8');
    console.log('  ✓ Wrote matches-data.js');

    // ── 4. Fetch Match Details ────────────────────────────────
    const allMatches = [...yesterdayMatches, ...todayMatches, ...tomorrowMatches];
    const existingDetails = loadExistingDetails();

    const matchDetailsDatabase = {};
    let scraped = 0;
    let cached  = 0;
    let skipped = 0;

    // Prioritize: live > today not finished > yesterday > tomorrow
    const prioritized = [
        ...allMatches.filter(m => m.isLive),
        ...allMatches.filter(m => m.date === 'today' && !m.isLive && !m.isFinished),
        ...allMatches.filter(m => m.date === 'today' && m.isFinished),
        ...allMatches.filter(m => m.date === 'yesterday'),
        ...allMatches.filter(m => m.date === 'tomorrow'),
    ];
    
    // Deduplicate
    const seen = new Set();
    const deduped = prioritized.filter(m => {
        if (!m.id || seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
    });

    console.log(`\n📊 Fetching details for ${deduped.length} matches (max ${MAX_DETAIL_SCRAPES} fresh scrapes)...`);

    for (let i = 0; i < deduped.length; i++) {
        const m = deduped[i];
        if (!m.id) { skipped++; continue; }

        const isFinished  = m.isFinished;
        const isTomorrow  = m.date === 'tomorrow';
        const alreadyHas  = existingDetails[m.id];

        // Smart caching: skip completed or upcoming matches that are already cached
        if (alreadyHas && (isFinished || isTomorrow)) {
            matchDetailsDatabase[m.id] = alreadyHas;
            cached++;
            continue;
        }

        // Respect max detail scrapes limit
        if (scraped >= MAX_DETAIL_SCRAPES) {
            if (alreadyHas) matchDetailsDatabase[m.id] = alreadyHas;
            skipped++;
            continue;
        }

        // Scrape fresh details
        process.stdout.write(`  ⚡ [${i + 1}/${deduped.length}] ${m.homeTeam} vs ${m.awayTeam} (ID: ${m.id})...`);
        const details = await fetchMatchDetails(m.id, m.link);
        matchDetailsDatabase[m.id] = details;
        scraped++;
        process.stdout.write(' ✓\n');

        await sleep(500); // Polite delay for Kooora
    }

    console.log(`\n  📈 Summary: ${scraped} scraped fresh | ${cached} from cache | ${skipped} skipped`);

    // ── 5. Write match-details-data.js ────────────────────────
    const detailsFilePath = path.join(__dirname, 'match-details-data.js');
    const detailsCode = `// Match Details Database (Auto-generated by KoraLegend Scraper — 365scores)
// Last updated: ${new Date().toISOString()}
const matchDetailsDatabase = ${JSON.stringify(matchDetailsDatabase, null, 4)};
`;
    fs.writeFileSync(detailsFilePath, detailsCode, 'utf-8');
    console.log('  ✓ Wrote match-details-data.js');

    // ── 6. Fetch and Write News ──────────────────────────────
    console.log('\n📰 Fetching latest news...');
    const newsItems = await fetchNews();
    console.log(`  ✓ Fetched ${newsItems.length} news articles`);

    const newsDatabase = {
        en: { all: newsItems },
        ar: { all: newsItems },
    };

    const newsFilePath = path.join(__dirname, 'news-data.js');
    const newsCode = `// News Database (Auto-generated by scraper)
const newsDatabase = ${JSON.stringify(newsDatabase, null, 4)};

let selectedCategory = 'all';

document.addEventListener('DOMContentLoaded', function() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            selectedCategory = this.getAttribute('data-category');
            loadNewsContent();
        });
    });
});

function loadNewsContent() {
    const container = document.getElementById('newsGrid');
    if (!container) return;
    
    let news = newsDatabase[currentLang].all;
    
    if (selectedCategory !== 'all') {
        news = news.filter(item => item.type === selectedCategory);
    }
    
    container.innerHTML = '';
    
    if (news.length === 0) {
        container.innerHTML = \`
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary); grid-column: 1 / -1;">
                <h3>\${currentLang === 'en' ? 'No news found' : 'لا توجد أخبار'}</h3>
            </div>
        \`;
        return;
    }
    
    news.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.animation = 'slideUp 0.6s ease-out backwards';
        card.style.animationDelay = \`\${index * 0.1}s\`;
        
        const imageHtml = item.image 
            ? \`<img src="\${item.image}" alt="\${item.title}" class="news-image-img" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' width=\\'105\\' height=\\'80\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23222\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23666\\' font-family=\\'sans-serif\\' font-size=\\'12\\'>Kora Legend</text></svg>';">\` 
            : \`<span style="font-size: 2.5rem;">\${item.icon || '📰'}</span>\`;
            
        // We link directly to 365scores if there's a link
        const cardContent = \`
            <div class="news-image" style="height: 200px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); overflow: hidden;">\${imageHtml}</div>
            <div class="news-content">
                <span class="news-category">\${item.category}</span>
                <h3 class="news-title">\${item.title}</h3>
                <p class="news-description">\${item.description || ''}</p>
                <div class="news-date">\${item.date}</div>
            </div>
        \`;
        
        if (item.link) {
            const anchor = document.createElement('a');
            anchor.href = item.link;
            anchor.target = '_blank';
            anchor.className = 'news-card-link';
            anchor.style.textDecoration = 'none';
            anchor.style.color = 'inherit';
            anchor.appendChild(card);
            card.innerHTML = cardContent;
            container.appendChild(anchor);
        } else {
            card.innerHTML = cardContent;
            container.appendChild(card);
        }
    });
}
`;
    fs.writeFileSync(newsFilePath, newsCode, 'utf-8');
    console.log('  ✓ Wrote news-data.js');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Scrape complete in ${elapsed}s — ${new Date().toLocaleTimeString('ar-EG', { timeZone: TIMEZONE })}`);
    
    return elapsed;
}

// ── Countdown Timer ──────────────────────────────────────────
function startCountdown(seconds, label) {
    let remaining = seconds;
    const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            process.stdout.write('\r' + ' '.repeat(60) + '\r');
            return;
        }
        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        process.stdout.write(`\r  ⏱️  ${label} in: ${mins}:${secs}   `);
    }, 1000);
    return interval;
}

// ── Entry Point ──────────────────────────────────────────────
(async () => {
    const args     = process.argv.slice(2);
    const isDaemon = args.includes('--daemon') || args.includes('-d');
    const intervalArg = args.find(a => a.startsWith('--interval='));
    const intervalMin = intervalArg ? parseInt(intervalArg.split('=')[1]) || 2 : 2;
    const intervalMs  = intervalMin * 60 * 1000;

    if (isDaemon) {
        console.log(`\n🤖 Daemon Mode — running every ${intervalMin} minute(s). Press Ctrl+C to stop.\n`);

        let isRunning = false;
        let runCount  = 0;

        const execute = async () => {
            if (isRunning) {
                console.log('\n⚠️  Previous run still in progress — skipping this cycle.');
                return;
            }
            isRunning = true;
            runCount++;
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Run #${runCount} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

            try {
                await run();
            } catch (err) {
                console.error('❌ Fatal error in run:', err.message);
            }

            isRunning = false;

            // Start countdown to next run
            console.log(`\n  💤 Next run in ${intervalMin} minute(s)...`);
            startCountdown(intervalMs / 1000, 'Next run');
        };

        // Run immediately, then repeat
        await execute();
        setInterval(execute, intervalMs);

    } else {
        // Single run
        try {
            await run();
            process.exit(0);
        } catch (err) {
            console.error('❌ Fatal error:', err.message);
            process.exit(1);
        }
    }
})();
