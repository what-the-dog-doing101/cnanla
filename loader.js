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

  // TEST WRITE (THIS PROVES EVERYTHING WORKS)
  db.collection("test").add({
    ok: true,
    time: Date.now(),
    page: location.href
  })
  .then(() => {
    console.log("WRITE SUCCESS");
  })
  .catch((e) => {
    console.error("WRITE FAILED", e);
  });

})();
