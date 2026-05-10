let saveTimers = {};

async function loadIngredientManager() {
  const { data, error } = await db
    .from("ingredients")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("ingredientManagerList");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nessun ingrediente";
    container.appendChild(empty);
    return;
  }

  data.forEach(item => {
    container.appendChild(createIngredientRow(item));
  });
}

function createIngredientRow(item) {
  const row = document.createElement("div");
  row.className = "ingredient-manager-row";

  const main = document.createElement("div");
  main.className = "ingredient-row-main";

  const top = document.createElement("div");
  top.className = "ingredient-row-top";

  const name = document.createElement("span");
  name.className = "ingredient-name";
  name.textContent = item.name;

  const level = document.createElement("span");
  level.className = "ingredient-level";
  level.textContent = `${item.level ?? 0}%`;

  top.appendChild(name);
  top.appendChild(level);

  const slider = document.createElement("input");
  slider.className = "ingredient-slider";
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.step = "5";
  slider.value = item.level ?? 0;

  const saveState = document.createElement("span");
  saveState.className = "save-state";

  slider.addEventListener("input", () => {
    const nextLevel = Number(slider.value);
    level.textContent = `${nextLevel}%`;
    saveState.textContent = "Salvataggio...";
    queueLevelSave(item.id, nextLevel, saveState);
  });

  main.appendChild(top);
  main.appendChild(slider);
  main.appendChild(saveState);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-ingredient-btn";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", `Elimina ${item.name}`);
  deleteBtn.addEventListener("click", () => deleteIngredient(item.id, item.name));

  row.appendChild(main);
  row.appendChild(deleteBtn);

  return row;
}

function queueLevelSave(id, level, saveState) {
  clearTimeout(saveTimers[id]);

  saveTimers[id] = setTimeout(async () => {
    const { error } = await db
      .from("ingredients")
      .update({ level })
      .eq("id", id);

    if (error) {
      console.error(error);
      saveState.textContent = "Errore";
      return;
    }

    saveState.textContent = "Salvato";
    setTimeout(() => {
      if (saveState.textContent === "Salvato") {
        saveState.textContent = "";
      }
    }, 1200);
  }, 350);
}

async function addIngredient() {
  const input = document.getElementById("ingredientName");
  const name = input.value.trim();

  if (!name) return;

  const { error } = await db.from("ingredients").insert([
    {
      name,
      level: 100
    }
  ]);

  if (error) {
    console.error(error);
    alert("Errore salvataggio");
    return;
  }

  input.value = "";
  loadIngredientManager();
}

async function deleteIngredient(id, name) {
  const ok = confirm(`Eliminare ${name}?`);

  if (!ok) return;

  const { error } = await db
    .from("ingredients")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Errore eliminazione");
    return;
  }

  loadIngredientManager();
}

document.addEventListener("DOMContentLoaded", () => {
  loadIngredientManager();

  document
    .getElementById("addIngredientBtn")
    .addEventListener("click", addIngredient);

  document
    .getElementById("ingredientName")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addIngredient();
      }
    });
});
