(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });

    function setupMenu() {
        var button = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                reset();
            });
        });
        start();
    }

    function setupSearch() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var result = scope.querySelector("[data-result-text]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
            if (!input || cards.length === 0) {
                return;
            }
            function apply() {
                var q = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search-text") || "";
                    var ok = q === "" || text.indexOf(q) !== -1;
                    card.classList.toggle("hidden-card", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (result) {
                    result.textContent = q ? "匹配结果：" + visible : "";
                }
            }
            input.addEventListener("input", apply);
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-player-start]");
            var message = box.querySelector("[data-player-message]");
            if (!video || !button) {
                return;
            }
            var started = false;
            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }
            function attach() {
                var url = video.getAttribute("data-stream");
                if (!url) {
                    setMessage("播放暂时不可用");
                    return false;
                }
                if (started) {
                    return true;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                } else {
                    video.src = url;
                }
                return true;
            }
            function play() {
                if (!attach()) {
                    return;
                }
                box.classList.add("playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        box.classList.remove("playing");
                        setMessage("点击播放按钮继续观看");
                    });
                }
            }
            button.addEventListener("click", play);
            box.addEventListener("click", function (event) {
                if (event.target === video && !started) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                box.classList.add("playing");
                setMessage("");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    box.classList.remove("playing");
                }
            });
            video.addEventListener("error", function () {
                box.classList.remove("playing");
                setMessage("播放暂时不可用");
            });
        });
    }
})();
