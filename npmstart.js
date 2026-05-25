console.log("CHATNOW ANALYTICS LOADED");

const firebaseConfig = {
  apiKey: "AIzaSyD0GwVrcrX855x3cLbxhX3YaI68a95TKG4",
  authDomain: "chatnowanalyticsjs.firebaseapp.com",
  projectId: "chatnowanalyticsjs",
  storageBucket: "chatnowanalyticsjs.firebasestorage.app",
  messagingSenderId: "92859267400",
  appId: "1:92859267400:web:859d4958bb218ddf689b7d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ---------------- USER / SESSION ID ---------------- */

let userId = localStorage.getItem("cn_user");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("cn_user", userId);
}

const sessionId = crypto.randomUUID();

const startTime = Date.now();
const pageStart = Date.now();

let firstInteraction = null;
let maxScroll = 0;
let activeTime = 0;
let lastActive = Date.now();

/* ---------------- DEVICE ---------------- */

function getDevice() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages || [],
    cookieEnabled: navigator.cookieEnabled,
    online: navigator.onLine,

    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemory: navigator.deviceMemory || null,

    screenWidth: screen.width,
    screenHeight: screen.height,
    pixelRatio: window.devicePixelRatio || 1,

    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,

    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    connection: navigator.connection?.effectiveType || null,

    referrer: document.referrer || null,
    url: location.href,
    path: location.pathname
  };
}

/* ---------------- COUNTRY ---------------- */

async function getCountry() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_name || "unknown";
  } catch {
    return "unknown";
  }
}

/* ---------------- ACTION WRITER ---------------- */

function addAction(type, data = {}) {
  return db
    .collection("sessions")
    .doc(userId)
    .collection("actions")
    .add({
      sessionId,
      userId,
      type,
      timestamp: Date.now(),
      page: location.href,
      ...data
    })
    .catch(e => console.error("ACTION WRITE ERROR:", e));
}

/* ---------------- SESSION CREATE ---------------- */

(async () => {
  const country = await getCountry();
  const device = getDevice();

  db.collection("sessions").doc(userId).set({
    userId,
    sessionId,
    startTime,
    country,
    device,
    referrer: document.referrer || null,
    entryPage: location.href
  }).catch(e => console.error("SESSION WRITE ERROR:", e));

  addAction("session_start");
})();

/* ---------------- ACTIVITY ---------------- */

function markActive() {
  activeTime += Date.now() - lastActive;
  lastActive = Date.now();
}

function markInteraction() {
  if (!firstInteraction) firstInteraction = Date.now() - pageStart;
}

["mousemove", "keydown", "click"].forEach(e =>
  window.addEventListener(e, markActive)
);

/* ---------------- SCROLL ---------------- */

window.addEventListener("scroll", () => {
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrolled = Math.round((window.scrollY / docHeight) * 100);
  if (scrolled > maxScroll) maxScroll = scrolled;

  addAction("scroll", { depth: scrolled });
});

/* ---------------- CLICK TRACKING ---------------- */

document.addEventListener("click", (e) => {
  markInteraction();

  const el = e.target.closest("a, button");

  addAction("click_position", {
    x: e.clientX,
    y: e.clientY
  });

  if (!el) return;

  addAction("click", {
    tag: el.tagName.toLowerCase(),
    text: el.innerText?.slice(0, 80) || null,
    url: el.href || null,
    id: el.id || null,
    dataset: el.dataset.track || null
  });
});

/* ---------------- PERFORMANCE ---------------- */

window.addEventListener("load", () => {
  const loadTime = Date.now() - startTime;

  addAction("performance", {
    loadTime
  });
});

/* ---------------- SESSION END ---------------- */

window.addEventListener("beforeunload", () => {
  addAction("session_end", {
    duration: Date.now() - startTime,
    timeOnPage: Date.now() - pageStart,
    firstInteraction,
    maxScroll,
    activeTime
  });
});
