// 👉 imposta data automatica appena carica la pagina
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("date").value = new Date().toISOString().slice(0, 10);
});

const btn = document.getElementById("savePlantBtn");

btn.addEventListener("click", async () => {
  const plant = {
    name: document.getElementById("name").value.trim(),
    scientific: document.getElementById("scientific").value.trim(),
    origin: document.getElementById("origin").value,
    date: document.getElementById("date").value,
    light: document.getElementById("light").value,
    temperature: document.getElementById("temperature").value.trim(),
    watering_rule: document.getElementById("water").value,
    status: document.getElementById("status").value
  };

  if (!plant.name) {
    alert("Nome obbligatorio");
    return;
  }

  const { data, error } = await db.from("plants").insert([plant]).select();

  if (error) {
    console.error(error);
    alert("Errore salvataggio");
  } else {
    // 👉 prende ID della pianta appena creata
    const newPlantId = data[0].id;

    // 👉 redirect diretto alla pagina della pianta
    window.location.href = `plant-page.html?id=${newPlantId}`;
  }
});