(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const WA_NUMBER = "6285600599514";
  const storage = {
    get(k, fallback="") { try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let soundEnabled = storage.get("eoa-sound", "on") !== "off";
  let audioContext = null;

  function toast(message, type="info") {
    const node = document.createElement("div");
    node.className = `toast ${type}`; node.textContent = message;
    $("#toastContainer").append(node);
    requestAnimationFrame(() => node.classList.add("show"));
    setTimeout(() => { node.classList.remove("show"); setTimeout(() => node.remove(), 300); }, 3200);
  }
  function applyTheme(theme) {
    const light = theme === "light";
    document.body.classList.toggle("light-mode", light);
    const b = $("#themeButton"); b.textContent = light ? "☼" : "◐";
    b.title = light ? "Aktifkan mode gelap" : "Aktifkan mode terang";
    b.setAttribute("aria-label", b.title);
    $('meta[name="theme-color"]')?.setAttribute("content", light ? "#f4f5fb" : "#090914");
  }
  function updateSoundButton() {
    const b = $("#soundButton"); b.textContent = soundEnabled ? "♫" : "♩";
    b.title = soundEnabled ? "Matikan suara" : "Aktifkan suara";
    b.setAttribute("aria-label", b.title); b.classList.toggle("sound-muted", !soundEnabled);
  }
  function playClickSound() {
    if (!soundEnabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
      audioContext ||= new Ctx(); if (audioContext.state === "suspended") audioContext.resume();
      const now = audioContext.currentTime, osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(660, now); osc.frequency.exponentialRampToValueAtTime(440, now+.045);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.04, now+.008); gain.gain.exponentialRampToValueAtTime(.0001, now+.075);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now+.08);
    } catch {}
  }
  function showModal(id) { const m=$("#"+id); m.classList.add("open"); m.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open"); }
  function closeModal(id) { const m=$("#"+id); m.classList.remove("open"); m.setAttribute("aria-hidden","true"); if (!$(".modal-backdrop.open")) document.body.classList.remove("modal-open"); }
  function openJoinForm() { $("#authForm").reset(); $("#authMessage").textContent=""; showModal("authModal"); }
  function openWhatsApp(message) { window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer"); }
  function navigate(page) {
    if (page === "admin") return toast("Pengelolaan anggota dan pengumuman dilakukan langsung oleh pengelola.", "info");
    $$(".page").forEach(el => el.classList.toggle("active", el.id === `page-${page}`));
    $$(".nav-link").forEach(el => el.classList.toggle("active", el.dataset.page === page));
    $("#breadcrumbPage").textContent = ({overview:"Overview", solar:"Observatorium", members:"Anggota", announcements:"Pengumuman", owner:"Tentang Owner"})[page] || "Overview";
    $("#sidebar").classList.remove("mobile-open"); window.scrollTo({top:0,behavior:"smooth"});
  }
  function escapeHTML(v="") { return String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function formatDate(v) { return new Intl.DateTimeFormat("id-ID", {day:"numeric",month:"long",year:"numeric"}).format(new Date(v)); }
  function initials(name="EOA Member") { return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase(); }

  applyTheme(storage.get("eoa-theme", "dark")); updateSoundButton();
  $("#currentDate").textContent = new Intl.DateTimeFormat("id-ID", {weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
  $("#connectionText").textContent = "Pendaftaran via WhatsApp";
  $("#sideName").textContent = "Pengunjung"; $("#sideRole").textContent = "Belum mendaftar"; $("#sideAvatar").textContent = "EOA";
  $("#authButton").innerHTML = "Daftar <span>↗</span>";

  const fallbackSettings = {
    welcome_title:"Membangun koneksi, menciptakan dampak.",
    welcome_description:"Ruang kolaborasi untuk bertumbuh, berbagi gagasan, dan menciptakan karya.",
    about_title:"Satu ruang, banyak kemungkinan.",
    about_text:"EOA Community menjadi tempat bertukar ide, membangun relasi, dan mengembangkan proyek bersama."
  };
  const localSettings = (() => { try { return JSON.parse(storage.get("eoa-v5-settings", "{}")); } catch { return {}; } })();
  const settings = {...fallbackSettings, ...localSettings};
  const titleParts = settings.welcome_title.split(",");
  $("#welcomeTitle").innerHTML = `${escapeHTML(titleParts[0] || settings.welcome_title)}<br><em>${escapeHTML(titleParts.slice(1).join(",").trim() || "menciptakan dampak.")}</em>`;
  $("#welcomeDescription").textContent = settings.welcome_description;
  $("#aboutTitle").textContent = settings.about_title; $("#aboutText").textContent = settings.about_text;
  if ($("#settingsForm")) Object.keys(fallbackSettings).forEach(k => { if ($("#settingsForm").elements[k]) $("#settingsForm").elements[k].value=settings[k]; });

  const announcements = [
    {title:"Selamat datang di EOA Community",category:"Pengumuman",body:"EOA Community menjadi ruang untuk terhubung, berbagi pengetahuan, dan mengembangkan gagasan bersama.",created_at:"2026-11-18"},
    {title:"Pendaftaran anggota dibuka",category:"Informasi",body:"Calon anggota dapat mengisi formulir pendaftaran dan mengirimkannya langsung kepada pengelola melalui WhatsApp resmi EOA.",created_at:"2026-11-18"},
    {title:"Jelajahi Observatorium EOA",category:"Kegiatan",body:"Gunakan halaman Observatorium untuk menjelajahi simulasi tata surya dan menikmati playlist Spotify komunitas.",created_at:"2026-11-18"}
  ];
  function announcementCard(item, compact=false) { return `<article class="announcement-item ${compact?"compact":""}"><div class="announcement-meta"><span class="category-tag">${escapeHTML(item.category)}</span><time>${formatDate(item.created_at)}</time></div><h4>${escapeHTML(item.title)}</h4><p>${escapeHTML(item.body)}</p></article>`; }
  $("#latestAnnouncements").innerHTML = announcements.slice(0,2).map(x=>announcementCard(x,true)).join("");
  $("#announcementFeed").innerHTML = announcements.map(x=>announcementCard(x)).join("");
  $("#totalMembers").textContent = "—"; $("#activeMembers").textContent = "—"; $("#pendingMembers").textContent = "—"; $("#announcementCount").textContent = announcements.length;
  $("#membersGrid").innerHTML = `<div class="empty-state">Daftar anggota tidak ditampilkan di website ini. Pendaftaran dan konfirmasi keanggotaan dikelola langsung melalui WhatsApp EOA.</div>`;
  $("#memberSearch").disabled = true; $("#memberFilter").disabled = true;
  if ($("#pendingAdminCount")) $("#pendingAdminCount").textContent="0";
  if ($("#pendingList")) $("#pendingList").innerHTML=`<div class="empty-state">Permintaan pendaftaran masuk langsung ke WhatsApp pengelola.</div>`;
  if ($("#adminAnnouncementList")) $("#adminAnnouncementList").innerHTML=`<div class="empty-state">Pengumuman contoh ditampilkan secara statis. Tidak ada database bersama.</div>`;

  $$(".nav-link[data-page]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
  $$('[data-goto]').forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.goto)));
  $("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.toggle("mobile-open"));
  $("#themeButton").addEventListener("click",()=>{const next=document.body.classList.contains("light-mode")?"dark":"light";storage.set("eoa-theme",next);applyTheme(next);});
  $("#soundButton").addEventListener("click",()=>{soundEnabled=!soundEnabled;storage.set("eoa-sound",soundEnabled?"on":"off");updateSoundButton();if(soundEnabled)playClickSound();});
  $("#authButton").addEventListener("click",openJoinForm); $("#profileButton").addEventListener("click",openJoinForm);
  $("#joinButton").addEventListener("click",openJoinForm); $("#memberJoinButton").addEventListener("click",openJoinForm);
  $$('[data-close]').forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
  $$(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id);}));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".modal-backdrop.open").forEach(m=>closeModal(m.id));});

  // Registration is a WhatsApp handoff. No account/password or remote database is created.
  $("#authForm").addEventListener("submit",e=>{
    e.preventDefault(); const f=new FormData(e.currentTarget);
    const name=String(f.get("full_name")||"").trim(), city=String(f.get("city")||"").trim(), interest=String(f.get("interest")||"").trim();
    if(!name || !city) { $("#authMessage").textContent="Nama dan kota wajib diisi."; $("#authMessage").className="form-message error"; return; }
    const message=["Halo Admin EOA Community!","Saya ingin mendaftar sebagai anggota EOA Community.","",`Nama: ${name}`,`Kota/Daerah: ${city}`,`Minat: ${interest || "Belum ditentukan"}`,"","Mohon informasi tahap selanjutnya. Terima kasih."].join("\n");
    closeModal("authModal"); openWhatsApp(message); toast("Formulir disiapkan. Selesaikan pengiriman melalui WhatsApp.","success"); e.currentTarget.reset();
  });
  if ($("#settingsForm")) $("#settingsForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.currentTarget),next={};Object.keys(fallbackSettings).forEach(k=>next[k]=String(f.get(k)||"").trim());storage.set("eoa-v5-settings",JSON.stringify(next));toast("Tersimpan di browser ini saja.","success");});
  if ($("#newAnnouncementButton")) $("#newAnnouncementButton").hidden=true;
  if ($("#adminNewAnnouncement")) $("#adminNewAnnouncement").hidden=true;
  if ($("#announcementForm")) $("#announcementForm").addEventListener("submit",e=>{e.preventDefault();toast("Penerbitan pengumuman bersama memerlukan server atau layanan database.","error");});

  // Solar system controls retained from V5.
  const solarSystem=$("#solarSystem"), solarZoom=$("#solarZoom"), orbitSpeed=$("#orbitSpeed"), pauseButton=$("#orbitPauseButton");
  const orbitTracks=$$(".orbit-track",solarSystem), baseOrbitDurations=[7,10,14,18,25,32,40,49]; let orbitPaused=false;
  function applyOrbitSpeed(speed){orbitTracks.forEach((track,i)=>track.style.setProperty("--orbit-duration",`${baseOrbitDurations[i]/speed}s`));$("#speedValue").textContent=`${Number(speed).toFixed(1)}×`;}
  function applySolarZoom(value){solarSystem.style.setProperty("--solar-zoom",Number(value)/100);$("#zoomValue").textContent=`${value}%`;}
  pauseButton.addEventListener("click",()=>{orbitPaused=!orbitPaused;solarSystem.classList.toggle("is-paused",orbitPaused);pauseButton.innerHTML=orbitPaused?"▶ Lanjutkan orbit":"Ⅱ Jeda orbit";pauseButton.setAttribute("aria-pressed",String(orbitPaused));});
  solarZoom.addEventListener("input",e=>applySolarZoom(e.target.value)); orbitSpeed.addEventListener("input",e=>applyOrbitSpeed(e.target.value));
  $("#solarResetButton").addEventListener("click",()=>{solarZoom.value="100";orbitSpeed.value="1";applySolarZoom(100);applyOrbitSpeed(1);orbitPaused=false;solarSystem.classList.remove("is-paused");pauseButton.innerHTML="Ⅱ Jeda orbit";pauseButton.setAttribute("aria-pressed","false");});
  applyOrbitSpeed(orbitSpeed.value);applySolarZoom(solarZoom.value);

  // Spotify official playlist embed retained from V5.
  const spotifyInput=$("#spotifyPlaylistUrl"),spotifyWrap=$("#spotifyEmbedWrap");
  const savedSpotifyUrl=storage.get("eoa-spotify-playlist","");
  function loadSpotifyPlaylist(raw,persist=true){let id="";try{const u=new URL(raw);const m=u.hostname==="open.spotify.com"&&u.pathname.match(/^\/(?:embed\/)?playlist\/([A-Za-z0-9]{22})\/?$/);if(m)id=m[1];}catch{}
    if(!id){spotifyWrap.innerHTML='<div class="spotify-empty"><span>♫</span><b>Tautan playlist tidak valid</b><small>Gunakan URL playlist dari open.spotify.com.</small></div>';return false;}
    const iframe=document.createElement("iframe");iframe.title="Spotify playlist EOA Community";iframe.src=`https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;iframe.width="100%";iframe.height="352";iframe.setAttribute("frameborder","0");iframe.setAttribute("allow","autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");iframe.setAttribute("loading","lazy");iframe.setAttribute("referrerpolicy","strict-origin-when-cross-origin");spotifyWrap.replaceChildren(iframe);if(persist)storage.set("eoa-spotify-playlist",`https://open.spotify.com/playlist/${id}`);return true;}
  if(savedSpotifyUrl){spotifyInput.value=savedSpotifyUrl;loadSpotifyPlaylist(savedSpotifyUrl,false);}
  $("#spotifyForm").addEventListener("submit",e=>{e.preventDefault();const ok=loadSpotifyPlaylist(spotifyInput.value.trim());toast(ok?"Playlist Spotify berhasil dimuat.":"Periksa kembali tautan playlist Spotify.",ok?"success":"error");});

  document.addEventListener("pointerdown",e=>{const t=e.target.closest("button,a,[role='button']");if(!t||t.disabled||t.classList.contains("no-click-effect"))return;t.classList.remove("tap-feedback");if(!prefersReducedMotion){void t.offsetWidth;t.classList.add("tap-feedback");}},{passive:true});
  document.addEventListener("click",e=>{const t=e.target.closest("button,a,[role='button']");if(t&&!t.disabled&&t.id!=="soundButton")playClickSound();},true);
  const revealSelector=".stat-card,.panel,.member-card,.announcement-item,.owner-profile,.owner-vision";
  if("IntersectionObserver" in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("revealed");observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:"0px 0px 40px 0px"});document.querySelectorAll(revealSelector).forEach(el=>observer.observe(el));}
  const heroCard=$(".hero-card");
  if(heroCard&&matchMedia("(hover:hover) and (pointer:fine)").matches&&!prefersReducedMotion){let frame=0,point=null;heroCard.addEventListener("pointermove",e=>{point={x:e.clientX,y:e.clientY};if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const r=heroCard.getBoundingClientRect(),x=(point.x-r.left)/r.width-.5,y=(point.y-r.top)/r.height-.5;heroCard.style.setProperty("--hero-rx",`${-y*3.2}deg`);heroCard.style.setProperty("--hero-ry",`${x*4}deg`);});},{passive:true});heroCard.addEventListener("pointerleave",()=>{if(frame)cancelAnimationFrame(frame);heroCard.style.setProperty("--hero-rx","0deg");heroCard.style.setProperty("--hero-ry","0deg");},{passive:true});}
})();
