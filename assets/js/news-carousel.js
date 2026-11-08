
document.addEventListener("DOMContentLoaded", async () => {
  const carousel = document.querySelector(".news-carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".news-track");
  const previous = carousel.querySelector(".news-prev");
  const next = carousel.querySelector(".news-next");
  const counter = carousel.querySelector(".news-counter");

  const MAX_ITEMS = 12;
  const INTERVAL = 7000;

  let cards = [];
  let currentIndex = 0;
  let timer = null;
  let hovered = false;
  let focused = false;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // The carousel appears on index.qmd at the site root.
  // Resolve internal links and image paths from that location.
  const siteRoot = new URL("./", document.baseURI);

  function makeURL(value) {
    if (!value || typeof value !== "string") return null;

    const path = value.trim();
    if (!path) return null;

    if (/^https?:\/\//i.test(path)) return path;

    // Allow relative website paths, but not other URL schemes.
    if (
      path.startsWith("/") ||
      path.startsWith("\\") ||
      path.includes("..") ||
      /^[a-z][a-z0-9+.-]*:/i.test(path)
    ) {
      return null;
    }

    const htmlPath = path.replace(/\.qmd(?=[?#]|$)/, ".html");
    return new URL(htmlPath, siteRoot).href;
  }

  function displayDate(item) {
    const date = new Date(item.date + "T12:00:00Z");

    const options = {
      year: "numeric",
      timeZone: "UTC"
    };

    if (
      item.date_precision === "month" ||
      item.date_precision === "approximate"
    ) {
      options.month = "short";
    } else {
      options.month = "short";
      options.day = "numeric";
    }

    return new Intl.DateTimeFormat("en-GB", options).format(date);
  }

  function makeCard(item) {
    const card = document.createElement("article");
    card.className = "news-card";

    const imageURL = makeURL(item.image);

    if (imageURL) {
      const image = document.createElement("img");
      image.className = item.image_type === "logo"
      ? "news-card-image news-card-logo"
      : "news-card-image";
      image.src = imageURL;
      image.alt = item.image_alt || "";
      image.loading = "lazy";

      // If an image file is missing, use the text-only layout.
      image.addEventListener("error", () => {
        image.remove();
        card.classList.add("news-card-text-only");
      });

      card.appendChild(image);
    } else {
      card.classList.add("news-card-text-only");
    }

    const content = document.createElement("div");
    content.className = "news-card-content";

    const meta = document.createElement("div");
    meta.className = "news-card-meta";

    const date = document.createElement("time");
    date.dateTime = item.date;
    date.textContent = displayDate(item);

    const category = document.createElement("span");
    category.className = "news-card-category";
    category.textContent = item.category || "News";

    meta.append(date, category);

    const title = document.createElement("h3");
    title.className = "news-card-title";
    title.textContent = item.title;

    const description = document.createElement("p");
    description.className = "news-card-description";
    description.textContent = item.description || "";

    content.append(meta, title, description);

if (item.description_ja) {
  const japanese = document.createElement("p");
  japanese.className = "news-card-japanese";
  japanese.lang = "ja";
  japanese.textContent = item.description_ja;
  content.appendChild(japanese);
}

    const linkURL = makeURL(item.link);

    if (linkURL) {
      const link = document.createElement("a");
      link.className = "news-card-link";
      link.href = linkURL;
      link.textContent = (item.link_text || "Read more") + " →";

      if (/^https?:\/\//i.test(item.link)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }

      content.appendChild(link);
    }

    card.appendChild(content);
    return card;
  }

  function visibleCards() {
    if (!cards.length) return 1;

    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;

    return Math.max(
      1,
      Math.floor((track.clientWidth + gap + 1) / (cardWidth + gap))
    );
  }

  function maxStartIndex() {
    return Math.max(0, cards.length - visibleCards());
  }

  function updateCounter() {
    if (!cards.length) {
      counter.textContent = "";
      return;
    }

    counter.textContent =
      `${Math.min(currentIndex + 1, cards.length)} / ${cards.length}`;
  }

  function goTo(index, animate = true) {
    if (!cards.length) return;

    const max = maxStartIndex();

    if (index > max) {
      currentIndex = 0;
    } else if (index < 0) {
      currentIndex = max;
    } else {
      currentIndex = index;
    }

    const target = cards[currentIndex].offsetLeft -
                   cards[0].offsetLeft;

    track.scrollTo({
      left: target,
      behavior: animate && !reducedMotion.matches
        ? "smooth"
        : "instant"
    });

    updateCounter();
  }

  function stopAutoplay() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();

    if (
      hovered ||
      focused ||
      document.hidden ||
      reducedMotion.matches ||
      cards.length <= visibleCards()
    ) {
      return;
    }

    timer = setInterval(() => {
      goTo(currentIndex + 1);
    }, INTERVAL);
  }

  function navigate(direction) {
    goTo(currentIndex + direction);
    startAutoplay();
  }

  previous.addEventListener("click", () => navigate(-1));
  next.addEventListener("click", () => navigate(1));

  carousel.addEventListener("mouseenter", () => {
    hovered = true;
    stopAutoplay();
  });

  carousel.addEventListener("mouseleave", () => {
    hovered = false;
    startAutoplay();
  });

  carousel.addEventListener("focusin", () => {
    focused = true;
    stopAutoplay();
  });

  carousel.addEventListener("focusout", event => {
    if (!carousel.contains(event.relatedTarget)) {
      focused = false;
      startAutoplay();
    }
  });

  track.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    }
  });

  // Keep the counter accurate after touch or trackpad scrolling.
  let scrollFrame = null;

  track.addEventListener("scroll", () => {
    if (scrollFrame !== null) {
      cancelAnimationFrame(scrollFrame);
    }

    scrollFrame = requestAnimationFrame(() => {
      if (!cards.length) return;

      const first = cards[0].offsetLeft;
      const position = track.scrollLeft + first;

      let nearest = 0;
      let distance = Infinity;

      cards.forEach((card, index) => {
        const difference = Math.abs(card.offsetLeft - position);

        if (difference < distance) {
          nearest = index;
          distance = difference;
        }
      });

      currentIndex = Math.min(nearest, maxStartIndex());
      updateCounter();
    });
  }, { passive: true });

  window.addEventListener("resize", () => {
    goTo(Math.min(currentIndex, maxStartIndex()), false);
    startAutoplay();
  });

  document.addEventListener("visibilitychange", startAutoplay);

  reducedMotion.addEventListener("change", startAutoplay);

  // Load and sort the news.
  try {
    const response = await fetch(new URL("data/news.json", siteRoot));

    if (!response.ok) {
      throw new Error(`News file: HTTP ${response.status}`);
    }

    const news = await response.json();

    if (!Array.isArray(news)) {
      throw new Error("news.json must contain an array.");
    }

    const latest = news
      .filter(item =>
        item.title &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date || "") &&
        !Number.isNaN(Date.parse(item.date))
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, MAX_ITEMS);

    cards = latest.map(makeCard);

    if (cards.length === 0) {
      track.textContent = "No news available yet.";
      return;
    }

    track.replaceChildren(...cards);
    updateCounter();
    startAutoplay();

  } catch (error) {
    console.error("News carousel error:", error);
    track.textContent = "News is temporarily unavailable.";
  }
});
