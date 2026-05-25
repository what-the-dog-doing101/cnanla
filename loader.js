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

console.log("TEST WRITE START");

firebase.initializeApp({
  apiKey: "AIzaSyD0GwVrcrX855x3cLbxhX3YaI68a95TKG4",
  authDomain: "chatnowanalyticsjs.firebaseapp.com",
  projectId: "chatnowanalyticsjs"
});

const db = firebase.firestore();

db.collection("test").add({
  hello: "world",
  time: Date.now()
})
.then(() => console.log("WRITE OK"))
.catch(e => console.error("WRITE FAILED:", e));

let sessionId = localStorage.getItem("cn_session");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem("cn_session", sessionId);
}

const startTime = Date.now();
const pageStart = Date.now();

let firstInteraction = null;
let maxScroll = 0;
let activeTime = 0;
let lastActive = Date.now();

function markInteraction() {
  if (!firstInteraction) firstInteraction = Date.now() - pageStart;
}

function markActive() {
  activeTime += Date.now() - lastActive;
  lastActive = Date.now();
}

function send(collectionName, data) {
  return db.collection(collectionName).add({
    sessionId,
    timestamp: Date.now(),
    page: location.pathname,
    ...data
  }).catch(err => console.error("Firestore write failed:", err));
}

async function getCountry() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_name || "unknown";
  } catch {
    return "unknown";
  }
}

function getDevice() {
  return {
    browser: navigator.userAgent,
    os: navigator.platform,
    language: navigator.language,
    screenSize: screen.width + "x" + screen.height
  };
}

let path = JSON.parse(sessionStorage.getItem("cn_path") || "[]");
path.push(location.pathname);
sessionStorage.setItem("cn_path", JSON.stringify(path));

let reloads = Number(sessionStorage.getItem("cn_reload") || 0);
reloads++;
sessionStorage.setItem("cn_reload", reloads);

window.addEventListener("scroll", () => {
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrolled = Math.round((window.scrollY / docHeight) * 100);
  if (scrolled > maxScroll) maxScroll = scrolled;
});

["mousemove", "keydown", "click"].forEach(e =>
  window.addEventListener(e, markActive)
);

document.addEventListener("click", (e) => {
  markInteraction();

  const x = e.clientX;
  const y = e.clientY;

  send("events", {
    type: "click_position",
    x,
    y
  });

  const el = e.target.closest("a, button");
  if (!el) return;

  const name =
    el.dataset.track ||
    el.id ||
    (el.tagName === "A" ? "link_click" : "button_click");

  const url = el.href || el.dataset.url || null;

  send("events", {
    type: "click",
    name,
    url,
    elementType: el.tagName.toLowerCase()
  });
});

(async function init() {
  const country = await getCountry();
  const device = getDevice();

  try {
    await db.collection("sessions").doc(sessionId).set({
      startTime,
      referrer: document.referrer || null,
      entryPage: location.pathname,
      country,
      deviceBrowser: device.browser,
      deviceOS: device.os,
      deviceLanguage: device.language,
      screenSize: device.screenSize
    });
  } catch (e) {
    console.error("Session write failed:", e);
  }
})();

send("pageviews", {
  type: "page_view"
});

window.addEventListener("load", () => {
  const loadTime = Date.now() - performance.timing.navigationStart;

  send("performance", {
    type: "load_time",
    value: loadTime
  });
});

window.addEventListener("beforeunload", () => {
  db.collection("sessions").doc(sessionId).set({
    endTime: Date.now(),
    duration: Date.now() - startTime,
    timeOnPage: Date.now() - pageStart,
    firstInteraction,
    scrollDepth: maxScroll,
    reloadCount: reloads,
    activeTime,
    navigationPath: path
  }, { merge: true });
});
