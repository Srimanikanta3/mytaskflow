const API_URL = "http://localhost:5000/api";

/* ================= REGISTER ================= */
async function register() {
  const username = document.getElementById("username")?.value;
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!username || !email || !password) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      window.location.href = "login.html";
    }
  } catch (err) {
    alert("Server error");
  }
}

/* ================= LOGIN ================= */
async function login() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Server error");
  }
}

function togglePasswordVisibility() {
  const input = document.getElementById("password");
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
}

function forgotPassword() {
  const email = document.getElementById("email")?.value || "";
  const qs = email ? `?email=${encodeURIComponent(email)}` : "";
  window.location.href = `forgotPassword.html${qs}`;
}

function prefillResetEmail() {
  const emailEl = document.getElementById("resetEmail");
  if (!emailEl) return;

  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");
  if (email) emailEl.value = email;
}

async function resetPassword() {
  const email = (document.getElementById("resetEmail")?.value || "").trim();
  const newPassword = document.getElementById("newPassword")?.value || "";
  const confirmPassword = document.getElementById("confirmPassword")?.value || "";

  if (!email || !newPassword || !confirmPassword) {
    const missing = [];
    if (!email) missing.push("Email");
    if (!newPassword) missing.push("New password");
    if (!confirmPassword) missing.push("Confirm password");
    alert(`Please fill: ${missing.join(", ")}`);
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New password and confirm password do not match");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to reset password");
      return;
    }

    alert(data.message || "Password updated");
    window.location.href = "login.html";
  } catch (err) {
    alert("Server error");
  }
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= DASHBOARD LOAD ================= */
function loadDashboard() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const userEl = document.getElementById("user");
  if (userEl) userEl.innerText = username;
}

/* ================= NAVIGATION ================= */
function goAddTask() {
  window.location.href = "addTask.html";
}

function goViewTasks() {
  window.location.href = "viewTask.html";
}

function goDashboard() {
  window.location.href = "dashboard.html";
}

/* ================= ADD TASK ================= */
async function addTask() {
  const title = document.getElementById("title")?.value;
  const description = document.getElementById("description")?.value;
  const dueDate = document.getElementById("dueDate")?.value;
  const token = localStorage.getItem("token");

  if (!title) {
    alert("Task title is required");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        dueDate: dueDate || undefined,
        status: "in-progress"
      })
    });

    if (!res.ok) {
      alert("Failed to add task");
      return;
    }

    alert("Task added successfully");
    window.location.href = "viewTask.html";
  } catch (err) {
    alert("Server error");
  }
}

/* ================= LOAD TASKS ================= */
async function loadTasks() {
  const token = localStorage.getItem("token");
  const inProgressList = document.getElementById("inProgressList");
  const completedList = document.getElementById("completedList");

  if (!inProgressList || !completedList) return;

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      alert("Unable to load tasks");
      return;
    }

    const tasks = await res.json();

    inProgressList.innerHTML = "";
    completedList.innerHTML = "";

    if (tasks.length === 0) {
      inProgressList.innerHTML = "<p>No tasks found</p>";
      completedList.innerHTML = "";
      return;
    }

    tasks.forEach(task => {
      const container =
        task.status === "completed" ? completedList : inProgressList;

      const div = document.createElement("div");
      div.className = "task";

      const due =
        task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date";

      const isCompleted = task.status === "completed";

      div.innerHTML = `
        <h4>${task.title}</h4>
        <div class="task-meta">
          <span class="badge ${isCompleted ? "completed" : "in-progress"}">
            ${isCompleted ? "Completed" : "In Progress"}
          </span>
          &nbsp;•&nbsp;
          Due: ${due}
        </div>
        <p>${task.description || ""}</p>
        ${
          isCompleted
            ? `<button onclick="deleteTask('${task._id}')">Delete</button>`
            : `
              <button onclick="markCompleted('${task._id}')">
                Mark as completed
              </button>
              <button onclick="deleteTask('${task._id}')">Delete</button>
            `
        }
      `;

      container.appendChild(div);
    });
  } catch (err) {
    alert("Server error");
  }
}

/* ================= UPDATE TASK STATUS ================= */
async function markCompleted(taskId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: "completed" })
    });

    if (res.ok) {
      loadTasks();
    } else {
      alert("Failed to update task");
    }
  } catch (err) {
    alert("Server error");
  }
}

/* ================= DELETE TASK ================= */
async function deleteTask(taskId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.ok) {
      loadTasks();
    } else {
      alert("Failed to delete task");
    }
  } catch (err) {
    alert("Server error");
  }
}