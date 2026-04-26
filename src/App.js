import './App.css';
import Header from './Header';
import Footer from './Footer';
import Statistique from './Statistique';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="contenu">
        <p>Bienvenue ! Cette application vous aide à trouver
        votre ligne de bus à Dakar.</p>

        <div className="stats">
          <Statistique chiffre="10" libelle="Lignes de bus" />
          <Statistique chiffre="150" libelle="Arrêts" />
          <Statistique chiffre="50k" libelle="Usagers quotidiens" />
        </div>
      </main>
      <Footer />
    </div>
  );
}



export default App;


