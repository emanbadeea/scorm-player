// ══════════════════════════════════════════
//  COURSES LIST
//  لما تضيفي كورس جديد، ضيفيه هنا بس ✏️
// ══════════════════════════════════════════
const courses = [
  {
    id:       "english-test",
    title:    "English Test",
    category: "Language",
    desc:     "Test your English skills with interactive lessons and quizzes.",
    duration: "5 min",
    lessons:  2,
    emoji:    "🇬🇧",
    color:    "linear-gradient(135deg,#1a1a3e,#2d1b69)",
    path:     "courses/english-test/index.html",
  },
  // ── أضيفي كورس جديد هنا ──
  // {
  //   id:       "course-id",
  //   title:    "Course Name",
  //   category: "Category",
  //   desc:     "Short description.",
  //   duration: "10 min",
  //   lessons:  5,
  //   emoji:    "📘",
  //   color:    "linear-gradient(135deg,#1a2e1a,#1b4d1b)",
  //   path:     "courses/course-id/index.html",
  // },
];

// ── render cards ──
const grid = document.getElementById("grid");

if (courses.length === 0) {
  grid.innerHTML = `
    <div class="empty">
      <div class="empty-icon">📭</div>
      <h3>No Courses Yet</h3>
      <p>Add your first SCORM package to the <code>courses/</code> folder and register it in <code>courses.js</code>.</p>
    </div>`;
} else {
  courses.forEach(c => {
    const card = document.createElement("a");
    card.className = "card";
    card.href = `player.html?course=${c.id}&path=${encodeURIComponent(c.path)}&title=${encodeURIComponent(c.title)}`;
    card.innerHTML = `
      <div class="card-thumb" style="background:${c.color}">${c.emoji}</div>
      <div class="card-body">
        <div class="card-category">${c.category}</div>
        <div class="card-title">${c.title}</div>
        <div class="card-desc">${c.desc}</div>
      </div>
      <div class="card-footer">
        <div class="card-meta">
          <span>⏱ ${c.duration}</span>
          <span>📄 ${c.lessons} lessons</span>
        </div>
        <div class="btn-play">▶ Launch</div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── stats ──
const cats = [...new Set(courses.map(c => c.category))].length;
document.getElementById("stat-total").textContent   = courses.length;
document.getElementById("stat-cats").textContent    = cats;
document.getElementById("course-count").textContent = `${courses.length} course${courses.length !== 1 ? "s" : ""} available`;