(function () {
  function loadScript(src, onLoad, onError) {
    const s = document.createElement("script");
    s.src = src;
    s.onload = onLoad;
    s.onerror = onError;
    document.head.appendChild(s); 
  }

  function start() {
    loadScript(
      "https:what-the-dog-doing101.github.io/cnanla/loader.js",
      () => console.log("ANALYTICS READY"),
      (e) => console.log("ANALYTICS FAILED", e)
    );
  }


  if (window.firebase) {
    start();
  } else {
  
    loadScript(
      "https:www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js",
      () => {
  
        loadScript(
          "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js",
          () => {
      
            start();
          },
          (e) => console.error("FIRESTORE LOAD FAILED", e)
        );
      },
      (e) => console.error("FIREBASE APP LOAD FAILED", e)
    );
  }
})();
