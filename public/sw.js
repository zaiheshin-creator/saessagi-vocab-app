/**
 * 새싹이와 오늘의 단어 PWA Service Worker
 * 전략: HTML(탐색 요청)은 Network First(온라인이면 항상 최신, 오프라인이면 캐시로 폴백).
 * 그 외 정적 자산(JS/CSS/이미지/폰트)은 Cache First — Vite가 파일명에 해시를 붙여주므로
 * 새 배포마다 새 파일명이 되고, 새 index.html이 그 새 파일명을 가리키게 된다.
 *
 * v1이 순수 Cache First라 배포해도 이미 설치된 기기에서 계속 옛날 index.html을
 * 서빙하는 문제가 있었음(index.html 자체가 캐시에 박혀서 절대 안 바뀜) — v2에서 수정.
 */
const CACHE_NAME = 'saessagi-v2';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '');
const PRECACHE = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/fonts/fredoka-700.woff2`,
  `${BASE}/icon-192.png`,
  `${BASE}/icon-512.png`,
  `${BASE}/apple-touch-icon.png`,
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // 페이지 탐색(HTML) 요청: 온라인이면 항상 네트워크에서 최신 버전을 받아온다.
  // 오프라인일 때만 캐시된 index.html로 폴백 — 이래야 배포 후 새로고침하면 바로 새 버전이 뜬다.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match(`${BASE}/index.html`)))
    );
    return;
  }

  // 그 외 정적 자산: Cache First with network fallback (내용 해시가 파일명에 있어 안전)
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request)
          .then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
            return res;
          })
          .catch(() => caches.match(`${BASE}/index.html`))
    )
  );
});
