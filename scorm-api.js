// SCORM API — powered by scorm-again
// https://github.com/jcputney/scorm-again

var scormAgainScript = document.createElement("script");
scormAgainScript.src = "https://cdn.jsdelivr.net/npm/scorm-again@latest/dist/scorm-again.js";
scormAgainScript.onload = function () {
  initSCORM();
  window.dispatchEvent(new Event("scorm-ready"));
};
document.head.appendChild(scormAgainScript);

function initSCORM() {

  var settings = {
    autocommit: true,
    autocommitSeconds: 10,
    onLogMessage: function (level, msg) {
      console.log("[SCORM]", level, msg);
    },
  };

  var scorm12   = new Scorm12API(settings);
  var scorm2004 = new Scorm2004API(settings);

  scorm12.on("LMSSetValue.cmi.core.score.raw",       function (v) { updateUI("score",    v); });
  scorm12.on("LMSSetValue.cmi.core.lesson_status",   function (v) { updateUI("status",   v); });
  scorm12.on("LMSSetValue.cmi.core.lesson_location", function (v) { updateUI("location", v); });

  scorm2004.on("SetValue.cmi.score.raw",             function (v) { updateUI("score",    v); });
  scorm2004.on("SetValue.cmi.completion_status",     function (v) { updateUI("status",   v); });
  scorm2004.on("SetValue.cmi.success_status",        function (v) { updateUI("status",   v); });
  scorm2004.on("SetValue.cmi.location",              function (v) { updateUI("location", v); });

  window.API         = scorm12;
  window.API_1484_11 = scorm2004;

  var frame = document.getElementById("scorm-frame");
  if (frame) {
    // inject now if iframe already loaded
    try {
      if (frame.contentWindow && frame.contentDocument) {
        frame.contentWindow.API         = window.API;
        frame.contentWindow.API_1484_11 = window.API_1484_11;
      }
    } catch (e) {}

    // inject again on every load
    frame.addEventListener("load", function () {
      try {
        frame.contentWindow.API         = window.API;
        frame.contentWindow.API_1484_11 = window.API_1484_11;
      } catch (e) {}
    });
  }
}

function updateUI(key, value) {
  var scoreEl  = document.getElementById("score");
  var statusEl = document.getElementById("status");
  var badge    = document.getElementById("status-badge");

  if (key === "score" && scoreEl) {
    scoreEl.innerText = value || "–";
  }

  if (key === "status" && statusEl) {
    statusEl.innerText = value || "–";
    if (badge) {
      badge.className = "badge";
      if (value === "passed" || value === "completed") badge.classList.add("completed");
      if (value === "failed")                          badge.classList.add("failed");
    }
  }
}

window.getSCORMReport = function () {
  var api12   = window.API;
  var api2004 = window.API_1484_11;
  if (!api12 && !api2004) return {};

  // Try SCORM 1.2 first, fallback to SCORM 2004
  var score     = (api12   && api12.LMSGetValue("cmi.core.score.raw"))       ||
                  (api2004 && api2004.GetValue("cmi.score.raw"))              || "–";

  var status    = (api12   && api12.LMSGetValue("cmi.core.lesson_status"))   ||
                  (api2004 && api2004.GetValue("cmi.completion_status"))      ||
                  (api2004 && api2004.GetValue("cmi.success_status"))         || "–";

  var lastSlide = (api12   && api12.LMSGetValue("cmi.core.lesson_location")) ||
                  (api2004 && api2004.GetValue("cmi.location"))               || "–";

  var interactions = [];
  var api = api12 || api2004;
  var isScorm12 = !!api12;
  var count = parseInt((api.cmi && api.cmi.interactions && api.cmi.interactions._count) || "0");

  for (var i = 0; i < count; i++) {
    var base = "cmi.interactions." + i + ".";
    var getValue = isScorm12 ? api.LMSGetValue.bind(api) : api.GetValue.bind(api);
    interactions.push({
      question      : getValue(base + "id")                          || ("Question " + (i + 1)),
      result        : getValue(base + "result")                      || "–",
      studentAnswer : getValue(base + "student_response")            || "–",
      correctAnswer : getValue(base + "correct_responses.0.pattern") || "–",
    });
  }

  var correct = interactions.filter(function (x) { return x.result === "correct"; }).length;
  var wrong   = interactions.filter(function (x) { return x.result === "wrong" || x.result === "incorrect"; }).length;

  return {
    score          : score,
    status         : status,
    lastSlide      : lastSlide,
    totalQuestions : interactions.length,
    correct        : correct,
    wrong          : wrong,
    interactions   : interactions,
  };
};