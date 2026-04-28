async function loadRecentActivity() {
  try {
    // carica dati
    const plantsRes = await fetch("assets/data/plants.json");
    const plants = await plantsRes.json();

    const eventsRes = await fetch("assets/data/events.json");
    const events = await eventsRes.json();

    // mappa plant_id → nome
    const plantMap = {};
    plants.forEach(p => {
      plantMap[p.id] = p.name;
    });

    // ordina eventi per data DESC
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    // prendi i più recenti
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
    console.error("Errore caricamento attività:", err);
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short"
  });
}

function getIcon(type) {
  switch (type) {
    case "water": return "💧";
    case "repot": return "🪴";
    case "problem": return "⚠️";
    case "fertilizzazione": return "🌿";
    case "trattamento": return "🧪";
    case "growth": return "🌱";
    default: return "•";
  }
}

// avvio
loadRecentActivity();