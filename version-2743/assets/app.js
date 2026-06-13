(function () {
    const navButton = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-hidden');
        });
    });

    function setupHero() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    function setupFilters() {
        const roots = Array.from(document.querySelectorAll('[data-filter-root]'));
        roots.forEach(function (root) {
            const input = root.querySelector('[data-search-box]');
            const selects = Array.from(root.querySelectorAll('[data-filter-field]'));
            const cards = Array.from(root.querySelectorAll('[data-card]'));
            const status = root.querySelector('[data-result-count]');
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q');

            if (query && input) {
                input.value = query;
            }

            function apply() {
                const text = input ? input.value.trim().toLowerCase() : '';
                let visible = 0;

                cards.forEach(function (card) {
                    const cardText = (card.dataset.search || '').toLowerCase();
                    let matched = !text || cardText.indexOf(text) !== -1;

                    selects.forEach(function (select) {
                        if (!matched) {
                            return;
                        }
                        const value = select.value;
                        if (!value || value === 'all') {
                            return;
                        }
                        const field = select.dataset.filterField;
                        matched = (card.dataset[field] || '') === value;
                    });

                    card.classList.toggle('hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (status) {
                    status.textContent = '匹配 ' + visible + ' 部作品';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    function setupHeroSearch() {
        const form = document.querySelector('[data-hero-search]');
        if (!form) {
            return;
        }
        const input = form.querySelector('input');
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const value = input ? input.value.trim() : '';
            const suffix = value ? '?q=' + encodeURIComponent(value) : '';
            window.location.href = './search.html' + suffix;
        });
    }

    function setupPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            const video = player.querySelector('video');
            const buttons = Array.from(player.querySelectorAll('[data-play]'));
            let ready = false;
            let hls = null;

            if (!video) {
                return;
            }

            function bind() {
                if (ready) {
                    return;
                }

                const stream = video.getAttribute('data-stream');
                if (!stream) {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }

                ready = true;
            }

            function play() {
                bind();
                player.classList.add('is-started');
                video.setAttribute('controls', 'controls');
                const started = video.play();
                if (started && typeof started.catch === 'function') {
                    started.catch(function () {
                        player.classList.remove('is-started');
                    });
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    play();
                });
            });

            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                player.classList.add('is-started');
            });

            video.addEventListener('error', function () {
                player.classList.remove('is-started');
            });

            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    setupHero();
    setupFilters();
    setupHeroSearch();
    setupPlayers();
})();
