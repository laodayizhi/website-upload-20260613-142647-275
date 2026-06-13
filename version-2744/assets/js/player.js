(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function show(element, visible) {
    if (element) {
      element.classList.toggle("is-visible", Boolean(visible));
    }
  }

  function initPlayer(shell) {
    var video = shell.querySelector("video");
    var startButton = shell.querySelector("[data-player-start]");
    var toggleButton = shell.querySelector("[data-player-toggle]");
    var muteButton = shell.querySelector("[data-player-mute]");
    var fullscreenButton = shell.querySelector("[data-player-fullscreen]");
    var loading = shell.querySelector("[data-player-loading]");
    var error = shell.querySelector("[data-player-error]");
    var source = shell.getAttribute("data-video-src");
    var poster = shell.getAttribute("data-poster");
    var hlsInstance = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    if (poster && !video.getAttribute("poster")) {
      video.setAttribute("poster", poster);
    }

    function setError(message) {
      if (error) {
        error.textContent = message;
      }
      show(error, Boolean(message));
      show(loading, false);
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      show(loading, true);
      setError("");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          show(loading, false);
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setError("网络错误，正在尝试重新加载播放源");
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setError("媒体错误，正在尝试恢复播放");
            hlsInstance.recoverMediaError();
          } else {
            setError("当前浏览器无法播放该视频源");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          show(loading, false);
        });
      } else {
        setError("当前浏览器不支持 HLS 播放");
      }
    }

    function playVideo() {
      attachSource();
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(function () {
          shell.classList.add("is-playing");
          if (startButton) {
            startButton.classList.add("is-hidden");
          }
          setError("");
        }).catch(function () {
          setError("请再次点击播放按钮开始播放");
        });
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
        shell.classList.remove("is-playing");
      }
    }

    if (startButton) {
      startButton.addEventListener("click", playVideo);
    }
    if (toggleButton) {
      toggleButton.addEventListener("click", toggleVideo);
    }
    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    video.addEventListener("click", toggleVideo);
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
    });
    video.addEventListener("canplay", function () {
      show(loading, false);
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(initPlayer);
  });
})();
