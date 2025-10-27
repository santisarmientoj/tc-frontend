import { auth } from "../firebase-config.js";

const content = document.getElementById("content");
const lessonList = document.getElementById("lesson-list");
const courseTitle = document.getElementById("course-title");

// 🧭 Detectar curso desde la URL: ejemplo: curso.html?curso=armonia
const params = new URLSearchParams(window.location.search);
const cursoId = params.get("curso") || "armonia";

// 🔹 Cargar datos del curso desde JSON
async function loadCourseData() {
  const res = await fetch(`./js/data/${cursoId}.json`);
  if (!res.ok) throw new Error("No se pudo cargar el curso.");
  return res.json();
}

// 🔹 Renderizar lista de lecciones
function renderLessons(lessons) {
  lessonList.innerHTML = lessons
    .map(
      (lesson, i) => `
      <div class="lesson-item" data-id="${lesson.playbackId}">
        <span>${i + 1}. ${lesson.title}</span>
      </div>`
    )
    .join("");

  document.querySelectorAll(".lesson-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.getAttribute("data-id");
      loadVideo(id);
    });
  });
}

// 🔹 Cargar un video de Mux
function loadVideo(playbackId) {
  content.innerHTML = `
    <!--<mux-player
      playback-id="${playbackId}"
      stream-type="on-demand"
      style="width:100%; max-width:900px; aspect-ratio:16/9; border-radius:12px; margin-top:20px;"
    ></mux-player>-->
    <iframe
  src="https://player.mux.com/${playbackId}?metadata-video-title=14&video-title=14"
  style="width: 100%; border: none; aspect-ratio: 16/9;"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen
></iframe>
  `;
}

// 🔹 Inicializar
loadCourseData()
  .then((data) => {
    document.title = `${data.title} | Tutoriales Cristianos`;
    courseTitle.textContent = data.title;
    renderLessons(data.lessons);
  })
  .catch((err) => {
    content.innerHTML = `<p>Error al cargar el curso: ${err.message}</p>`;
  });
