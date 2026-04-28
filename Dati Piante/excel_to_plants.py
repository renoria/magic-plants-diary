import pandas as pd
import json

file = "Inventario PIANTE.xlsx"

plants_df = pd.read_excel(file, sheet_name="piante")

plants = []

for _, row in plants_df.iterrows():

    # -------------------------
    # STATUS NORMALIZZATO
    # -------------------------
    status = str(row.get("stato_generale", "ok")).lower().strip()

    if status == "problema":
        status = "problem"
    elif status == "attenzione":
        status = "attention"
    else:
        status = "ok"

    # -------------------------
    # TEMPERATURA (min + max)
    # -------------------------
    temp_min = str(row.get("temp_min", "")).strip()
    temp_max = str(row.get("temp_max", "")).strip()

    temperature = ""

    if temp_min and temp_min != "nan" and temp_max and temp_max != "nan":
        temperature = f"{temp_min}° – {temp_max}°"
    elif temp_min and temp_min != "nan":
        temperature = f"{temp_min}°"
    elif temp_max and temp_max != "nan":
        temperature = f"{temp_max}°"

    # -------------------------
    # DATA PULITA
    # -------------------------
    date_raw = str(row.get("data_nascita_o_acquisto", "")).strip()

    if date_raw and date_raw != "nan" and date_raw != "YYYY-MM-DD":
        date = pd.to_datetime(date_raw).strftime("%Y-%m-%d")
    else:
        date = ""

    # -------------------------
    # CREAZIONE OGGETTO PIANTA
    # -------------------------
    plant = {
        "id": str(row["plant_id"]),
        "name": str(row.get("nome_comune", "")).strip(),
        "scientific": str(row.get("nome_scientifico", "")).strip(),
        "status": status,

        "origin": str(row.get("origine", "")).strip(),
        "date": date,

        "light": str(row.get("luce", "")).strip(),
        "temperature": temperature,
        "watering_rule": str(row.get("acqua", "")).strip()
    }

    plants.append(plant)

# -------------------------
# SALVA JSON
# -------------------------
with open("plants.json", "w", encoding="utf-8") as f:
    json.dump(plants, f, indent=2, ensure_ascii=False)

print("plants.json creato ✅")