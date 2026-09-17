import {
  COVER,
  LAST,
  canNext,
  canPrev,
  close,
  createState,
  currentSpread,
  goTo,
  isEnd,
  next,
  open,
  positionLabel,
  prev,
  stageState,
  stateFromQuery,
} from "./pages.js";

const $ = (id) => document.getElementById(id);

const book = $("book");
const bookState = $("book-state");
const spread = $("spread");
const cover = $("cover");
const pageLeft = $("page-left");
const pageRight = $("page-right");
const position = $("position");
const openBtn = $("open-btn");
const prevBtn = $("prev-btn");
const nextBtn = $("next-btn");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

let state = stateFromQuery(window.location.search);
let toastTimer = null;
let reachedEnd = isEnd(state);

function fillPage(el, page) {
  el.replaceChildren();
  el.dataset.kind = page.kind;
  const h = document.createElement("h3");
  h.className = "page-title";
  h.textContent = page.title;
  el.appendChild(h);
  if (page.kind === "plate") {
    const plate = document.createElement("div");
    plate.className = "plate";
    plate.setAttribute("role", "img");
    plate.setAttribute("aria-label", `${page.title} · sample plate`);
    el.appendChild(plate);
  }
  const ul = document.createElement("ul");
  ul.className = "page-lines";
  for (const line of page.lines) {
    const li = document.createElement("li");
    li.textContent = line;
    ul.appendChild(li);
  }
  el.appendChild(ul);
}

function render() {
  const stage = stageState(state);
  book.dataset.state = stage;
  book.dataset.direction = state.direction;
  bookState.textContent = positionLabel(state);
  position.textContent = positionLabel(state);

  const cur = currentSpread(state);
  cover.hidden = !!cur;
  spread.hidden = !cur;
  if (cur) {
    fillPage(pageLeft, cur.left);
    fillPage(pageRight, cur.right);
    spread.dataset.page = String(state.page);
    // restart the flip animation
    spread.classList.remove("flip");
    void spread.offsetWidth;
    spread.classList.add("flip");
  }

  openBtn.hidden = state.open;
  prevBtn.disabled = !canPrev(state);
  nextBtn.disabled = !canNext(state);
  nextBtn.textContent = state.open ? (isEnd(state) ? "End" : "Next →") : "Open →";

  const atEnd = stage === "end";
  friction.dataset.muted = state.open ? "true" : "false";
  frictionLine.textContent = state.open
    ? "Quiet. This one turns."
    : "The layout everyone ships. Not what the book does.";
  if (atEnd && !reachedEnd) showToast("Read to the end · colophon");
  reachedEnd = atEnd;
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

openBtn.addEventListener("click", () => {
  open(state);
  render();
  nextBtn.focus();
});
cover.addEventListener("click", () => {
  if (!state.open) {
    open(state);
    render();
  }
});
nextBtn.addEventListener("click", () => {
  if (next(state).ok) render();
});
prevBtn.addEventListener("click", () => {
  if (prev(state).ok) render();
});

document.addEventListener("keydown", (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (target && target.closest("input, textarea, select")) return;
  if (e.key === "ArrowRight") {
    if (next(state).ok) render();
  } else if (e.key === "ArrowLeft") {
    if (prev(state).ok) render();
  }
});

$("load-example").addEventListener("click", () => {
  goTo(state, LAST);
  render();
});

$("reset-empty").addEventListener("click", () => {
  state = createState();
  close(state);
  state.direction = "none";
  reachedEnd = false;
  render();
  toast.dataset.show = "false";
});

cover.querySelector(".cover-title").textContent = COVER.title;
cover.querySelector(".cover-sub").textContent = COVER.sub;
render();
