const partyDate = new Date(2026, 11, 19, 19, 0, 0);
const inviteContent = document.querySelector("#invitation-content");
const musicDialog = document.querySelector("#music-dialog");
const musicToggle = document.querySelector("#music-toggle");
let audioContext;
let musicTimer;
let musicStep = 0;

function updateCountdown() {
  const remaining = Math.max(0, partyDate.getTime() - Date.now());
  const seconds = Math.floor(remaining / 1000);
  const values = {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60
  };

  for (const [unit, value] of Object.entries(values)) {
    document.querySelector(`#${unit}`).textContent = String(value).padStart(2, "0");
  }
}

function playNote() {
  if (!audioContext || audioContext.state !== "running") return;
  const notes = [392, 523.25, 659.25, 783.99, 659.25, 523.25, 440, 587.33, 698.46, 880, 698.46, 587.33];
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.value = notes[musicStep % notes.length];
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.27);
  musicStep += 1;
}

async function setMusicEnabled(enabled) {
  if (enabled) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      musicToggle.setAttribute("aria-label", "La música no está disponible en este navegador");
      musicToggle.setAttribute("aria-pressed", "false");
      return;
    }

    audioContext ??= new AudioContextConstructor();
    await audioContext.resume();
    clearInterval(musicTimer);
    playNote();
    musicTimer = window.setInterval(playNote, 420);
  } else {
    clearInterval(musicTimer);
    if (audioContext?.state === "running") await audioContext.suspend();
  }

  musicToggle.setAttribute("aria-pressed", String(enabled));
  musicToggle.setAttribute("aria-label", enabled ? "Pausar música" : "Activar música");
}

function enterInvitation(withMusic) {
  musicDialog.hidden = true;
  inviteContent.hidden = false;
  document.querySelector("#cover").hidden = true;
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  if (withMusic) setMusicEnabled(true);
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.querySelector("#open-invitation").addEventListener("click", () => {
  musicDialog.hidden = false;
  document.querySelector("#music-yes").focus();
});

document.querySelector("#music-yes").addEventListener("click", () => enterInvitation(true));
document.querySelector("#music-no").addEventListener("click", () => enterInvitation(false));

musicToggle.addEventListener("click", async () => {
  const enabled = musicToggle.getAttribute("aria-pressed") !== "true";
  await setMusicEnabled(enabled);
});

document.querySelector("#calendar-link").addEventListener("click", (event) => {
  event.preventDefault();
  const calendarEvent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitacion XV Melisa//ES",
    "BEGIN:VEVENT",
    "UID:xv-melisa-20261219@example.local",
    "DTSTAMP:20261105T000000Z",
    "DTSTART:20261219T190000",
    "DTEND:20261220T010000",
    "SUMMARY:XV Años de Melisa",
    "LOCATION:Salón de Eventos (nombre del lugar)\\, Calle y número\\, Colonia\\, Ciudad",
    "DESCRIPTION:¡Acompáñanos a celebrar los XV años de Melisa!",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const file = new Blob([calendarEvent], { type: "text/calendar;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(file);
  const download = document.createElement("a");
  download.href = downloadUrl;
  download.download = "xv-melisa.ics";
  download.click();
  URL.revokeObjectURL(downloadUrl);
});

updateCountdown();

// Confirmación por WhatsApp (cambiar el número: código de país + número, sin + ni espacios)
const WHATSAPP_NUMBER = "520000000000";
let rsvpReply = "si";
document.querySelectorAll("#rsvp-form button").forEach((button) =>
  button.addEventListener("click", () => { rsvpReply = button.dataset.reply; })
);
document.querySelector("#rsvp-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  const text = rsvpReply === "si"
    ? `¡Hola Melisa! Soy ${form.get("nombre")} y confirmo mi asistencia a tus XV años (${form.get("lugares")} lugar/es). 🎉`
    : `¡Hola Melisa! Soy ${form.get("nombre")}. Lamentablemente no podré asistir a tus XV años. ¡Gracias por la invitación!`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});
