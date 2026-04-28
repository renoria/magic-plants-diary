async function loadPlants() {
  try {
    const { data: plants, error } = await db
      .from("plants")
      .select("*");

    if (error) {
      console.error(error);
    }

    const container = document.getElementById("plantsContainer");
    container.innerHTML = "";

    // ordinamento alfabetico (UX >>>)
    plants.sort((a, b) => a.name.localeCompare(b.name));

    plants.forEach(plant => {
      const row = document.createElement("div");
      row.className = "plant-row";

      row.innerHTML = `
        <span class="status-dot ${plant.status}"></span>

        <div class="plant-main">
          <span class="plant-name">${plant.name}</span>
          <span class="plant-scientific">${plant.scientific}</span>
        </div>

        <span class="plant-arrow">›</span>
      `;

      // 👉 click → pagina pianta
      row.addEventListener("click", () => {
        window.location.href = `plant-page.html?id=${plant.id}`;
      });

      container.appendChild(row);
    });

  } catch (err) {
    console.error("Errore caricamento piante:", err);
  }
}

loadPlants();