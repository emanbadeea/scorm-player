// ── read URL params ──
const params = new URLSearchParams(location.search);
const title  = params.get("title") || "Course";
const path   = params.get("path")  || "";

document.title = title;
document.getElementById("course-title").textContent = title;

const frame = document.getElementById("scorm-frame");
if (path) frame.src = decodeURIComponent(path);

// ── inject SCORM API into iframe on load ──
frame.addEventListener("load", function () {
  try {
    frame.contentWindow.API         = window.API;
    frame.contentWindow.API_1484_11 = window.API_1484_11;
  } catch(e) {}
});