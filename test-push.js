// ============================================================
//  KoraLegend Push Notification Tester
//  Usage: node test-push.js [Message]
// ============================================================

const fs      = require('fs');
const path    = require('path');
const webPush = require('web-push');

const VAPID_FILE = path.join(__dirname, 'vapid-keys.json');
const SUBS_FILE  = path.join(__dirname, 'subscriptions.json');

if (!fs.existsSync(VAPID_FILE)) {
    console.error('❌ VAPID keys not found. Please start server.js or live-server.js first to generate them.');
    process.exit(1);
}

if (!fs.existsSync(SUBS_FILE)) {
    console.warn('⚠️ Subscriptions file not found. Please open the website, click the 🔔 bell icon to subscribe first!');
    process.exit(1);
}

const vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
const subs      = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));

if (subs.length === 0) {
    console.warn('⚠️ No active subscribers found in subscriptions.json. Please open the website and click the 🔔 bell icon first!');
    process.exit(1);
}

webPush.setVapidDetails(
    'mailto:admin@koralegend.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const messageText = process.argv[2] || 'هدف لصالح ريال مدريد! ⚽🔥';

const payload = {
    title: '🔥 هدف تجريبي!',
    body: messageText,
    icon: '/logo.png',
    data: { url: '/matches' }
};

console.log(`📡 Sending test push to ${subs.length} subscriber(s)...`);

Promise.allSettled(
    subs.map(sub => webPush.sendNotification(sub, JSON.stringify(payload)))
).then(results => {
    let success = 0;
    let failed = 0;
    results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
            success++;
        } else {
            failed++;
            console.error(`❌ Subscription ${idx} failed:`, r.reason.message);
        }
    });
    console.log(`\n📊 Test completed: ${success} sent successfully, ${failed} failed.`);
});
