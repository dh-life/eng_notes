// 나의 영어 노트 – 오프라인에서도 열리도록 화면 파일을 기기에 보관합니다.
// 화면 파일을 고친 뒤에는 VERSION 숫자를 하나 올려 주세요.
const VERSION = "enote-v7";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/icon-32.png", "icons/icon-maskable-512.png"];
const CDN = "https://cdn.jsdelivr.net/";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;                      // 구글 시트 동기화(POST)는 그대로 보냄
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // 화면: 인터넷이 되면 새 파일, 안 되면 보관해 둔 파일
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else if (req.url.startsWith(CDN)) {
    // 워드 변환 도구: 한 번 받으면 보관
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })));
  }
});
