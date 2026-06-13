(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("hidden");
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initSiteSearch() {
    const movies = window.siteMovieIndex || [];
    const inputs = Array.from(document.querySelectorAll("[data-site-search]"));
    inputs.forEach(function (input) {
      const wrapper = input.parentElement;
      const panel = wrapper ? wrapper.querySelector("[data-search-panel]") : null;
      if (!panel) {
        return;
      }

      function render() {
        const keyword = normalize(input.value);
        if (!keyword) {
          panel.classList.add("hidden");
          panel.innerHTML = "";
          return;
        }
        const matches = movies.filter(function (movie) {
          return normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(" ")).includes(keyword);
        }).slice(0, 12);
        if (!matches.length) {
          panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
          panel.classList.remove("hidden");
          return;
        }
        panel.innerHTML = matches.map(function (movie) {
          return '<a class="search-item" href="' + movie.url + '">' +
            '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '">' +
            '<span class="min-w-0"><strong class="block text-sm text-archive-900 line-clamp-1">' + movie.title + '</strong>' +
            '<span class="block text-xs text-archive-500 mt-1 line-clamp-1">' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</span></span>' +
            '</a>';
        }).join("");
        panel.classList.remove("hidden");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      document.addEventListener("click", function (event) {
        if (!wrapper.contains(event.target)) {
          panel.classList.add("hidden");
        }
      });
    });
  }

  function initLocalFilter() {
    const inputs = Array.from(document.querySelectorAll("[data-local-filter]"));
    inputs.forEach(function (input) {
      const grid = document.querySelector(input.dataset.localFilter);
      if (!grid) {
        return;
      }
      const cards = Array.from(grid.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        const keyword = normalize(input.value);
        cards.forEach(function (card) {
          const text = normalize([card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre, card.dataset.tags].join(" "));
          card.classList.toggle("is-hidden", keyword && !text.includes(keyword));
        });
      });
    });
  }

  function initBackTop() {
    const button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function sync() {
      const visible = window.scrollY > 300;
      button.classList.toggle("invisible", !visible);
      button.classList.toggle("opacity-0", !visible);
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initSiteSearch();
    initLocalFilter();
    initBackTop();
  });
})();
