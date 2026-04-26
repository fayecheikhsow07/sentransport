import './Statistique.css';

function Statistique({ chiffre, libelle }) {
  return (
    <div className="statistique">
      <h2>{chiffre}</h2>
      <p>{libelle}</p>
    </div>
  );
}

export default Statistique;
