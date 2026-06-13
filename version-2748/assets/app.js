(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
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
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupListingFilters() {
    selectAll("[data-filter-scope]").forEach(function (scope) {
      var keyword = scope.querySelector("[data-filter-keyword]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var grid = scope.nextElementSibling;
      if (!grid) {
        return;
      }
      var cards = selectAll("[data-movie-card]", grid);

      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-category"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var visible = true;
          if (q && haystack.indexOf(q) === -1) {
            visible = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            visible = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            visible = false;
          }
          card.classList.toggle("is-hidden-by-filter", !visible);
        });
      }

      [keyword, type, year].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
    });
  }

  function movieTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>#" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\" data-movie-card>" +
      "<a href=\"" + movie.url + "\" class=\"movie-card-link\">" +
      "<div class=\"poster-wrap\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"card-badge\">" + escapeHtml(movie.category) + "</span>" +
      "<span class=\"card-corner\">" + escapeHtml(movie.year) + "</span>" +
      "</div>" +
      "<div class=\"card-body\">" +
      "<h3>" + escapeHtml(movie.title) + "</h3>" +
      "<p>" + escapeHtml(movie.oneLine || movie.genre || "") + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "<div class=\"meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearch() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("site-search-input");
    if (!results || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var category = document.getElementById("site-search-category");
    var type = document.getElementById("site-search-type");
    var year = document.getElementById("site-search-year");
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      input.value = params.get("q");
    }

    function apply() {
      var q = input.value.trim().toLowerCase();
      var c = category ? category.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.category,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ").toLowerCase();
        if (q && haystack.indexOf(q) === -1) {
          return false;
        }
        if (c && movie.category !== c) {
          return false;
        }
        if (t && movie.type !== t) {
          return false;
        }
        if (y && movie.year !== y) {
          return false;
        }
        return true;
      }).slice(0, 96);
      results.innerHTML = matched.map(movieTemplate).join("");
    }

    [input, category, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      }
    });
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupListingFilters();
    setupSearch();
  });
}());
