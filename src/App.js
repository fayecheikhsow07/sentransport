import { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Footer from './Footer';
import Carte from './Carte';
import Meteo from './Meteo';
import SignalerIncident from './SignalerIncident';
import ListeIncidents from './ListeIncidents';


function App() {
  // États principaux
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);
  const [nombreRecherches, setNombreRecherches] = useState(0);

  // Fonction pour charger toutes les lignes
  function chargerLignes() {
    setChargement(true);
    setErreur(null);
    fetch("http://localhost:5000/lignes")
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur serveur : " + response.status);
        }
        return response.json();
      })
      .then(data => {
        setLignes(data);
        setChargement(false);
      })
      .catch(error => {
        setErreur(error.message);
        setChargement(false);
      });
  }

  // Charger les données au démarrage
  useEffect(() => {
    chargerLignes();
  }, []);

  // Filtrage des lignes
  const lignesFiltrees = lignes.filter(l =>
    l.depart.toLowerCase().includes(recherche.toLowerCase()) ||
    l.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
    l.numero.includes(recherche)
  );

  // Gestion du clic sur une ligne → requête GET /lignes/<id>
function handleClickLigne(ligne) {
  if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
    setLigneSelectionnee(null);
    return;
  }
  setErreur(null);
  fetch(`http://localhost:5000/lignes/${ligne.id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur serveur : " + response.status);
      }
      return response.json();
    })
    .then(data => setLigneSelectionnee(data))
    .catch(err => setErreur(err.message));
}

  // Gestion de la recherche
  function handleRecherche(texte) {
    setRecherche(texte);
    setNombreRecherches(prev => prev + 1);
    if (ligneSelectionnee) {
      setLigneSelectionnee(null);
    }
  }

  // Écran de chargement
  if (chargement) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <p className="message-chargement">Chargement des lignes...</p>
        </main>
      </div>
    );
  }

  // Écran d’erreur
  if (erreur) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <div className="message-erreur">
            <p>Impossible de charger les lignes.</p>
            <p className="erreur-detail">{erreur}</p>
            <p>Vérifiez que le serveur Flask est lancé (python api/app.py).</p>
          </div>
        </main>
      </div>
    );
  }

  // Écran normal
  return (
    <div className="App">
      <Header />
      <main className="contenu">
         <Meteo />
        <p className="nombre-recherches">
          Vous avez effectué {nombreRecherches} recherche(s)
        </p>
        <Recherche valeur={recherche} onChange={handleRecherche} />
        <p className="resultat-recherche">
          {lignesFiltrees.length} ligne{lignesFiltrees.length > 1 ? 's' : ''} trouvée{lignesFiltrees.length > 1 ? 's' : ''}
        </p>

        {lignesFiltrees.length === 0 && (
          <div className="aucun-resultat">Aucune ligne trouvée</div>
        )}

        <button onClick={chargerLignes} className="btn-recharger">
          Recharger
        </button>

        {lignesFiltrees.map(ligne => (
          <LigneBus
            key={ligne.id}
            numero={ligne.numero}
            depart={ligne.depart}
            arrivee={ligne.arrivee}
            arrets={ligne.arrets}
            estSelectionnee={ligneSelectionnee && ligneSelectionnee.id === ligne.id}
            onClick={() => handleClickLigne(ligne)}
          />
        ))}

        {ligneSelectionnee && <DetailLigne ligne={ligneSelectionnee} />}
     <Carte />
     <SignalerIncident /> 
     <ListeIncidents />
      </main>
      <Footer />
    </div>
  );
}

export default App;
