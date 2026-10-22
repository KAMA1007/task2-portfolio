/* ========== 0. SETTINGS (edit these two lines) ========== */
const CONFIG = {
  // 1) Get a free access key at https://web3forms.com (enter your email, the key is emailed to you) and paste it here.
  //    The key is public by design, it is NOT a secret password.
  web3formsKey: "e0a2fa9c-c1ac-43cb-b646-7b041238c854",
  // 2) Your WhatsApp number with country code, no "+" or spaces, e.g. "94771234567". Leave "" to hide the button.
  whatsappNumber: "94779856295",
  // 3) Social links (leave "" to hide an icon). Example: "https://github.com/yourname"
  github: "https://github.com/KAMA1007",
  linkedin: "https://www.linkedin.com/in/nipun-dilshan-02360436b",   // e.g. "https://www.linkedin.com/in/yourname"
  email: "nipundilshan690@gmail.com",      // e.g. "yourname@gmail.com"
};

/* ========== 1. ELEMENTS ========== */
const navbar = document.getElementById("navbar");
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const backToTop = document.getElementById("back-to-top");
const themeBtn = document.getElementById("theme-btn");

/* ========== 2. MOBILE MENU ========== */
function setMenu(open) {
  navLinks.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ========== 3. LIGHT / DARK THEME ========== */
function applyTheme(theme) {
  const light = theme === "light";
  if (light) document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
  themeBtn.innerHTML = `<i aria-hidden="true" class="fi fi-rr-${light ? "moon-stars" : "sun"}"></i>`;
  themeBtn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  document.dispatchEvent(new Event("themechange")); // lets the particles change color
}
// The saved theme was already applied in <head>; here we only sync the button icon.
applyTheme(document.documentElement.hasAttribute("data-theme") ? "light" : "dark");

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.hasAttribute("data-theme") ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

/* ========== 4. SCROLL EFFECTS ========== */
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
  backToTop.classList.toggle("show", window.scrollY > 400);
}, { passive: true });
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ========== 5. SCROLL REVEAL ========== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ========== 6. HIGHLIGHT THE CURRENT SECTION IN THE NAVBAR ========== */
const links = [...navLinks.querySelectorAll("a")];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

/* ========== 7. FOOTER YEAR ========== */
document.getElementById("year").textContent = new Date().getFullYear();

/* ========== 8. PARTICLE BACKGROUND ========== */
(function particles() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let dots = [];
  const readColor = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--particle-rgb").trim() || "0, 212, 255";
  let rgb = readColor();
  document.addEventListener("themechange", () => { rgb = readColor(); });

  function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(80, Math.floor(window.innerWidth / 18));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach((d) => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
      if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, 0.5)`;
      ctx.fill();
    });
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(${rgb}, ${0.2 * (1 - dist / 120)})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  setup();
  frame();
  window.addEventListener("resize", setup);
})();

/* ========== 9. CONTACT FORM (validation + Web3Forms) ========== */
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

function setError(id, message) {
  const field = document.getElementById(id);
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", Boolean(message));
  document.getElementById(id + "-error").textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  setError("name", name.length < 2 ? "Please enter your name." : "");
  setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email.");
  setError("message", message.length < 10 ? "Please write at least 10 characters." : "");
  if (form.querySelector(".invalid")) return;

  if (!CONFIG.web3formsKey || CONFIG.web3formsKey.includes("YOUR_ACCESS_KEY")) {
    statusEl.textContent = "The form is not connected yet. Add your Web3Forms access key in script.js.";
    statusEl.classList.add("fail");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: CONFIG.web3formsKey,
        subject: "New message from your portfolio",
        from_name: "Portfolio contact form",
        name, email, message,
        botcheck: document.getElementById("botcheck").checked, // spam trap: real visitors never see it
      }),
    });
    const data = await response.json();
    if (!response.ok || data.success === false) throw new Error(data.message || "Request failed");
    statusEl.textContent = `Thanks, ${name}! Your message was sent.`;
    statusEl.classList.add("ok");
    form.reset();
  } catch (error) {
    statusEl.textContent = "Something went wrong. Please try again or use WhatsApp.";
    statusEl.classList.add("fail");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});

/* ========== 10. WHATSAPP BUTTONS + SOCIAL LINKS (only shown when set in CONFIG) ========== */
if (CONFIG.whatsappNumber) {
  const text = encodeURIComponent("Hi Nipun, I saw your portfolio and would like to talk.");
  document.querySelectorAll("[data-whatsapp]").forEach((a) => {
    a.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
    a.hidden = false;
  });
}
document.querySelectorAll("[data-social]").forEach((a) => {
  const key = a.dataset.social;
  const value = CONFIG[key];
  if (!value) return;
  a.href = key === "email" ? `mailto:${value}` : value;
  a.hidden = false;
});
// Show a social row only if at least one icon inside it is visible
document.querySelectorAll(".socials").forEach((row) => { row.hidden = !row.querySelector("a:not([hidden])"); });

/* ========== 11. PROFILE PHOTO FALLBACK ========== */
document.querySelectorAll(".avatar img").forEach((img) => {
  const markMissing = () => img.parentElement.classList.add("no-photo");
  img.addEventListener("error", markMissing);
  if (img.complete && img.naturalWidth === 0) markMissing();
});

/* ========== 12. TYPING ANIMATION IN THE HERO ========== */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
(function typing() {
  const el = document.getElementById("typed");
  const words = ["Hardware & Networking", "Python Development", "Web Development", "UCSC IT Undergraduate", "Founder, KAMA IT Solutions"];
  if (!el || reduceMotion) return; // keep the static first word
  let word = 0, chars = words[0].length, deleting = true;
  function tick() {
    el.textContent = words[word].slice(0, chars);
    if (deleting) {
      if (chars > 0) { chars--; return setTimeout(tick, 35); }
      deleting = false; word = (word + 1) % words.length;
      return setTimeout(tick, 300);
    }
    if (chars < words[word].length) { chars++; return setTimeout(tick, 75); }
    deleting = true;
    setTimeout(tick, 1600);
  }
  setTimeout(tick, 1600);
})();

/* ========== 13. STATS COUNTERS (numbers are counted from the page itself) ========== */
function runCounter(el) {
  const target = Number(el.dataset.target) || 0;
  if (reduceMotion) { el.textContent = target; return; }
  const start = performance.now();
  (function step(now) {
    const progress = Math.min((now - start) / 1200, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  })(start);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { runCounter(entry.target); counterObserver.unobserve(entry.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll(".count").forEach((el) => {
  if (el.dataset.countOf) el.dataset.target = document.querySelectorAll(el.dataset.countOf).length;
  counterObserver.observe(el);
});
