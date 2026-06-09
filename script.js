const menuToggle=document.getElementById("menuToggle");const navMenu=document.getElementById("navMenu");const year=document.getElementById("year");if(menuToggle&&navMenu){menuToggle.addEventListener("click",()=>{navMenu.classList.toggle("open")});document.querySelectorAll(".nav a").forEach(link=>{link.addEventListener("click",()=>{navMenu.classList.remove("open")})})}if(year){year.textContent=new Date().getFullYear()}

/* Tiny music player */
const musicPlayer = document.getElementById("musicPlayer");
const playerToggle = document.getElementById("playerToggle");
const playerHost = document.getElementById("playerHost");
const VIDEO_ID = musicPlayer && musicPlayer.dataset.videoId ? musicPlayer.dataset.videoId : "";
let playerReady = false;

function createPlayer() {
  if (playerHost.children.length) return;
  const iframe = document.createElement("iframe");
  iframe.src = "https://www.youtube.com/embed/" + VIDEO_ID + "?autoplay=1&mute=1&controls=0";
  iframe.setAttribute("allow", "autoplay; encrypted-media");
  iframe.setAttribute("allowfullscreen", "");
  iframe.style.position = "absolute";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  playerHost.appendChild(iframe);
}

if (musicPlayer && playerToggle) {
  musicPlayer.addEventListener("click", () => {
    createPlayer();
  });

  playerToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    createPlayer();
  });
}
