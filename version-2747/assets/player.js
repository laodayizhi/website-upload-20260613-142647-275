(function () {
    var video = document.getElementById('mainPlayer');
    var overlay = document.getElementById('playOverlay');
    var message = document.getElementById('playerMessage');

    if (!video || !overlay) {
        return;
    }

    var streamUrl = video.getAttribute('data-stream');
    var prepared = false;
    var hls = null;

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.hidden = false;
        }
    }

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;
        video.controls = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showMessage('视频暂时无法播放，请稍后再试。');
                    if (hls) {
                        hls.destroy();
                        hls = null;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else {
            showMessage('视频暂时无法播放，请稍后再试。');
        }
    }

    function play() {
        prepare();
        overlay.hidden = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                window.setTimeout(function () {
                    video.play().catch(function () {});
                }, 420);
            });
        }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        overlay.hidden = true;
    });
})();
