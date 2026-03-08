// SCORM 1.2 Minimal Runtime

var scormData = {
  "cmi.core.lesson_status": "",
  "cmi.core.score.raw": "",
};

function updateUI(key, value) {
  var scoreEl = document.getElementById("score");
  var statusEl = document.getElementById("status");
  var badge = document.getElementById("status-badge");

  if (key === "cmi.core.score.raw" && scoreEl) {
    scoreEl.innerText = value || "–";
  }

  if (key === "cmi.core.lesson_status" && statusEl) {
    statusEl.innerText = value || "–";
    if (badge) {
      badge.className = "badge";
      if (value === "passed" || value === "completed") badge.classList.add("completed");
      if (value === "failed") badge.classList.add("failed");
    }
  }
}

window.API = {
  LMSInitialize: function () { return "true"; },
  LMSFinish: function () { return "true"; },
  LMSGetValue: function (key) { return scormData[key] || ""; },
  LMSSetValue: function (key, val) {
    scormData[key] = val;
    updateUI(key, val);
    return "true";
  },
  LMSCommit: function () { return "true"; },
  LMSGetLastError: function () { return "0"; },
  LMSGetErrorString: function () { return ""; },
  LMSGetDiagnostic: function () { return ""; },
};

window.API_1484_11 = {
  Initialize: function () { return "true"; },
  Terminate: function () { return "true"; },
  GetValue: function (key) { return scormData[key] || ""; },
  SetValue: function (key, val) { scormData[key] = val; updateUI(key, val); return "true"; },
  Commit: function () { return "true"; },
  GetLastError: function () { return "0"; },
  GetErrorString: function () { return ""; },
  GetDiagnostic: function () { return ""; },
};

window.addEventListener("load", function () {
  var frame = document.getElementById("scorm-frame");
  if (!frame) return;
  frame.addEventListener("load", function () {
    try {
      frame.contentWindow.API = window.API;
      frame.contentWindow.API_1484_11 = window.API_1484_11;
    } catch (e) { }
  });
});