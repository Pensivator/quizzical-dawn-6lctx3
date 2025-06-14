import { useState } from "react";
import jsPDF from "jspdf";

const initialStructure = {
  Presse: { Engel: {}, Kraussmaffei: {}, Haitian: {}, Arburg: {} },
  Robot: { Sepro: { Mouvements: ["Général"] } },
};

const ensemblesCommun = {
  "Unité de plastification": [
    "Dosage",
    "Fourreau",
    "Collier chauffant",
    "Vis sans fin",
    "Porte buse",
    "Buse",
  ],
  "Unité d'éjection": [],
  "Unité de fermeture": [
    "Fonction ouverture",
    "Fonction fermeture",
    "Fonction verrouillage",
  ],
  "Fonction noyau": [],
  "Carter de sécurité": [],
  "Groupe hydraulique": ["Groupe moto-pompe", "Partie accu"],
  "Armoire électrique et pupitre": [],
  "Graissage centralisé": [],
  "Réseau d'eau": [],
  "Réseau d'air": [],
};

for (const marque of ["Engel", "Kraussmaffei", "Haitian", "Arburg"]) {
  initialStructure.Presse[marque] = JSON.parse(JSON.stringify(ensemblesCommun));
}

const initialPannes = {};

export default function App() {
  const [structure] = useState(initialStructure);
  const [pannes, setPannes] = useState(() => {
    const saved = localStorage.getItem("pannesDB");
    return saved ? JSON.parse(saved) : initialPannes;
  });

  const [page, setPage] = useState("accueil");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [ensemble, setEnsemble] = useState("");
  const [sousEnsemble, setSousEnsemble] = useState("");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    machineId: "",
    symptome: "",
    verification: "",
    cause: "",
    solution: "",
    images: [],
  });

  const key = "${type} > ${brand} > ${ensemble} > ${sousEnsemble}";

  const addPanne = () => {
    if (!formData.symptome || !formData.machineId) return;
    const updated = { ...pannes };
    if (!updated[key]) updated[key] = [];
    updated[key].push({ ...formData });
    setPannes(updated);
    localStorage.setItem("pannesDB", JSON.stringify(updated));
    setFormData({
      machineId: "",
      symptome: "",
      verification: "",
      cause: "",
      solution: "",
      images: [],
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const exportToPDF = (panne) => {
    const doc = new jsPDF();
    doc.text("Machine ID: ${panne.machineId}", 10, 10);
    doc.text("Symptôme: ${panne.symptome}", 10, 20);
    doc.text("Vérifications: ${panne.verification}", 10, 30);
    doc.text("Cause: ${panne.cause}", 10, 40);
    doc.text("Solution: ${panne.solution}", 10, 50);
    if (panne.images && panne.images[0]) {
      doc.addImage(panne.images[0], "JPEG", 10, 60, 80, 60);
    }
    doc.save("panne_${panne.machineId}.pdf");
  };

  const backgroundStyle = {
    backgroundImage: "url('/aptar-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    color: "white",
    backdropFilter: "brightness(0.85)",
  };

  const boutonRetour = (action) => (
    <div style={{ position: "fixed", bottom: 10, left: 10 }}>
      {" "}
      <button onClick={action}>Retour</button>{" "}
    </div>
  );

  return (
    <div style={backgroundStyle}>
      {" "}
      {page === "accueil" && (
        <div>
          {" "}
          <h1>Bienvenue sur l'assistant de diagnostic</h1>{" "}
          <button onClick={() => setPage("diagnostic")}>
            Accéder à l'aide au dépannage
          </button>{" "}
          <button onClick={() => setPage("toutes")}>
            Voir toutes les fiches
          </button>{" "}
        </div>
      )}
      {page === "toutes" && (
        <div>
          <h2>Toutes les pannes répertoriées</h2>
          {Object.entries(pannes).map(([key, liste]) => (
            <div key={key} style={{ marginBottom: "2rem" }}>
              <h3>{key}</h3>
              {liste.map((panne, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: "1rem",
                    margin: "1rem 0",
                  }}
                >
                  <p>
                    <strong>Machine ID:</strong> {panne.machineId}
                  </p>
                  <p>
                    <strong>Symptôme:</strong> {panne.symptome}
                  </p>
                  <p>
                    <strong>Vérifications:</strong> {panne.verification}
                  </p>
                  <p>
                    <strong>Cause:</strong> {panne.cause}
                  </p>
                  <p>
                    <strong>Solution:</strong> {panne.solution}
                  </p>
                  {panne.images &&
                    panne.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="panne"
                        style={{ maxWidth: "200px", margin: "5px" }}
                      />
                    ))}
                  <button onClick={() => exportToPDF(panne)}>
                    Exporter en PDF
                  </button>
                </div>
              ))}
            </div>
          ))}
          {boutonRetour(() => setPage("accueil"))}
        </div>
      )}
      {page === "diagnostic" && (
        <div>
          <h2>Aide au dépannage</h2>

          {!type &&
            Object.keys(structure).map((t) => (
              <button key={t} onClick={() => setType(t)}>
                {t}
              </button>
            ))}

          {type && !brand && (
            <>
              {Object.keys(structure[type]).map((b) => (
                <button key={b} onClick={() => setBrand(b)}>
                  {b}
                </button>
              ))}
              {boutonRetour(() => setType(""))}
            </>
          )}

          {type && brand && !ensemble && (
            <>
              {Object.keys(structure[type][brand]).map((ens) => (
                <button key={ens} onClick={() => setEnsemble(ens)}>
                  {ens}
                </button>
              ))}
              {boutonRetour(() => setBrand(""))}
            </>
          )}

          {type && brand && ensemble && !sousEnsemble && (
            <>
              {structure[type][brand][ensemble]?.length > 0 ? (
                structure[type][brand][ensemble].map((sous) => (
                  <button key={sous} onClick={() => setSousEnsemble(sous)}>
                    {sous}
                  </button>
                ))
              ) : (
                <div>
                  <h3>Pas de sous-ensemble pour {ensemble}</h3>
                  <button onClick={() => setSousEnsemble("(général)")}>
                    Ajouter une panne générale
                  </button>
                </div>
              )}
              {boutonRetour(() => setEnsemble(""))}
            </>
          )}

          {type && brand && ensemble && sousEnsemble && (
            <div>
              <h3>Pannes - {sousEnsemble}</h3>
              <input
                placeholder="Recherche..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {(pannes[key] || [])
                .filter(
                  (p) =>
                    p.symptome.toLowerCase().includes(search.toLowerCase()) ||
                    p.cause.toLowerCase().includes(search.toLowerCase())
                )
                .map((panne, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      padding: "1rem",
                      margin: "1rem 0",
                    }}
                  >
                    <p>
                      <strong>Machine ID:</strong> {panne.machineId}
                    </p>
                    <p>
                      <strong>Symptôme:</strong> {panne.symptome}
                    </p>
                    <p>
                      <strong>Vérifications:</strong> {panne.verification}
                    </p>
                    <p>
                      <strong>Cause:</strong> {panne.cause}
                    </p>
                    <p>
                      <strong>Solution:</strong> {panne.solution}
                    </p>
                    {panne.images &&
                      panne.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="panne"
                          style={{ maxWidth: "200px", margin: "5px" }}
                        />
                      ))}
                    <button onClick={() => exportToPDF(panne)}>
                      Exporter en PDF
                    </button>
                    <button
                      onClick={() => {
                        const confirmDelete = window.confirm(
                          "Confirmer la suppression de cette panne ?"
                        );
                        if (!confirmDelete) return;
                        const updated = { ...pannes };
                        updated[key] = updated[key].filter(
                          (_, i) => i !== index
                        );
                        setPannes(updated);
                        localStorage.setItem(
                          "pannesDB",
                          JSON.stringify(updated)
                        );
                      }}
                    >
                      Supprimer la panne
                    </button>
                  </div>
                ))}

              <h4>Ajouter une panne :</h4>
              <input
                placeholder="ID Machine"
                value={formData.machineId}
                onChange={(e) =>
                  setFormData({ ...formData, machineId: e.target.value })
                }
              />
              <br />
              <input
                placeholder="Symptôme"
                value={formData.symptome}
                onChange={(e) =>
                  setFormData({ ...formData, symptome: e.target.value })
                }
              />
              <br />
              <input
                placeholder="Vérifications"
                value={formData.verification}
                onChange={(e) =>
                  setFormData({ ...formData, verification: e.target.value })
                }
              />
              <br />
              <input
                placeholder="Cause"
                value={formData.cause}
                onChange={(e) =>
                  setFormData({ ...formData, cause: e.target.value })
                }
              />
              <br />
              <input
                placeholder="Solution"
                value={formData.solution}
                onChange={(e) =>
                  setFormData({ ...formData, solution: e.target.value })
                }
              />
              <br />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
              <br />
              <button onClick={addPanne}>Ajouter la panne</button>
              {boutonRetour(() => setSousEnsemble(""))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
