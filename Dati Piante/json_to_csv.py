import json
import pandas as pd

# -------- PLANTS --------
with open("plants.json", encoding="utf-8") as f:
    plants = json.load(f)

df_plants = pd.DataFrame(plants)
df_plants.to_csv("plants.csv", index=False)

# -------- EVENTS --------
with open("events.json", encoding="utf-8") as f:
    events = json.load(f)

df_events = pd.DataFrame(events)
df_events.to_csv("events.csv", index=False)

print("CSV creati: plants.csv + events.csv ✅")
