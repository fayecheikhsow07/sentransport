import './Recherche.css';

function Recherche({ valeur, onChange }) {
  return (
    <div className="recherche">

      <div className="recherche-barre">
        <input
          type="text"
          className="recherche-input"
          placeholder="Rechercher une ligne (départ, arrivée, numéro)..."
          value={valeur}
          onChange={e => onChange(e.target.value)}
        />

        <button
          className="btn-effacer"
          onClick={() => onChange("")}
        >
          Effacer
        </button>
      </div>

    </div>
  );
}

export default Recherche;