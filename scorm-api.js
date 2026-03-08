// SCORM API — Simple Runtime

var scormData = {
  "cmi.core.student_id"      : "learner_001",
  "cmi.core.student_name"    : "Learner",
  "cmi.core.lesson_status"   : "not attempted",
  "cmi.core.score.raw"       : "",
  "cmi.core.score.min"       : "0",
  "cmi.core.score.max"       : "100",
  "cmi.core.lesson_location" : "",
  "cmi.core.exit"            : "",
  "cmi.core.session_time"    : "00:00:00",
  "cmi.suspend_data"         : "",
  "cmi.launch_data"          : "",
};

var interactionsData = [];

function scormGetValue(key) {
  var m = key.match(/^cmi\.interactions\.(\d+)\.(.+)$/);
  if (m) {
    var item = interactionsData[parseInt(m[1])];
    return (item && item[m[2]] !== undefined) ? item[m[2]] : "";
  }
  if (key === "cmi.interactions._count") return String(interactionsData.length);
  return scormData[key] !== undefined ? scormData[key] : "";
}

function scormSetValue(key, val) {
  var m = key.match(/^cmi\.interactions\.(\d+)\.(.+)$/);
  if (m) {
    var idx = parseInt(m[1]);
    if (!interactionsData[idx]) interactionsData[idx] = {};
    interactionsData[idx][m[2]] = val;
    return "true";
  }
  scormData[key] = val;

  if (key === "cmi.core.score.raw") {
    document.getElementById("score").innerText = val || "–";
  }
  if (key === "cmi.core.lesson_status") {
    var statusEl = document.getElementById("status");
    var badge    = document.getElementById("status-badge");
    statusEl.innerText = val || "–";
    badge.className = "badge";
    if (val === "passed" || val === "completed") badge.classList.add("completed");
    if (val === "failed")                        badge.classList.add("failed");
  }
  return "true";
}

window.API = {
  LMSInitialize     : function ()      { return "true"; },
  LMSFinish         : function ()      { return "true"; },
  LMSGetValue       : function (key)   { return scormGetValue(key); },
  LMSSetValue       : function (k, v)  { return scormSetValue(k, v); },
  LMSCommit         : function ()      { return "true"; },
  LMSGetLastError   : function ()      { return "0"; },
  LMSGetErrorString : function ()      { return ""; },
  LMSGetDiagnostic  : function ()      { return ""; },
};

window.API_1484_11 = {
  Initialize      : function ()      { return "true"; },
  Terminate       : function ()      { return "true"; },
  GetValue        : function (key)   { return scormGetValue(key); },
  SetValue        : function (k, v)  { return scormSetValue(k, v); },
  Commit          : function ()      { return "true"; },
  GetLastError    : function ()      { return "0"; },
  GetErrorString  : function ()      { return ""; },
  GetDiagnostic   : function ()      { return ""; },
};

window.getSCORMReport = function () {
  var correct = 0, wrong = 0;
  var details = interactionsData.map(function (item, idx) {
    var result = (item.result || "").toLowerCase();
    if (result === "correct")                         correct++;
    if (result === "wrong" || result === "incorrect") wrong++;
    return {
      question      : item.id                             || ("Question " + (idx + 1)),
      result        : item.result                         || "–",
      studentAnswer : item.student_response               || "–",
      correctAnswer : item["correct_responses.0.pattern"] || "–",
    };
  });

  return {
    score          : scormData["cmi.core.score.raw"]       || "–",
    status         : scormData["cmi.core.lesson_status"]   || "–",
    lastSlide      : scormData["cmi.core.lesson_location"] || "–",
    totalQuestions : interactionsData.length,
    correct        : correct,
    wrong          : wrong,
    interactions   : details,
  };
};