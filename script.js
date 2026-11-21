const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const eventInfo = {
  names: "George & Monica",
  monogram: "G&M",
  slug: "george-monica-wedding",
  startsAt: "2027-06-13T17:00:00-06:00",
  endsAt: "2027-06-13T23:00:00-06:00",
  date: {
    es: "13 de junio de 2027",
    en: "June 13, 2027"
  },
  time: {
    es: "17:00 h",
    en: "5:00 PM"
  },
  venue: "The Red Earth Venue",
  address: {
    es: "545 UT-313, Moab, Utah 84532, Estados Unidos",
    en: "545 UT-313, Moab, UT 84532, United States"
  },
  mapUrl: "https://www.google.com/maps?aep=1&cs=1&sca_esv=dced30208946f18c&udm=50&pvq=Cg0vZy8xMW1oZzAwNXk4gAEC&fvr=1&vet=10CAAQoqAOahcKEwioipD9u5mYAxUAAAAAHQAAAAAQBQ..i&um=1&ie=UTF-8&fb=1&gl=ar&sa=X&ftid=0x874873863fc971bd:0x5e455173d09e9562"
};

const copy = {
  es: {
    pageTitle: "{names} · Guarda la fecha",
    skip: "Saltar",
    soundOn: "Activar sonido",
    soundOff: "Silenciar sonido",
    scroll: "Desliza",
    heroKicker: "SAVE THE DATE",
    heroVerb: "nos casamos",
    heroNote: "El amor nos trajo hasta aquí, y queremos celebrar este nuevo capítulo rodeados de quienes más queremos. Reservá esta fecha para compartir con nosotros un momento inolvidable",
    dateEyebrow: "LA FECHA",
    countdownLabel: "Faltan",
    days: "Días",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    calendarLabel: "Agrega la fecha a tu calendario",
    google: "Google Calendar",
    apple: "Apple Calendar",
    footerSign: "Con amor, {names}",
    footerNote: "Te esperamos",
    calendarTitle: "{names} · Save the date",
    calendarDetails: "{names} nos casamos el {date} a las {time}.\nLugar: {venue}, {address}.\nUbicación: {mapUrl}\n\nGuarda la fecha y pronto te compartiremos todos los detalles."
  },
  en: {
    pageTitle: "{names} · Save the date",
    skip: "Skip",
    soundOn: "Turn sound on",
    soundOff: "Turn sound off",
    scroll: "Scroll",
    heroKicker: "SAVE THE DATE",
    heroVerb: "we're getting married",
    heroNote: "Love brought us here, and we want to celebrate this new chapter surrounded by the people we love most. Save this date to share an unforgettable moment with us.",
    dateEyebrow: "THE DATE",
    countdownLabel: "Time to go",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    calendarLabel: "Add the date to your calendar",
    google: "Google Calendar",
    apple: "Apple Calendar",
    footerSign: "With love, {names}",
    footerNote: "We can't wait",
    calendarTitle: "{names} · Save the date",
    calendarDetails: "{names} are getting married on {date} at {time}.\nVenue: {venue}, {address}.\nLocation: {mapUrl}\n\nSave the date — we'll share all the details soon."
  }
};

let lang = "en";

function translateValue(value) {
  return String(value || "")
    .replace(/\{names\}/g, eventInfo.names)
    .replace(/\{venue\}/g, eventInfo.venue)
    .replace(/\{address\}/g, eventInfo.address[lang])
    .replace(/\{date\}/g, eventInfo.date[lang])
    .replace(/\{time\}/g, eventInfo.time[lang])
    .replace(/\{mapUrl\}/g, eventInfo.mapUrl || "");
}

function t(key) {
  return translateValue((copy[lang] && copy[lang][key]) || copy.es[key] || "");
}

function applyLanguage() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.getAttribute("data-i18n"));
  });
  document.title = t("pageTitle");
  document.documentElement.lang = lang;
  const soundLabel = introVideo.muted ? t("soundOn") : t("soundOff");
  $("soundButton").setAttribute("aria-label", soundLabel);
  $("soundButton").setAttribute("title", soundLabel);
  $("heroNames").textContent = eventInfo.names;
  $("dateText").textContent = eventInfo.date[lang];
  $("timeText").textContent = eventInfo.time[lang];
  $("languageButton").textContent = lang === "es" ? "English" : "Español";
  $("languageButton").setAttribute("aria-label", lang === "es" ? "Switch to English" : "Cambiar a español");
}

$("languageButton").addEventListener("click", () => {
  lang = lang === "es" ? "en" : "es";
  applyLanguage();
});

const target = new Date(eventInfo.startsAt).getTime();

function updateCountdown() {
  const diff = target - Date.now();
  const values = ["cdDays", "cdHours", "cdMinutes", "cdSeconds"];

  if (diff <= 0) {
    values.forEach((id, index) => {
      $(id).textContent = index === 0 ? "0" : "00";
    });
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  $("cdDays").textContent = String(days);
  $("cdHours").textContent = String(hours).padStart(2, "0");
  $("cdMinutes").textContent = String(minutes).padStart(2, "0");
  $("cdSeconds").textContent = String(seconds).padStart(2, "0");
}

function icsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function venueLocation() {
  return `${eventInfo.venue}, ${eventInfo.address[lang]}`;
}

function googleCalendarUrl() {
  const start = new Date(eventInfo.startsAt);
  const end = new Date(eventInfo.endsAt);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: t("calendarTitle"),
    dates: `${icsDate(start)}/${icsDate(end)}`,
    details: t("calendarDetails"),
    location: venueLocation()
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcs() {
  const start = new Date(eventInfo.startsAt);
  const end = new Date(eventInfo.endsAt);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${eventInfo.slug}//ES`,
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${eventInfo.slug}-${start.getTime()}@save-the-date`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escapeIcs(t("calendarTitle"))}`,
    `DESCRIPTION:${escapeIcs(t("calendarDetails"))}`,
    `LOCATION:${escapeIcs(venueLocation())}`,
    `URL:${escapeIcs(eventInfo.mapUrl || "")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${eventInfo.slug}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("googleButton").addEventListener("click", () => {
  window.open(googleCalendarUrl(), "_blank", "noopener");
});
$("appleButton").addEventListener("click", downloadIcs);

const revealElements = document.querySelectorAll(".reveal");

function revealInView() {
  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight + 40 && rect.bottom > -40) {
      element.classList.add("is-visible");
    }
  });
}

if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const scrollHint = $("scrollHint");

window.addEventListener("scroll", () => {
  scrollHint.classList.toggle("is-hidden", window.scrollY > 40);
}, { passive: true });

const intro = $("intro");
const introVideo = $("introVideo");
const soundButton = $("soundButton");
const site = $("site");
let opened = false;

function burstConfetti() {
  if (reduceMotion) return;
  const host = document.createElement("div");
  host.className = "confetti";
  const colors = ["#8a6345", "#b99b78", "#d9c4a5", "#fffdf8", "#5d402c", "#e8d8c0"];
  const count = window.innerWidth < 480 ? 34 : 58;

  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti__piece";
    piece.style.setProperty("--left", `${Math.random() * 100}%`);
    piece.style.setProperty("--width", `${4 + Math.random() * 7}px`);
    piece.style.setProperty("--height", `${8 + Math.random() * 10}px`);
    piece.style.setProperty("--radius", Math.random() > 0.5 ? "50%" : "2px");
    piece.style.setProperty("--color", colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty("--duration", `${3.2 + Math.random() * 2.4}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.6}s`);
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    piece.style.setProperty("--spin", `${Math.random() * 1000 - 500}deg`);
    host.appendChild(piece);
  }

  document.body.appendChild(host);
  window.setTimeout(() => host.remove(), 6500);
}

function finishIntro() {
  if (opened) return;
  opened = true;
  introVideo.pause();
  intro.classList.add("is-leaving");
  document.body.classList.add("is-open");
  burstConfetti();
  window.setTimeout(() => {
    intro.hidden = true;
    site.classList.add("is-visible");
    revealInView();
  }, 650);
}

$("skipButton").addEventListener("click", (event) => {
  event.stopPropagation();
  finishIntro();
});

introVideo.addEventListener("ended", finishIntro);
introVideo.addEventListener("error", finishIntro);
introVideo.play().catch(() => {});

soundButton.addEventListener("click", (event) => {
  event.stopPropagation();
  introVideo.muted = !introVideo.muted;
  soundButton.classList.toggle("is-unmuted", !introVideo.muted);
  const label = introVideo.muted ? t("soundOn") : t("soundOff");
  soundButton.setAttribute("aria-label", label);
  soundButton.setAttribute("title", label);
});

function buildParticles() {
  if (reduceMotion) return;
  const host = $("particles");
  const count = window.innerWidth < 768 ? 12 : 22;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 96}%`;
    particle.style.top = `${Math.random() * 92}%`;
    particle.style.width = `${2 + Math.random() * 4}px`;
    particle.style.height = particle.style.width;
    particle.style.setProperty("--x", `${Math.random() * 70 - 35}px`);
    particle.style.setProperty("--y", `${Math.random() * 70 - 35}px`);
    particle.style.setProperty("--duration", `${7 + Math.random() * 7}s`);
    particle.style.setProperty("--delay", `${-Math.random() * 12}s`);
    host.appendChild(particle);
  }
}

const ringSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="44" rx="20" ry="12" fill="none" stroke="#b99b78" stroke-width="5"/><path d="M14 40c2-6 9-10 18-10s16 4 18 10" fill="none" stroke="#e8d8c0" stroke-width="2" stroke-linecap="round" opacity=".9"/><path d="M26 33l3-7M38 33l-3-7" fill="none" stroke="#8a6345" stroke-width="2.4" stroke-linecap="round"/><path d="M32 4l9 10-9 12-9-12Z" fill="#faf5ec" stroke="#8a6345" stroke-width="1.6"/><path d="M32 4v22M23 14h18M27 9l10 10M37 9L27 19" fill="none" stroke="#b99b78" stroke-width="1"/><path d="M32 4l3 4-3 4-3-4Z" fill="#fffdf8" opacity=".9"/></svg>`;

const roseSvg = `<svg viewBox="0 0 56 64" xmlns="http://www.w3.org/2000/svg"><path d="M28 36v24" fill="none" stroke="#8a6345" stroke-width="1.8" stroke-linecap="round"/><path d="M28 44c-8-1-13-6-14-12 7 0 12 4 14 12Z" fill="#b99b78" stroke="#8a6345" stroke-width="1.2"/><path d="M28 50c8-1 13-6 14-12-7 0-12 4-14 12Z" fill="#d9c4a5" stroke="#8a6345" stroke-width="1.2"/><path d="M28 5c8 0 15 6 15 16s-7 17-15 17S13 31 13 21 20 5 28 5Z" fill="#d9c4a5" stroke="#8a6345" stroke-width="1.4"/><path d="M27 7C18 6 11 12 12 21c1 6 6 10 11 10-6-4-7-10-4-15 2-4 5-6 8-7Z" fill="#e8d8c0" stroke="#8a6345" stroke-width="1.1"/><path d="M29 7c9-1 16 5 15 14-1 6-6 10-11 10 6-4 7-10 4-15-2-4-5-6-8-7Z" fill="#c6a684" stroke="#8a6345" stroke-width="1.1"/><path d="M28 11c5 0 9 4 9 10s-4 10-9 10-9-4-9-10 4-10 9-10Z" fill="#faf5ec" stroke="#8a6345" stroke-width="1.2"/><path d="M28 14c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7Z" fill="#e8d8c0" stroke="#8a6345" stroke-width="1"/><path d="M32 16c2 2 3 5 2 8s-4 5-7 4c-3-1-4-4-3-6 1-3 4-4 6-3 2 1 2 3 1 4" fill="none" stroke="#8a6345" stroke-width="1.4" stroke-linecap="round"/></svg>`;

function addFallingItem(className, size, markup) {
  const item = document.createElement("div");
  item.className = className;
  item.style.setProperty("--left", `${Math.random() * 100}%`);
  item.style.setProperty("--size", `${size.toFixed(0)}px`);
  item.style.setProperty("--duration", `${12 + Math.random() * 12}s`);
  item.style.setProperty("--delay", `${-Math.random() * 24}s`);
  item.style.setProperty("--opacity", (0.3 + Math.random() * 0.35).toFixed(2));
  item.style.setProperty("--drift", `${Math.random() * 100 - 50}px`);
  item.style.setProperty("--spin", `${Math.random() * 280 - 140}deg`);
  if (markup) item.innerHTML = markup;
  $("falling").appendChild(item);
}

function buildFalling() {
  if (reduceMotion) return;
  const small = window.innerWidth < 480;
  for (let index = 0; index < (small ? 6 : 14); index += 1) {
    addFallingItem("falling__item falling__item--ring", 26 + Math.random() * 16, ringSvg);
  }
  for (let index = 0; index < (small ? 4 : 10); index += 1) {
    addFallingItem("falling__item falling__item--rose", 26 + Math.random() * 18, roseSvg);
  }
}

applyLanguage();
updateCountdown();
window.setInterval(updateCountdown, 1000);
buildParticles();
buildFalling();
