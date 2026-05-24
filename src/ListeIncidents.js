import { useState, useEffect } from 'react';

function ListeIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/incidents")
      .then(r => {
        if (!r.ok) throw new Error("Erreur serveur : " + r.status);
        return r.json();
      })
      .then(data => setIncidents(data))
      .catch(err => setErreur(err.message));
  }, []);

  if (erreur) {
    return <p className="erreur-detail">Erreur : {erreur}</p>;
  }

  return (
    <div className="liste-incidents">
      <h2>Incidents signalés</h2>
      {incidents.length === 0 ? (
        <p>Aucun incident pour le moment.</p>
      ) : (
        <ul>
          {incidents.map(i => (
            <li key={i.id}>
              Ligne {i.ligne} — {i.description} ({i.lieu})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListeIncidents;
