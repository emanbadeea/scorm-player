// SCORM 1.2 Runtime

var scormData = {
  "cmi.core.lesson_status"  : "",
  "cmi.core.score.raw"      : "",
  "cmi.core.lesson_location": "",
  "cmi.interactions._count" : "0",
};

// interactions 
var interactions = [];


function parseInteractionKey(key) {
  var match = key.match(/^cmi\.interactions\.(\d+)\.(.+)$/);
  if (!match) return null;
  return { index: parseInt(match[1]), field: match[2] };
}

// ── updateUI ──
function updateUI(key, value) {
  var scoreEl  = document.getElementById("score");
  var statusEl = document.getElementById("status");
  var badge    = document.getElementById("status-badge");

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

// ── LMSSetValue──
function handleSetValue(key, val) {
  scormData[key] = val;
  updateUI(key, val);


  var parsed = parseInteractionKey(key);
  if (parsed) {
    var i = parsed.index;
    if (!interactions[i]) interactions[i] = {};
    interactions[i][parsed.field] = val;


    scormData["cmi.interactions._count"] = String(interactions.length);
  }

  return "true";
}


function handleGetValue(key) {

  var parsed = parseInteractionKey(key);
  if (parsed) {
    var interaction = interactions[parsed.index];
    if (interaction && interaction[parsed.field] !== undefined) {
      return interaction[parsed.field];
    }
    return "";
  }
  return scormData[key] !== undefined ? scormData[key] : "";
}


window.getSCORMReport = function () {
  var correct = 0;
  var wrong   = 0;
  var details = [];

  interactions.forEach(function (item, idx) {
    var result = (item.result || "").toLowerCase();
    if (result === "correct")   correct++;
    if (result === "wrong" || result === "incorrect") wrong++;

    details.push({
      question        : item.id || ("Question " + (idx + 1)),
      result          : item.result || "–",
      studentAnswer   : item.student_response || "–",
      correctAnswer   : (item["correct_responses.0.pattern"]) || "–",
    });
  });

  return {
    score          : scormData["cmi.core.score.raw"]       || "–",
    status         : scormData["cmi.core.lesson_status"]   || "–",
    lastSlide      : scormData["cmi.core.lesson_location"] || "–",
    totalQuestions : interactions.length,
    correct        : correct,
    wrong          : wrong,
    interactions   : details,
  };
};

// ══════════════════════════════════════
// SCORM 1.2 API
// ══════════════════════════════════════
window.API = {
  LMSInitialize : function ()         { return "true"; },
  LMSFinish     : function ()         { return "true"; },
  LMSGetValue   : function (key)      { return handleGetValue(key); },
  LMSSetValue   : function (key, val) { return handleSetValue(key, val); },
  LMSCommit     : function ()         { return "true"; },
  LMSGetLastError   : function () { return "0"; },
  LMSGetErrorString : function () { return ""; },
  LMSGetDiagnostic  : function () { return ""; },
};

// ══════════════════════════════════════
// SCORM 2004 API
// ══════════════════════════════════════
window.API_1484_11 = {
  Initialize  : function ()         { return "true"; },
  Terminate   : function ()         { return "true"; },
  GetValue    : function (key)      { return handleGetValue(key); },
  SetValue    : function (key, val) { return handleSetValue(key, val); },
  Commit      : function ()         { return "true"; },
  GetLastError    : function () { return "0"; },
  GetErrorString  : function () { return ""; },
  GetDiagnostic   : function () { return ""; },
};

// ── inject API into iframe ──
window.addEventListener("load", function () {
  var frame = document.getElementById("scorm-frame");
  if (!frame) return;
  frame.addEventListener("load", function () {
    try {
      frame.contentWindow.API         = window.API;
      frame.contentWindow.API_1484_11 = window.API_1484_11;
    } catch (e) {}
  });
});