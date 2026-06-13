(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    document.querySelectorAll('[data-card-filter]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var region = scope.querySelector('[data-region-filter]');
        var type = scope.querySelector('[data-type-filter]');
        var year = scope.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (regionValue && card.getAttribute('data-region') !== regionValue) {
                    matched = false;
                }
                if (typeValue && card.getAttribute('data-type') !== typeValue) {
                    matched = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    matched = false;
                }

                card.classList.toggle('hidden-by-filter', !matched);
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var queryParam = params.get('q');
            if (queryParam) {
                input.value = queryParam;
            }
            input.addEventListener('input', applyFilter);
        }
        [region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    });
})();
