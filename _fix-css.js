const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, 'styles.min.css');
let content = fs.readFileSync(cssFile, 'utf8');

// Remove any previously injected bell styles
const marker = '.notif-nav-item';
const idx = content.indexOf(marker);
if (idx > -1) {
    content = content.substring(0, idx).trimEnd();
}

// Bell CSS to append
const bellCSS = [
    '.notif-nav-item{display:flex;align-items:center;}',
    '.notif-btn{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--text-secondary);font-family:var(--font-body);font-size:1.1rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding:var(--spacing-xs) var(--spacing-sm);position:relative;transition:var(--transition-normal);outline:none;}',
    '.notif-btn::after{content:"";position:absolute;bottom:-5px;left:0;width:0;height:3px;background:var(--gradient-1);transition:var(--transition-normal);border-radius:2px;}',
    '.notif-btn:hover,.notif-btn.active{color:var(--primary-color);}',
    '.notif-btn:hover::after,.notif-btn.active::after{width:100%;}',
    '.notif-icon{width:18px;height:18px;flex-shrink:0;transition:var(--transition-normal);}',
    '.notif-btn:hover .notif-icon,.notif-btn.active .notif-icon{filter:drop-shadow(0 0 6px rgba(0,102,255,0.6));transform:rotate(-8deg) scale(1.15);}',
    '.notif-btn.active .notif-icon{animation:bellShake 4s ease-in-out infinite;}',
    '@keyframes bellShake{0%,85%,100%{transform:rotate(0deg) scale(1);}88%{transform:rotate(-12deg) scale(1.1);}92%{transform:rotate(10deg) scale(1.1);}96%{transform:rotate(-6deg) scale(1.05);}98%{transform:rotate(4deg) scale(1.05);}}',
    '.notif-label{font-size:1.1rem;}',
    '.notif-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:#4ade80;border:1.5px solid var(--darker-bg);display:none;}',
    '.notif-btn.active .notif-dot{display:block;animation:dotPing 2s ease-in-out infinite;}',
    '@keyframes dotPing{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.4);opacity:0.6;}}',
    '.push-toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(100px);background:rgba(15,23,42,0.92);backdrop-filter:blur(20px);border:1px solid rgba(0,102,255,0.4);border-radius:14px;padding:14px 22px;color:var(--text-primary);font-family:var(--font-body);font-size:0.95rem;font-weight:600;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.5);opacity:0;transition:transform 0.4s cubic-bezier(0.16,1,0.3,1),opacity 0.4s ease;white-space:nowrap;max-width:90vw;}',
    '.push-toast.show{transform:translateX(-50%) translateY(0);opacity:1;}',
    '.push-toast.error{border-color:rgba(255,51,102,0.5);}',
    '@media (max-width:992px){.notif-btn{font-size:1.25rem!important;width:100%;display:flex;padding:var(--spacing-xs) 0;}.notif-btn::after{display:none!important;}.notif-icon{width:20px;height:20px;}}'
].join('');

fs.writeFileSync(cssFile, content + '\n' + bellCSS, 'utf8');
console.log('Done! File size:', fs.statSync(cssFile).size, 'bytes');
