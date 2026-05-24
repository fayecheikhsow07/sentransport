import { useState, useEffect } from 'react';
import './Meteo.css';

function Meteo() {
  const [meteo, setMeteo] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [previsions, setPrevisions] = useState([]);

useEffect(() => {
  const API_KEY = process.env.REACT_APP_OWM_KEY;
  if (!API_KEY) {
    setErreur("Clé API manquante (.env)");
    return;
  }

  // Météo actuelle
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dakar&appid=${API_KEY}&units=metric&lang=fr`)
    .then(r => r.json())
    .then(data => {
      setMeteo({
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        condition: data.weather[0].main,
        humidite: data.main.humidity,
        icone: data.weather[0].icon,
      });
    })
    .catch(err => setErreur(err.message));

  // Prévisions
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Dakar&appid=${API_KEY}&units=metric&lang=fr`)
    .then(r => r.json())
    .then(data => {
      const jours = data.list.filter((_, idx) => idx % 8 === 0).slice(1, 4);
      setPrevisions(jours);
    })
    .catch(err => setErreur(err.message));
}, []);


  function getAlerte(condition) {
    if (condition === "Rain" || condition === "Drizzle") {
      return { message: "Pluie détectée - risque de retards", classe: "alerte-pluie" };
    }
    if (condition === "Thunderstorm") {
      return { message: "Orage en cours - soyez prudents", classe: "alerte-orage" };
    }
    return null;
  }

  if (erreur) {
    return (
      <div className="meteo meteo-erreur">
        <p>Météo indisponible</p>
        <p className="meteo-detail">{erreur}</p>
      </div>
    );
  }

  if (!meteo) {
    return <div className="meteo">Chargement météo...</div>;
  }

  const alerte = getAlerte(meteo.condition);

  return (
  <div className="meteo">
    <div className="meteo-info">
      <img
        src={`https://openweathermap.org/img/wn/${meteo.icone}@2x.png`}
        alt={meteo.description}
        className="meteo-icone"
      />
      <div>
        <span className="meteo-temp">{meteo.temperature}°C</span>
        <span className="meteo-desc">{meteo.description}</span>
      </div>
      <span className="meteo-humidite">Humidité : {meteo.humidite}%</span>
    </div>

    {alerte && (
      <div className={`meteo-alerte ${alerte.classe}`}>
        {alerte.message}
      </div>
    )}

    {/* 👉 Ajoute ton bloc prévisions ici */}
    <div className="meteo-previsions">
      <h3>Prévisions</h3>
      {previsions.map((p, idx) => (
        <div key={idx}>
          {new Date(p.dt * 1000).toLocaleDateString("fr-FR")} :
          {Math.round(p.main.temp)}°C — {p.weather[0].description}
        </div>
      ))}
    </div>
  </div>
);

}

export default Meteo;
