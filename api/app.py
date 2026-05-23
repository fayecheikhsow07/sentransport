import json
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

with open("lignes_ddd.json", "r", encoding="utf-8") as f:
    lignes = json.load(f)

@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>"]
    })

@app.route("/lignes")
def get_lignes():
    return jsonify(lignes)

@app.route("/lignes/<int:ligne_id>")
def get_ligne(ligne_id):
    ligne = next(
        (l for l in lignes if l["id"] == ligne_id),
        None
    )

    if ligne is None:
        return jsonify({
            "erreur": "Ligne non trouvee"
        }), 404

    return jsonify(ligne)


# Ajoutez un endpoint GET /arrets qui retourne la liste de tous les arrêts (tous les éléments de listeArrets de toutes les lignes, sans doublons). Indice : utilisez un set() Python pour éliminer les doublons, puis convertissez en liste avec list().    
@app.route("/arrets")
def get_arrets():
    arrets = set()
    for ligne in lignes:
        for arret in ligne.get("listeArrets", []):
            arrets.add(arret)
    return jsonify(list(arrets))

# Ajoutez un endpoint GET /stats qui retourne des statistiques : le nombre total de lignes, le nombre total d'arrêts (somme de tous les arrets), et le numéro de la ligne ayant le plus d'arrêts.
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

# Ajoutez un endpoint GET /lignes/recherche?q=Pikine qui filtre les lignes dont le départ ou l'arrivée contient le paramètre q. Indice : utilisez request.args.get("q", "") pour récupérer le paramètre de requête (n'oubliez pas from flask import request).   
from flask import request   
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
