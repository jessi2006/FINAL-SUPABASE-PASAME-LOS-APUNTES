import { supabase } from "./supabase-client.js";

let subjects = [
  { name: "Diseño Gráfico", icon: "🎨", count: 312, keywords: ["diseño", "illustrator", "photoshop", "tipografia", "color"] },
  { name: "Marketing", icon: "📈", count: 258, keywords: ["marketing", "publicidad", "estrategia", "marca"] },
  { name: "Matemáticas", icon: "📐", count: 401, keywords: ["matematicas", "matemática", "algebra", "calculo", "geometria"] },
  { name: "Programación", icon: "💻", count: 486, keywords: ["programacion", "programación", "html", "css", "javascript", "codigo"] },
  { name: "Contabilidad", icon: "🧮", count: 174, keywords: ["contabilidad", "finanzas", "contable"] },
  { name: "Historia", icon: "🏛️", count: 152, keywords: ["historia", "sociales", "edad", "civilizacion"] },
  { name: "Psicología", icon: "🧠", count: 233, keywords: ["psicologia", "psicología", "mente", "conducta"] },
  { name: "Comunicación", icon: "🎤", count: 197, keywords: ["comunicacion", "comunicación", "periodismo", "medios"] }
];

const subjectGrid = document.getElementById("subject-grid");
const categoryList = document.getElementById("category-list");
const emptyState = document.getElementById("empty-state");
const emptyText = document.getElementById("empty-text");
const resultsTitle = document.getElementById("results-title");
const resultsCount = document.getElementById("results-count");
const searchInput = document.getElementById("search-input");
const heroSearch = document.getElementById("hero-search");
const searchForm = document.getElementById("search-form");
const clearSearch = document.getElementById("clear-search");
const emptyClear = document.getElementById("empty-clear");
const searchMessage = document.getElementById("search-message");
const heroMessage = document.getElementById("hero-message");

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function renderSubjects(list, query = "") {
  subjectGrid.innerHTML = "";

  if (!list.length) {
    emptyState.hidden = false;
    resultsCount.textContent = "0 resultados";
    emptyText.textContent = query
      ? `No encontramos una materia relacionada con “${query}”. Prueba con otra palabra o limpia la búsqueda.`
      : "Escribe una materia o tema para comenzar.";
    return;
  }

  emptyState.hidden = true;
  resultsCount.textContent = `${list.length} ${list.length === 1 ? "resultado" : "resultados"}`;

  list.forEach(subject => {
    const article = document.createElement("article");
    article.className = "subject-card";

    const icon = document.createElement("span");
    icon.className = "subject-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = subject.icon;
    const title = document.createElement("h4");
    title.textContent = subject.name;
    const button = document.createElement("button");
    button.dataset.subject = subject.name;
    button.type = "button";
    button.textContent = "Ver apuntes";
    article.append(icon, title, button);
    subjectGrid.appendChild(article);
  });
}

function filterSubjects(query) {
  const clean = normalize(query.trim());

  if (!clean) {
    resultsTitle.textContent = "Lo más buscado esta semana 🔥";
    renderSubjects(subjects);
    return;
  }

  const filtered = subjects.filter(subject => {
    const text = normalize(subject.name + " " + subject.keywords.join(" "));
    return text.includes(clean);
  });

  resultsTitle.textContent = `Resultados para “${query.trim()}”`;
  renderSubjects(filtered, query.trim());
}

function renderCategories() {
  categoryList.innerHTML = "";

  subjects.forEach(subject => {
    const button = document.createElement("button");
    button.className = "category-button";
    button.type = "button";
    button.textContent = subject.name;
    button.dataset.category = subject.name;

    button.addEventListener("click", () => {
      document.querySelectorAll(".category-button").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      searchInput.value = subject.name;
      filterSubjects(subject.name);

      document.getElementById("buscar").scrollIntoView({ behavior: "smooth" });
    });

    categoryList.appendChild(button);
  });
}

function showMessage(element, text, isError = false) {
  element.textContent = text;
  element.classList.toggle("error", isError);
}

function clearMessage(element) {
  element.textContent = "";
  element.classList.remove("error");
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    showMessage(searchMessage, "Escribe una materia o tema antes de buscar.", true);
    searchInput.focus();
    filterSubjects("");
    return;
  }

  clearMessage(searchMessage);
  filterSubjects(query);
});

heroSearch.addEventListener("submit", event => {
  event.preventDefault();

  const query = heroSearch.elements.q.value.trim();

  if (!query) {
    showMessage(heroMessage, "Escribe una materia o tema antes de buscar.", true);
    heroSearch.elements.q.focus();
    return;
  }

  clearMessage(heroMessage);
  searchInput.value = query;
  filterSubjects(query);
  document.getElementById("buscar").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", () => {
  clearMessage(searchMessage);
  filterSubjects(searchInput.value);
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  clearMessage(searchMessage);
  document.querySelectorAll(".category-button").forEach(btn => btn.classList.remove("active"));
  filterSubjects("");
  searchInput.focus();
});

emptyClear.addEventListener("click", () => {
  clearSearch.click();
});

subjectGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-subject]");
  if (!button) return;

  const subject = subjects.find(item => item.name === button.dataset.subject);
  if (subject) {
    openModal("notes-modal");
    void loadNotes(subject);
  }
});

/* MENÚ MÓVIL */
const menuToggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("nav-movil");

function closeMenu() {
  mobileNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
  menuToggle.querySelector("span").textContent = "☰";
}

function openMenu() {
  mobileNav.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Cerrar menú");
  menuToggle.querySelector("span").textContent = "×";
}

menuToggle.addEventListener("click", () => {
  const isOpen = mobileNav.classList.contains("is-open");
  isOpen ? closeMenu() : openMenu();
});

mobileNav.addEventListener("click", event => {
  const target = event.target.closest("a");
  if (target) closeMenu();
});

/* MODALES */
const modals = document.querySelectorAll(".modal");
let lastFocusedElement = null;

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("modal-open");

  const firstInput = modal.querySelector("input, select, button");
  if (firstInput) firstInput.focus();
}

function closeModal(modal) {
  modal.hidden = true;

  if (![...modals].some(item => !item.hidden)) {
    document.body.classList.remove("modal-open");
  }

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

document.querySelectorAll("[data-open-modal]").forEach(button => {
  button.addEventListener("click", () => openRequestedModal(button.dataset.openModal));
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    if (modal) closeModal(modal);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    const activeModal = [...modals].find(modal => !modal.hidden);
    if (activeModal) closeModal(activeModal);
    closeMenu();
  }
});

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const signupButton = document.getElementById("signup-button");
const logoutButton = document.getElementById("logout-button");
const uploadForm = document.getElementById("upload-form");
const uploadSubject = document.getElementById("upload-subject");
const uploadMessage = document.getElementById("upload-message");
const notesMessage = document.getElementById("notes-message");
const notesList = document.getElementById("notes-list");
const missingConfig = "Configura la URL y la clave publicable de Supabase.";
let user = null;
let catalogAdmin = false;
let notesRequest = 0;
let activeSubject = null;
let pendingUpload = null;

function openRequestedModal(id) {
  if (id === "upload-modal" && !user) {
    openModal("login-modal");
    showMessage(loginMessage, supabase ? "Inicia sesión para guardar un apunte." : missingConfig, true);
  } else {
    openModal(id);
  }
}

function refreshNotes() {
  notesRequest++;
  notesList.replaceChildren();
  if (activeSubject && !document.getElementById("notes-modal").hidden) void loadNotes(activeSubject);
}

function updateSession(nextUser) {
  const changed = user?.id !== nextUser?.id;
  user = nextUser;
  loginForm.hidden = Boolean(user);
  logoutButton.hidden = !user;
  document.getElementById("login-title").textContent = user ? "Mi cuenta" : "Iniciar sesión";
  for (const button of document.querySelectorAll('[data-open-modal="login-modal"]')) {
    button.textContent = user ? "Mi cuenta" : "Iniciar sesión";
  }
  if (!changed) return;
  catalogAdmin = false;
  if (!user && !document.getElementById("upload-modal").hidden) closeModal(document.getElementById("upload-modal"));
  refreshNotes();
  if (user) {
    const userId = user.id;
    void supabase.rpc("can_manage_catalog").then(({ data }) => {
      if (user?.id === userId && data === true) {
        catalogAdmin = true;
        refreshNotes();
      }
    });
  }
}

async function authenticate(signup) {
  if (!loginForm.reportValidity()) return;
  if (!supabase) return showMessage(loginMessage, missingConfig, true);
  const credentials = {
    email: document.getElementById("login-email").value.trim(),
    password: document.getElementById("login-password").value
  };
  const buttons = [...loginForm.querySelectorAll("button")];
  buttons.forEach(button => { button.disabled = true; });
  showMessage(loginMessage, "Procesando…");
  try {
    const result = signup ? await supabase.auth.signUp(credentials) : await supabase.auth.signInWithPassword(credentials);
    if (result.error) throw result.error;
    loginForm.reset();
    showMessage(loginMessage, result.data.session ? "Sesión iniciada." : "Revisa tu correo para confirmar la cuenta.");
  } catch {
    showMessage(loginMessage, signup
      ? "No se pudo crear la cuenta. Verifica los datos o inténtalo más tarde."
      : "No se pudo iniciar sesión. Verifica tus datos y la confirmación del correo.", true);
  } finally {
    buttons.forEach(button => { button.disabled = false; });
  }
}

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  void authenticate(false);
});
signupButton.addEventListener("click", () => { void authenticate(true); });
logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
    showMessage(loginMessage, "Sesión cerrada.");
  } catch {
    showMessage(loginMessage, "No se pudo cerrar la sesión.", true);
  } finally {
    logoutButton.disabled = false;
  }
});

async function initializeCatalog() {
  if (supabase) {
    const { data, error } = await supabase.from("subjects").select("id,name,icon,keywords").order("name");
    if (error) showMessage(searchMessage, "No se pudo cargar el catálogo remoto.", true);
    else subjects = data;
  }
  for (const subject of subjects.filter(item => item.id)) {
    uploadSubject.add(new Option(subject.name, subject.id));
  }
  renderCategories();
  filterSubjects(searchInput.value);
}

function readPdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

uploadForm.addEventListener("submit", async event => {
  event.preventDefault();
  const title = document.getElementById("upload-title").value.trim();
  const file = document.getElementById("upload-file").files[0];
  if (!supabase || !user) return showMessage(uploadMessage, "Inicia sesión para subir un apunte.", true);
  if (!uploadSubject.value || title.length < 3 || !file || file.type !== "application/pdf"
      || file.size < 5 || file.size > 5 * 1024 * 1024) {
    return showMessage(uploadMessage, "Elige una materia, un título válido y un PDF de hasta 5 MiB.", true);
  }
  const button = uploadForm.querySelector('[type="submit"]');
  const subjectId = uploadSubject.value;
  const publicAccess = document.getElementById("upload-visibility").value === "public";
  const userId = user.id;
  button.disabled = true;
  showMessage(uploadMessage, "Guardando…");
  try {
    if (pendingUpload?.file !== file || pendingUpload.title !== title || pendingUpload.subjectId !== subjectId
        || pendingUpload.publicAccess !== publicAccess || pendingUpload.userId !== userId) {
      pendingUpload = { id: crypto.randomUUID(), file, title, subjectId, publicAccess, userId };
    }
    const pdf = await readPdf(file);
    if (user?.id !== userId) throw new Error("La sesión cambió.");
    const { data, error } = await supabase.rpc("publish_note", {
      request_id: pendingUpload.id, note_subject: subjectId, note_title: title,
      pdf_base64: pdf, public_access: publicAccess
    });
    if (error || !data) throw error || new Error("Falta el identificador del apunte.");
    uploadForm.reset();
    pendingUpload = null;
    showMessage(uploadMessage, "Apunte guardado. Consúltalo desde su materia.");
  } catch {
    showMessage(uploadMessage, "No se pudo confirmar el guardado. Revisa los apuntes antes de reintentar.", true);
  } finally {
    button.disabled = false;
  }
});

function action(label, handler) {
  const button = document.createElement("button");
  button.className = "link-button";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await handler();
    } catch {
      showMessage(notesMessage, "No se pudo completar la operación. Verifica tu sesión y tus permisos.", true);
    } finally {
      button.disabled = false;
    }
  });
  return button;
}

async function downloadNote(note) {
  const { data, error } = await supabase.rpc("download_note_pdf", { target_note: note.id });
  if (error || !data) throw error || new Error("PDF no disponible.");
  const bytes = Uint8Array.from(atob(data), character => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "apunte.pdf";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function saveNote(note, subject, changes) {
  const table = supabase.from("notes");
  const operation = changes ? table.update(changes) : table.delete();
  const { data, error } = await operation.eq("id", note.id).select("id").maybeSingle();
  if (error || !data) throw error || new Error("Ningún registro modificado.");
  if (activeSubject === subject) await loadNotes(subject);
}

function renderNote(note, subject) {
  const row = document.createElement("li");
  const title = document.createElement("strong");
  title.textContent = note.title;
  const details = document.createElement("p");
  details.textContent = [note.is_public ? "Público" : "Privado", note.summary, ...note.topics].filter(Boolean).join(" · ");
  row.append(title, details, action("Descargar PDF", () => downloadNote(note)));
  if (user?.id !== note.owner_id && !catalogAdmin) return row;

  const edit = document.createElement("form");
  edit.hidden = true;
  const input = document.createElement("input");
  input.setAttribute("aria-label", "Nuevo título");
  input.minLength = 3;
  input.maxLength = 150;
  input.required = true;
  input.value = note.title;
  const visibility = document.createElement("select");
  visibility.setAttribute("aria-label", "Visibilidad");
  visibility.add(new Option("Privado", "private"));
  visibility.add(new Option("Público", "public"));
  visibility.value = note.is_public ? "public" : "private";
  const save = action("Guardar cambios", async () => {
    if (!edit.reportValidity() || input.value.trim().length < 3) {
      return showMessage(notesMessage, "Escribe un título de al menos tres caracteres.", true);
    }
    await saveNote(note, subject, { title: input.value.trim(), is_public: visibility.value === "public" });
  });
  edit.addEventListener("submit", event => { event.preventDefault(); save.click(); });
  edit.append(input, visibility, save);
  row.append(action("Editar", () => {
    edit.hidden = !edit.hidden;
    if (!edit.hidden) input.focus();
  }), action("Eliminar", async () => {
    if (window.confirm("¿Eliminar este apunte y su PDF?")) await saveNote(note, subject);
  }), edit);
  return row;
}

async function loadNotes(subject) {
  const request = ++notesRequest;
  activeSubject = subject;
  document.getElementById("notes-heading").textContent = subject.name;
  notesList.replaceChildren();
  if (!supabase || !subject.id) {
    return showMessage(notesMessage, !supabase ? missingConfig : "El catálogo remoto no está disponible.", true);
  }
  showMessage(notesMessage, "Cargando apuntes…");
  const { data, error } = await supabase.from("notes")
    .select("id,title,is_public,owner_id,summary,topics").eq("subject_id", subject.id)
    .order("created_at", { ascending: false });
  if (request !== notesRequest) return;
  if (error) return showMessage(notesMessage, "No se pudieron consultar los apuntes.", true);
  showMessage(notesMessage, data.length ? "" : "Esta materia aún no tiene apuntes disponibles.");
  notesList.append(...data.map(note => renderNote(note, subject)));
}

void initializeCatalog();
if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => updateSession(session?.user ?? null), 0);
  });
}
