// SCORM API — powered by scorm-again
// https://github.com/jcputney/scorm-again

var scormAgainScript = document.createElement("script");
scormAgainScript.src = "https://cdn.jsdelivr.net/npm/scorm-again@latest/dist/scorm-again.js";
scormAgainScript.onload = function () {
  initSCORM();
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
  var api = window.API;
  if (!api) return {};

  var interactions = [];
  var count = parseInt(api.cmi.interactions._count || "0");

  for (var i = 0; i < count; i++) {
    var base = "cmi.interactions." + i + ".";
    interactions.push({
      question      : api.LMSGetValue(base + "id")                          || ("Question " + (i + 1)),
      result        : api.LMSGetValue(base + "result")                      || "–",
      studentAnswer : api.LMSGetValue(base + "student_response")            || "–",
      correctAnswer : api.LMSGetValue(base + "correct_responses.0.pattern") || "–",
    });
  }

  var correct = interactions.filter(function (x) { return x.result === "correct"; }).length;
  var wrong   = interactions.filter(function (x) { return x.result === "wrong" || x.result === "incorrect"; }).length;

  return {
    score          : api.LMSGetValue("cmi.core.score.raw")       || "–",
    status         : api.LMSGetValue("cmi.core.lesson_status")   || "–",
    lastSlide      : api.LMSGetValue("cmi.core.lesson_location") || "–",
    totalQuestions : interactions.length,
    correct        : correct,
    wrong          : wrong,
    interactions   : interactions,
  };
};