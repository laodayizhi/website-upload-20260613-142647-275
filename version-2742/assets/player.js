(function () {
  function showMessage(wrapper, text) {
    let box = wrapper.querySelector(".player-message");
    if (!box) {
      box = document.createElement("div");
      box.className = "player-message";
      wrapper.appendChild(box);
    }
    box.textContent = text;
    window.setTimeout(function () {
      if (box.parentNode) {
        box.parentNode.removeChild(box);
      }
    }, 3000);
  }

  window.initializeMoviePlayer = function (videoId, source, layerId) {
    const video = document.getElementById(videoId);
    const layer = document.getElementById(layerId);
    if (!video || !source) {
      return;
    }
    const wrapper = video.closest(".player-wrap") || video.parentElement;
    let hls = null;
    let loaded = false;

    function attach() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && wrapper) {
            showMessage(wrapper, "播放暂时不可用，请稍后重试");
          }
        });
        return Promise.resolve();
      }
      if (wrapper) {
        showMessage(wrapper, "播放暂时不可用，请稍后重试");
      }
      return Promise.reject(new Error("unsupported"));
    }

    function start() {
      attach().then(function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (wrapper) {
              showMessage(wrapper, "点击视频区域继续播放");
            }
          });
        }
      }).catch(function () {});
    }

    if (layer) {
      layer.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
