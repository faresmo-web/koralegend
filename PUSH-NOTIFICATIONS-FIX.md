# إصلاح الإشعارات - Push Notifications Fix

## التغييرات المنجزة

### 1. توحيد إعدادات VAPID
- **server.js**: تم تحديث `webPush.setVapidDetails()` ليستخدم `'https://www.koralegend.com'` بدلاً من `'https://koralegend.com'`
- **live-server.js**: تم تحديث من `'mailto:admin@koralegend.com'` إلى `'https://www.koralegend.com'`
- كلا الخادمين الآن يستخدمان نفس VAPID keys والمنشأ (origin)

### 2. تحديث جانب العميل (script.js)
```javascript
const PUSH_ORIGIN = window.location.origin || 'https://www.koralegend.com';
function getPushUrl(path) {
    return new URL(path, PUSH_ORIGIN).toString();
}
```
- جميع طلبات الـ API تستخدم `getPushUrl()` لضمان استخدام الدومين الصحيح

### 3. إضافة رأس Service-Worker-Allowed
في server.js، عند خدمة service-worker.js:
```javascript
if (fileToServe.endsWith(path.sep + 'service-worker.js') || urlPath === '/service-worker.js') {
    headers['Service-Worker-Allowed'] = '/';
}
```

### 4. إضافة تسجيل تفصيلي (Logging)
- **من جهة الخادم**: تم إضافة logs في `sendPushToAll()` لتتبع محاولات الإرسال
- **من جهة العميل**: تم إضافة logs في `subscribeToPush()` و `initPush()` لتتبع خطوات التسجيل

## خطوات التطبيق على الإنتاج

### الخطوة 1: مسح الاشتراكات القديمة
```bash
echo '[]' > subscriptions.json
```

### الخطوة 2: التأكد من استخدام الخادم الصحيح
- استخدم `server.js` (وليس `live-server.js`)
- أو تأكد من أن كلا الخادمين متطابقان في إعدادات الـ VAPID

### الخطوة 3: إعادة تشغيل الخادم
```bash
node server.js
```

### الخطوة 4: اختبار الإشعارات
على المتصفح:
1. افتح `https://www.koralegend.com/`
2. افتح Console (F12)
3. اضغط على زر الإشعارات (جرس)
4. راقب الـ console لرؤية الـ logs
5. أعط الإذن عند طلب التطبيق

### الخطوة 5: اختبار الإرسال
```bash
curl http://localhost:3000/api/test-push
```

## ملاحظات مهمة

### VAPID Keys
- الـ VAPID keys في `vapid-keys.json` ثابتة ولا تحتاج لتغيير
- المهم هو أن تكون منسجمة بين الخادم والعميل والـ subscriptions المحفوظة

### Browser Compatibility
- الإشعارات تحتاج HTTPS على الإنتاج
- localhost و 127.0.0.1 يعملان على HTTP للتطوير

### إذا لم تعمل الإشعارات
1. افتح DevTools وتحقق من الـ console logs
2. تحقق من أن service worker مسجل: DevTools > Application > Service Workers
3. تحقق من أن الإشتراك محفوظ: DevTools > Application > Storage > Cookies > سيظهر `pushSubscribed=1`
4. تأكد من أن `/api/vapid-public-key` يرد مع مفتاح عام

## مثال: الـ Logs المتوقعة

### على الخادم (عند الإرسال):
```
[Push] Attempting to send to 1 subscriber(s)...
[Push] Sending to: https://fcm.googleapis.com/fcm/send/...
[Push] ✓ Sent successfully
```

### على المتصفح (عند التسجيل):
```
[Push] Initializing push notifications...
[Push] Registering service worker from: https://www.koralegend.com/service-worker.js
[Push] Service worker registered: ...
[Push] Service worker ready
[Push] Starting subscription flow...
[Push] Getting service worker...
[Push] Fetching VAPID from: https://www.koralegend.com/api/vapid-public-key
[Push] Got VAPID public key: ...
[Push] Subscribing to push with public key...
[Push] Subscription successful: ...
[Push] Sending subscription to: https://www.koralegend.com/api/subscribe
[Push] Server response status: 200
```

## الملفات المعدلة
- ✅ `server.js` - VAPID details + Service-Worker-Allowed + logging
- ✅ `live-server.js` - VAPID details unified
- ✅ `script.js` - Client-side URLs + comprehensive logging
- ✅ `vapid-keys.json` - (لم يتغير، الملف ثابت)

## اختبار سريع (localhost)
```bash
# 1. بدء الخادم
node server.js

# 2. في terminal آخر
curl http://127.0.0.1:3000/api/test-push

# 3. اختبر من المتصفح
http://127.0.0.1:3000/
```
