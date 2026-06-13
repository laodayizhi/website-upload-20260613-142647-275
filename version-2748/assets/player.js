var SitePlayer = {
  mount: function (videoId, layerId, source) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video || !source) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
      }
    }

    function hideLayer() {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    }

    function play() {
      attach();
      hideLayer();
      video.play().catch(function () {});
    }

    if (!video) {
      return;
    }

    if (layer) {
      layer.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", hideLayer);

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }
};
