const params = new URLSearchParams(location.search);
const title  = params.get("title") || "Course";
const path   = params.get("path")  || "";

document.title = title;
document.getElementById("course-title").textContent = title;

const frame = document.getElementById("scorm-frame");

// Wait for scorm-again to load before setting iframe src
window.addEventListener("scorm-ready", function () {
  if (path) frame.src = decodeURIComponent(path);
});

frame.addEventListener("load", function () {
  try {
    frame.contentWindow.API         = window.API;
    frame.contentWindow.API_1484_11 = window.API_1484_11;
  } catch(e) {}
});