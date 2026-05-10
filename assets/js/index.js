// ======================
// 🔹 ATTIVITÀ RECENTE
// ======================

async function loadRecentActivity() {
  try {
    const { data: plants } = await db.from("plants").select("*");
    const { data: events } = await db.from("events").select("*");

    const plantMap = {};
    plants.forEach(p => {
      plantMap[p.id] = p.name;
    });

    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = events.slice(0, 12);

    const container = document.getElementById("globalActivity");
    container.innerHTML = "";

    recent.forEach(ev => {
      const row = document.createElement("div");
      row.className = "activity-row";

      const plantName = plantMap[ev.plant_id] || "Pianta sconosciuta";

      row.innerHTML = `
        <span class="activity-date">${formatDate(ev.date)}</span>
        <span class="activity-icon ${ev.type}">
          ${getIcon(ev.type)}
        </span>
        <span class="activity-text">
          <strong class="activity-plant">${plantName}</strong>
          <span class="activity-sep">—</span>
          ${ev.text}
        </span>
        <span class="activity-arrow">›</span>
      `;

      row.addEventListener("click", () => {
        window.location.href = `plant-page.html?id=${ev.plant_id}`;
      });

      container.appendChild(row);
    });

  } catch (err) {
    console.error("Errore attività:", err);
  }
}

// ======================
// 🔹 INGREDIENTI
// ======================

async function loadIngredients() {
  const { data, error } = await db.from("ingredients").select("*");

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("ingredientsList");
  container.innerHTML = "";

  data.forEach(item => {
    const level = item.level;

    let levelText = "Alto";
    let levelClass = "high";

    if (level <= 30) {
      levelText = "Poco";
      levelClass = "low";
    } else if (level <= 60) {
      levelText = "Medio";
      levelClass = "medium";
    }

    const el = document.createElement("div");
    el.className = "ingredient";

    el.innerHTML = `
      <div class="ingredient-top">
        <span>${item.name}</span>
        <span>${levelText}</span>
      </div>
      <div class="bar ${levelClass}">
        <span style="width: ${level}%"></span>
      </div>
    `;

    container.appendChild(el);
  });
}

// ======================
// 🔹 SHOPPING LIST
// ======================

async function loadShopping() {
  const { data, error } = await db.from("shopping").select("*");

  if (error) {
    console.error(error);
    return;
  }

  // 🧠 ordinamento: non comprati sopra
  data.sort((a, b) => {
    if (a.purchased === b.purchased) return 0;
    return a.purchased ? 1 : -1;
  });

  const container = document.getElementById("shoppingList");
  container.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="shopping-item-left">
        <input type="checkbox" class="shop-check" ${item.purchased ? "checked" : ""}>
        <span class="shop-name ${item.purchased ? "done" : ""}">
          ${item.name}
        </span>
      </div>
    `;

    // 🔥 CLICK CHECKBOX
    const checkbox = li.querySelector(".shop-check");

    checkbox.addEventListener("change", async () => {
      const checked = checkbox.checked;

      const { error } = await db
        .from("shopping")
        .update({
          purchased: checked,
          purchased_at: checked ? new Date().toISOString() : null
        })
        .eq("id", item.id);

      if (error) {
        console.error("Update error:", error);
        return;
      }

      loadShopping();
    });

    container.appendChild(li);
  });
}

// ======================
// 🔹 AUTO CLEANUP (7 giorni)
// ======================

async function cleanupShopping() {
  const { data, error } = await db.from("shopping").select("*");

  if (error) {
    console.error(error);
    return;
  }

  const now = new Date();

  for (const item of data) {
    if (item.purchased && item.purchased_at) {
      const days = (now - new Date(item.purchased_at)) / (1000 * 60 * 60 * 24);

      if (days >= 7) {
        await db.from("shopping").delete().eq("id", item.id);
      }
    }
  }
}

// ======================
// 🔹 AGGIUNTA MANUALE
// ======================

async function addShoppingItem() {
  const input = document.getElementById("shoppingInput");
  const value = input.value.trim();

  if (!value) return;

  const { error } = await db.from("shopping").insert([
    {
      name: value,
      priority: "medium",
      source: "manual",
      purchased: false
    }
  ]);

  if (error) {
    console.error(error);
    return;
  }

  input.value = "";
  loadShopping();
}

// ======================
// 🔹 UTILS
// ======================

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short"
  });
}

function getIcon(type) {
  switch (normalizeEventType(type)) {
    case "watering": return "💧";
    case "repot": return "🪴";
    case "problem": return "⚠️";
    case "fertilization": return "🧪";
    case "maintenance": return "🛠️";
    case "growth": return "🌱";
    case "note": return "📝";
    default: return "•";
  }
}

function normalizeEventType(type) {
  switch (type) {
    case "water":
      return "watering";
    case "fertilizzazione":
      return "fertilization";
    case "trattamento":
    case "action":
      return "maintenance";
    default:
      return type;
  }
}

// ======================
// 🔹 INIT
// ======================

document.addEventListener("DOMContentLoaded", () => {
  cleanupShopping(); // 🔥 pulizia automatica
  loadRecentActivity();
  loadIngredients();
  loadShopping();

  document
    .getElementById("addShoppingBtn")
    .addEventListener("click", addShoppingItem);
});
