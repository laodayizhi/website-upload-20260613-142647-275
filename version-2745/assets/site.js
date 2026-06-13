(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-nav-links]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var backgrounds = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-bg]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.hidden = slideIndex !== current;
                });
                backgrounds.forEach(function (background, backgroundIndex) {
                    background.classList.toggle("is-active", backgroundIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            if (slides.length > 0) {
                showSlide(0);
                dots.forEach(function (dot, dotIndex) {
                    dot.addEventListener("click", function () {
                        showSlide(dotIndex);
                    });
                });
                window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        var searchInput = document.querySelector("[data-search-input]");
        var typeFilter = document.querySelector("[data-filter-type]");
        var yearFilter = document.querySelector("[data-filter-year]");
        var searchable = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function applyFilters() {
            var keyword = normalize(searchInput ? searchInput.value : "");
            var typeValue = normalize(typeFilter ? typeFilter.value : "");
            var yearValue = normalize(yearFilter ? yearFilter.value : "");
            var shown = 0;

            searchable.forEach(function (item) {
                var text = normalize(item.getAttribute("data-search-text"));
                var type = normalize(item.getAttribute("data-type"));
                var year = normalize(item.getAttribute("data-year"));
                var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
                var typeMatched = !typeValue || type === typeValue;
                var yearMatched = !yearValue || year === yearValue;
                var visible = keywordMatched && typeMatched && yearMatched;

                item.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", shown === 0);
            }
        }

        [searchInput, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
})();

function initializePlayer(videoSource) {
    var video = document.querySelector("[data-player]");
    var overlay = document.querySelector("[data-player-overlay]");
    var startButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
    var started = false;
    var hlsInstance = null;

    if (!video || !videoSource) {
        return;
    }

    function attachSource() {
        if (started) {
            return;
        }
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoSource;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoSource);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = videoSource;
    }

    function play() {
        attachSource();
        video.controls = true;
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    startButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            play();
        });
    });

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (!started) {
            play();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
