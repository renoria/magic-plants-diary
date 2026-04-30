// prendi id dalla URL
const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");

// ======================
// 🔹 LOAD DATI
// ======================

async function loadPlant() {
  const { data, error } = await db
    .from("plants")
    .select("*")
    .eq("id", plantId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("name").value = data.name || "";
  document.getElementById("scientific").value = data.scientific || "";
  document.getElementById("origin").value = data.origin || "acquisto";
  document.getElementById("date").value = data.date || "";
  document.getElementById("light").value = data.light || "luce indiretta";
  document.getElementById("temperature").value = data.temperature || "";
  document.getElementById("watering_rule").value = data.watering_rule || "";
  document.getElementById("status").value = data.status || "ok";
}

// ======================
// 🔹 SAVE
// ======================

async function savePlant(e) {
  e.preventDefault();

  const updatedPlant = {
    name: document.getElementById("name").value,
    scientific: document.getElementById("scientific").value,
    origin: document.getElementById("origin").value,
    date: document.getElementById("date").value,
    light: document.getElementById("light").value,
    temperature: document.getElementById("temperature").value,
    watering_rule: document.getElementById("watering_rule").value,
    status: document.getElementById("status").value
  };

  const { error } = await db
    .from("plants")
    .update(updatedPlant)
    .eq("id", plantId);

  if (error) {
    console.error("Errore update:", error);
    return;
  }

  alert("Pianta aggiornata 🌱");
  window.location.href = `plant-page.html?id=${plantId}`;
}

// ======================
// 🔹 INIT
// ======================

document.addEventListener("DOMContentLoaded", () => {
  loadPlant();

  document
    .getElementById("editPlantForm")
    .addEventListener("submit", savePlant);
});