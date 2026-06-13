(function () {
  var currentScript = document.currentScript;
  var hlsUrl = new URL("hls-vendor-dru42stk.js", currentScript ? currentScript.src : window.location.href).href;
  var hlsPromise = null;

  function getHlsModule() {
    if (!hlsPromise) {
      hlsPromise = import(hlsUrl);
    }
    return hlsPromise;
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 6000);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var typeFilter = scope.querySelector("[data-type-filter]");
      var regionFilter = scope.querySelector("[data-region-filter]");
      var yearFilter = scope.querySelector("[data-year-filter]");
      var container = document.querySelector("[data-filter-list]");
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll(".search-card"));

      function apply() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(typeFilter && typeFilter.value);
        var regionValue = normalize(regionFilter && regionFilter.value);
        var yearValue = normalize(yearFilter && yearFilter.value);
        cards.forEach(function (card) {
          var searchable = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesKeyword = !keyword || searchable.indexOf(keyword) !== -1;
          var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
          var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          card.classList.toggle("is-hidden-card", !(matchesKeyword && matchesType && matchesRegion && matchesYear));
        });
      }

      [input, typeFilter, regionFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupPlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
      return;
    }
    var prepared = false;
    var loading = false;

    function attach() {
      if (prepared) {
        return Promise.resolve();
      }
      if (loading) {
        return new Promise(function (resolve) {
          var timer = window.setInterval(function () {
            if (prepared) {
              window.clearInterval(timer);
              resolve();
            }
          }, 50);
        });
      }
      loading = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        prepared = true;
        return Promise.resolve();
      }
      return getHlsModule().then(function (module) {
        var Hls = module.H;
        if (Hls && Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          video.hlsController = hls;
          prepared = true;
          return;
        }
        video.src = source;
        prepared = true;
      });
    }

    function play() {
      attach().then(function () {
        overlay.classList.add("is-hidden");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }).catch(function () {
        overlay.classList.add("is-hidden");
      });
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  }

  function setupQueuedPlayers() {
    var queue = window.playerQueue || [];
    queue.forEach(function (item) {
      setupPlayer(item[0], item[1], item[2]);
    });
  }

  window.setupMoviePlayer = setupPlayer;

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupQueuedPlayers();
  });
})();
