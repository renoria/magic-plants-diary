import pandas as pd
import json

# carica excel
file = "Inventario PIANTE.xlsx"

# fogli
watering = pd.read_excel(file, sheet_name="innaffiature")
treatments = pd.read_excel(file, sheet_name="trattamenti")
repotting = pd.read_excel(file, sheet_name="rinvasi")
diary = pd.read_excel(file, sheet_name="diario")

events = []

# -------------------------
# INNAFFIATURE
# -------------------------
for _, row in watering.iterrows():

    tipo = str(row.get("tipo", "")).lower().strip()

    events.append({
        "plant_id": str(row["plant_id"]),
        "date": pd.to_datetime(row["data"]).strftime("%Y-%m-%d"),
        "type": "water",
        "text": f"Innaffiatura: {tipo}"
    })


# -------------------------
# TRATTAMENTI
# -------------------------
for _, row in treatments.iterrows():

    tipo = str(row.get("tipo", "")).lower().strip()
    descrizione = str(row.get("descrizione", "")).strip()
    prodotto = str(row.get("prodotto_usato", "")).strip()

    text = descrizione

    if prodotto and prodotto != "nan":
        text = f"{descrizione} ({prodotto})"

    events.append({
        "plant_id": str(row["plant_id"]),
        "date": pd.to_datetime(row["data"]).strftime("%Y-%m-%d"),
        "type": tipo,
        "text": text
    })


# -------------------------
# RINVASI
# -------------------------
for _, row in repotting.iterrows():

    vaso_old = str(row.get("vaso_precedente", "")).strip()
    vaso_new = str(row.get("vaso_nuovo", "")).strip()
    substrato = str(row.get("substrato_usato", "")).strip()
    note = str(row.get("note", "")).strip()

    text = "Rinvaso"

    if vaso_old and vaso_old != "nan" and vaso_new and vaso_new != "nan":
        text += f": {vaso_old} → {vaso_new}"
    elif vaso_new and vaso_new != "nan":
        text += f": vaso {vaso_new}"

    if substrato and substrato != "nan":
        text += f" • {substrato}"

    if note and note != "nan":
        text += f" • {note}"

    events.append({
        "plant_id": str(row["plant_id"]),
        "date": pd.to_datetime(row["data"]).strftime("%Y-%m-%d"),
        "type": "repot",
        "text": text
    })


# -------------------------
# DIARIO
# -------------------------
for _, row in diary.iterrows():

    categoria = str(row.get("categoria", "")).lower().strip()
    testo = str(row.get("testo", "")).strip()

    if categoria == "problema":
        event_type = "problem"
    elif categoria == "intervento":
        event_type = "action"
    elif categoria == "crescita":
        event_type = "growth"
    elif categoria == "osservazione":
        event_type = "note"
    else:
        event_type = "note"

    events.append({
        "plant_id": str(row["plant_id"]),
        "date": pd.to_datetime(row["data"]).strftime("%Y-%m-%d"),
        "type": event_type,
        "text": testo
    })


# salva JSON
with open("events.json", "w", encoding="utf-8") as f:
    json.dump(events, f, indent=2, ensure_ascii=False)

print("events.json creato ✅")
