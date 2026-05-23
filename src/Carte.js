import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

// Corriger les icônes Leaflet (bug webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icône spéciale pour l’arrêt le plus proche
const iconeProche = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Calculer la distance entre 2 points GPS (km)
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Bouton pour centrer la carte sur l’utilisateur
function BoutonCentrer({ position }) {
  const map = useMap();

  function centrer() {
    if (position) map.setView(position, 15);
  }

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control">
        <button onClick={centrer} className="btn-centrer">
          📍 Centrer sur moi
        </button>
      </div>
    </div>
  );
}

function Carte() {
  const [arrets, setArrets] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [arretsProches, setArretsProches] = useState([]);

  const DAKAR = [14.6928, -17.4467];

  // Charger les arrêts depuis Flask
  useEffect(() => {
    fetch('http://localhost:5000/arrets')
      .then(r => r.json())
      .then(data => setArrets(data))
      .catch(err => console.error('Erreur arrets :', err));
  }, []);

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setPositionUtilisateur([
            pos.coords.latitude,
            pos.coords.longitude,
          ]);
        },
        () => console.log('Géolocalisation refusée')
      );
    }
  }, []);

  // Trouver les 3 arrêts les plus proches
  useEffect(() => {
    if (positionUtilisateur && arrets.length > 0) {
      const avecDistance = arrets.map(a => ({
        ...a,
        distance: calculerDistance(
          positionUtilisateur[0], positionUtilisateur[1],
          a.lat, a.lon
        )
      }));
      const tries = avecDistance.sort((a, b) => a.distance - b.distance);
      setArretsProches(tries.slice(0, 3));
    }
  }, [positionUtilisateur, arrets]);

  return (
    <div className="carte-container">
      <h2 className="carte-titre">Carte des arrêts</h2>

      {arretsProches.length > 0 && (
        <div className="arrets-proches">
          <p className="arret-proche-titre">Les 3 arrêts les plus proches :</p>
          {arretsProches.map((a, i) => (
            <p key={a.id} className="arret-proche">
              {i + 1}. <strong>{a.nom}</strong> — {a.distance.toFixed(1)} km
            </p>
          ))}
        </div>
      )}

      <MapContainer center={DAKAR} zoom={13} className="carte">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />    

        {arrets.map(a => (
          <Marker 
            key={a.id} 
            position={[a.lat, a.lon]}
            {...(arretsProches.length > 0 && arretsProches[0].id === a.id ? { icon: iconeProche } : {})}
          >
            <Popup>
              <strong>{a.nom}</strong>
              <br />
              Lignes : {a.lignes.join(', ')}
            </Popup>
          </Marker>
        ))}

        {positionUtilisateur && (
          <Marker position={positionUtilisateur} icon={iconeProche}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
        )}

        <BoutonCentrer position={positionUtilisateur} />
      </MapContainer>
    </div>
  );
}

export default Carte;
