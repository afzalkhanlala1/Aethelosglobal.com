/*
  AethelosGlobal.com: shared behaviour.
  1. The floor dial. The needle travels from the floor you last visited to
     this one, and on the lobby it follows the directory row you point at.
  2. The companies menu in the header.
  3. The contact form.
  Everything here is an enhancement: the pages work without it.
*/
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const LAST_FLOOR = "aethelos:last-floor";

  // sessionStorage can be missing or blocked (private windows, strict
  // settings). The dial still works; it just starts from the lobby.
  const readLastFloor = () => {
    try {
      const value = window.sessionStorage.getItem(LAST_FLOOR);
      return value === null ? null : Number(value);
    } catch {
      return null;
    }
  };

  const saveLastFloor = (floor) => {
    try {
      window.sessionStorage.setItem(LAST_FLOOR, String(floor));
    } catch {
      /* Storage unavailable: nothing to remember. */
    }
  };

  /* ---------- 1. The floor dial ---------- */

  const makeDial = (root) => {
    const needle = root.querySelector(".dial__needle");
    const numerals = Array.from(root.querySelectorAll("[data-n]"));
    const pageAccent = root.style.getPropertyValue("--lit");
    let current = Number(root.dataset.floor || 0);

    const moveTo = (floor, { animate = true, accent } = {}) => {
      const distance = Math.abs(floor - current);
      const duration = animate && !reduceMotion.matches ? 380 + 115 * distance : 0;
      needle.style.transitionDuration = `${duration}ms`;
      needle.style.setProperty("--angle", `${-80 + 20 * floor}deg`);
      numerals.forEach((n) => n.classList.toggle("is-lit", Number(n.dataset.n) === floor));
      const lit = accent || pageAccent;
      if (lit) root.style.setProperty("--lit", lit);
      else root.style.removeProperty("--lit");
      current = floor;
    };

    return { moveTo };
  };

  let lobbyDial = null;

  document.querySelectorAll("[data-dial]").forEach((root) => {
    const dial = makeDial(root);
    const here = Number(root.dataset.floor || 0);
    const last = readLastFloor();
    // First visit: arrive in the lobby from the top floor, or at a
    // company's floor from the lobby.
    const origin = last === null ? (here === 0 ? 8 : 0) : last;

    if (origin !== here && !reduceMotion.matches) {
      dial.moveTo(origin, { animate: false });
      // Wait two frames so the starting angle is painted before the sweep.
      requestAnimationFrame(() => requestAnimationFrame(() => dial.moveTo(here)));
    } else {
      dial.moveTo(here, { animate: false });
    }
    saveLastFloor(here);

    // Coming back with the browser's back button restores the page from
    // memory without running this script again.
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        dial.moveTo(here, { animate: false });
        saveLastFloor(here);
      }
    });

    if (here === 0 && root.hasAttribute("data-follow-directory")) lobbyDial = dial;
  });

  const directory = document.querySelector("[data-directory]");

  if (directory && lobbyDial) {
    let returnTimer;

    const point = (row) => {
      window.clearTimeout(returnTimer);
      lobbyDial.moveTo(Number(row.dataset.floor), { accent: row.dataset.accent });
    };

    const returnToLobby = () => {
      window.clearTimeout(returnTimer);
      returnTimer = window.setTimeout(() => lobbyDial.moveTo(0), 450);
    };

    directory.querySelectorAll("a[data-floor]").forEach((row) => {
      row.addEventListener("pointerenter", () => point(row));
      row.addEventListener("focus", () => point(row));
    });

    directory.addEventListener("pointerleave", returnToLobby);
    directory.addEventListener("focusout", (event) => {
      if (!directory.contains(event.relatedTarget)) returnToLobby();
    });
  }

  /* ---------- 2. The companies menu ---------- */

  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById("floors-menu");
  const fallback = document.querySelector("[data-menu-fallback]");

  if (toggle && menu) {
    toggle.hidden = false;
    if (fallback) fallback.hidden = true;

    const setOpen = (open) => {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => {
      const opening = menu.hidden;
      setOpen(opening);
      if (opening) {
        const here = menu.querySelector('[aria-current="page"]') || menu.querySelector("a");
        if (here) here.focus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    menu.addEventListener("focusout", (event) => {
      if (event.relatedTarget && !menu.contains(event.relatedTarget) && event.relatedTarget !== toggle) setOpen(false);
    });
  }

  /* ---------- 3. The contact form ---------- */

  const form = document.querySelector("[data-contact-form]");

  if (form) {
    const params = new URLSearchParams(window.location.search);
    const status = form.querySelector("[data-status]");
    const submit = form.querySelector('button[type="submit"]');
    const company = form.elements.namedItem("company");
    const message = form.elements.namedItem("message");
    const fallbackEmail = form.dataset.email;

    const say = (text, state) => {
      status.textContent = text;
      if (state) status.dataset.state = state;
      else delete status.dataset.state;
    };

    const requested = params.get("company");
    if (requested && Array.from(company.options).some((o) => o.value === requested)) {
      company.value = requested;
    }

    const prompts = {
      demo: "What would you like to see in the demo, and what would you use it for?",
      "early-access": "Tell us a little about yourself and what you'd use it for.",
    };
    const topic = params.get("topic");
    if (prompts[topic]) message.placeholder = prompts[topic];

    // Without JavaScript the form posts normally and comes back here.
    if (params.get("sent") === "1") say("Message sent. We'll reply by email.", "ok");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = Object.fromEntries(new FormData(form));
      if (data._honey) return;
      delete data._next;

      const companyName = company.options[company.selectedIndex].text;
      data._subject = `AethelosGlobal.com: ${companyName}`;

      submit.disabled = true;
      say("Sending…");

      try {
        const response = await fetch(form.dataset.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || String(result.success) !== "true") {
          throw new Error(result.message || `HTTP ${response.status}`);
        }
        form.reset();
        say(`Message sent. We'll reply to ${data.email}.`, "ok");
      } catch {
        say(`Your message didn't send. Try again, or email ${fallbackEmail}.`, "error");
      } finally {
        submit.disabled = false;
      }
    });
  }
})();
