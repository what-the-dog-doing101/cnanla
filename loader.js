console.log("LOADER STARTED");

(function () {
  console.log("LOADER EXECUTING");

  if (!window.firebase) {
    console.error("Firebase not loaded");
    return;
  }

  firebase.initializeApp({
    apiKey: "AIzaSyD0GwVrcrX855x3cLbxhX3YaI68a95TKG4",
    authDomain: "chatnowanalyticsjs.firebaseapp.com",
    projectId: "chatnowanalyticsjs",
    storageBucket: "chatnowanalyticsjs.firebasestorage.app",
    messagingSenderId: "92859267400",
    appId: "1:92859267400:web:859d4958bb218ddf689b7d"
  });

  const db = firebase.firestore();

  console.log("FIREBASE INIT OK");
console.log("FIREBASE CHECK:", window.firebase);

firebase.initializeApp({
  apiKey: "AIzaSyD0GwVrcrX855x3cLbxhX3YaI68a95TKG4",
  authDomain: "chatnowanalyticsjs.firebaseapp.com",
  projectId: "chatnowanalyticsjs"
});

console.log("APP INIT OK");

const db = firebase.firestore();

console.log("FIRESTORE OBJECT:", db);

db.collection("test").add({
  debug: true,
  time: Date.now()
})
.then((res) => {
  console.log("WRITE SUCCESS", res.id);
})
.catch((err) => {
  console.error("WRITE FAILED FULL ERROR:", err);
});
