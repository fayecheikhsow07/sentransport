import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

with open("lignes_ddd.json", "r", encoding="utf-8") as f:
    lignes = json.load(f)

with open("arrets.json", "r", encoding="utf-8") as f:
    arrets = json.load(f)

@app.route("/arrets")
def get_arrets():
    return jsonify(arrets)

@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>", "/arrets", "/stats", "/lignes/recherche?q=..."]
    })
# Endpoint pour les incidents
incidents = []

@app.route("/incidents", methods=["GET"])
def get_incidents():
    return jsonify(incidents)

@app.route("/incidents", methods=["POST"])
def post_incident():
    data = request.get_json()
    if not data or "ligne" not in data or "description" not in data:
        return jsonify({"erreur": "Champs requis manquants"}), 400
    
    incident = {
        "id": len(incidents) + 1,
        "ligne": data["ligne"],
        "description": data["description"],
        "lieu": data.get("lieu", "Non précisé"),
    }
    incidents.append(incident)
    return jsonify(incident), 201



@app.route("/lignes")
def get_lignes():
    return jsonify(lignes)

@app.route("/lignes/<int:ligne_id>")
def get_ligne(ligne_id):
    ligne = next((l for l in lignes if l["id"] == ligne_id), None)
    if ligne is None:
        return jsonify({"erreur": "Ligne non trouvée"}), 404
    return jsonify(ligne)

@app.route("/stats")
def get_stats():
    nombre_lignes = len(lignes)
    nombre_arrets = sum(len(ligne.get("listeArrets", [])) for ligne in lignes)
    ligne_max_arrets = max(lignes, key=lambda l: len(l.get("listeArrets", [])))
    return jsonify({
        "nombre_lignes": nombre_lignes,
        "nombre_arrets": nombre_arrets,
        "ligne_max_arrets": ligne_max_arrets["id"]
    })

@app.route("/lignes/recherche")
def rechercher_lignes():
    q = request.args.get("q", "").lower()
    lignes_filtrees = [
        ligne for ligne in lignes
        if q in ligne.get("depart", "").lower() or q in ligne.get("arrivee", "").lower()
    ]
    return jsonify(lignes_filtrees)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
 