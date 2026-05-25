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

/* ---------------- SESSION ---------------- */

let sessionId = localStorage.getItem("cn_session");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem("cn_session", sessionId);
}

const startTime = Date.now();
const pageStart = Date.now();

let firstInteraction = null;
let maxScroll = 0;
let lastActive = Date.now();
let activeTime = 0;

/* ---------------- HELPERS ---------------- */

function markActive() {
  activeTime += Date.now() - lastActive;
  lastActive = Date.now();
}

function markInteraction() {
  if (!firstInteraction) firstInteraction = Date.now() - pageStart;
}

function send(collection, data) {
  return db.collection(collection).add({
    sessionId,
    page: location.href,
    timestamp: Date.now(),
    ...data
  }).catch(e => console.error("WRITE ERROR:", e));
}

/* ---------------- DEVICE INFO ---------------- */

function getDevice() {
  return {
    browser: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: screen.width + "x" + screen.height
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

/* ---------------- PAGEVIEW ---------------- */

send("pageviews", {
  type: "page_view",
  referrer: document.referrer || null,
  entryPage: location.href
});

/* ---------------- SESSION START ---------------- */

(async () => {
  const country = await getCountry();
  const device = getDevice();

  db.collection("sessions").doc(sessionId).set({
    sessionId,
    startTime,
    country,
    device,
    referrer: document.referrer || null,
    entryPage: location.href
  }).catch(e => console.error("SESSION WRITE ERROR:", e));
})();

/* ---------------- ACTIVITY TRACKING ---------------- */

["mousemove", "keydown", "click"].forEach(e =>
  window.addEventListener(e, markActive)
);

/* ---------------- SCROLL DEPTH ---------------- */

window.addEventListener("scroll", () => {
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrolled = Math.round((window.scrollY / docHeight) * 100);
  if (scrolled > maxScroll) maxScroll = scrolled;
});

/* ---------------- CLICK TRACKING ---------------- */

document.addEventListener("click", (e) => {
  markInteraction();

  const el = e.target.closest("a, button");

  send("events", {
    type: "click_position",
    x: e.clientX,
    y: e.clientY
  });

  if (!el) return;

  send("events", {
    type: "click",
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

  send("performance", {
    type: "load_time",
    value: loadTime
  });
});

/* ---------------- SESSION END ---------------- */

window.addEventListener("beforeunload", () => {
  send("sessions", {
    type: "session_end",
    duration: Date.now() - startTime,
    timeOnPage: Date.now() - pageStart,
    firstInteraction,
    scrollDepth: maxScroll,
    activeTime
  });
});
