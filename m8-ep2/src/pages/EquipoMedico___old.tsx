import { useState, useEffect, useContext } from 'react';
import MainLayout from "../layouts/MainLayout";
import { fetchDoctors } from '../services/DoctorAPI';
import DoctorList from '../components/DoctorList';
import DoctorContextProvider  from '../context/DoctorContextProvider';
import { DoctorContext }  from '../context/DoctorContext';
import { Doctor } from '../objects/Doctor';
import { useDebounce } from 'use-debounce';

export default function EquipoMedico() {
  const [isLoading, setIsLoading] = useState(true);
  const { doctors, setDoctors } = useContext(DoctorContext);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  let searchTermLocal = localStorage.getItem('searchTerm');
  const [searchTerm, setSearchTerm] = useState(searchTermLocal ? searchTermLocal:'');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300); // Debounce search term

  const [initialLoad, setInitialLoad] = useState(false); // Flag for initial load

  const filterBySpec = (term: string) => {
    setSearchTerm(term);
  };

  useEffect(() => {
    if (!doctors || !debouncedSearchTerm) {
        setFilteredDoctors(doctors);
        return;
    }

    const lowerCaseTerm = debouncedSearchTerm.toLowerCase()
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
        .replace(/ó/g, 'o').replace(/ú/g, 'u');

    const filtered = doctors.filter((doctor) =>
        doctor.especialidad.toLowerCase()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ú/g, 'u')
            .includes(lowerCaseTerm)
    );
    setFilteredDoctors(filtered);
  }, [doctors, debouncedSearchTerm]);

  const getAllDoctors = async () => {
    setIsLoading(true);
    try {
        const data = await fetchDoctors();

        if (data) {
            const doctorObjects = data.map(doctor => new Doctor(doctor));
            setDoctors(doctorObjects);
            setFilteredDoctors(doctorObjects);
        } else {
            console.warn("fetchDoctors returned no data.");
            setDoctors([]);
            setFilteredDoctors([]);
            alert("No se encontraron médicos.");
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
        alert('Error al obtener los medicos'); // Consider a better error message

    } finally {
        setIsLoading(false);
        setInitialLoad(true); // Set initial load to true after fetching
    }
};

useEffect(() => {
  if (!initialLoad) { // Check if it is the initial load
    getAllDoctors();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialLoad]); // Add initialLoad to the dependency array



///https://dev-to.translate.goog/alexeagleson/how-to-use-indexeddb-to-store-data-for-your-web-application-in-the-browser-1o90?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc
const indexedDB = window.indexedDB;

if (!indexedDB) {
  console.log("IndexedDB could not be found in this browser.");
}

const request = indexedDB.open("EquipoMedicoBD", 1);

request.onerror = function (event) {
  console.error("An error occurred with IndexedDB");
  console.error(event);
};

request.onupgradeneeded = function () {
  const db = request.result;
  const store = db.createObjectStore("doctores", { keyPath: "id" });
  store.createIndex("especialidades", ["especialidad"], { unique: false });
  store.createIndex("esp_exp", ["especialidad", "experiencia"], {unique: false,  }); 
};

request.onsuccess = function () {
  console.log("Database opened successfully");
  const db = request.result;
  const transaction = db.transaction(["doctores"], "readwrite");
  const store = transaction.objectStore("doctores");
  const especIndex = store.index("especialidades");
  const especexperIndex = store.index("esp_exp");
  
  doctors.forEach(doctor => {
    store.put(doctor);
  });

  const idQuery = store.getAll();
  const especQuery = especIndex.getAll(["Goma"]);
  const especexperQuery = especexperIndex.get(["Goma", "1"]);

  idQuery.onsuccess = function () {
    console.log('idQuery', idQuery.result);
  };

  especQuery.onsuccess = function () {
    console.log('especQuery', especQuery.result);
  };

  especexperQuery.onsuccess = function () {
    console.log('especexperQuery', especexperQuery.result);
  };

  transaction.oncomplete = function () {
    db.close();
  };
};

return (
  <DoctorContextProvider> {/* Wrap with the Provider */}
      <MainLayout>
          <main>
              <section className="medical-team-section">
                  <h1>Nuestro Gran Equipo</h1>
                  <p className="fs-4">
                      Somos profesionales del mejor país de Chile.
                      Somos excelentes carniceros,
                      formados en las mejores carnicerias del mundo mundial.
                  </p>
              </section>
              <section>
                  <h2>Equipo de Carniceros</h2>
                  <button className="btn btn-primary" onClick={getAllDoctors}>
                      Recargar Lista
                  </button>
                  <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Filtrar por especialidad"
                      value={searchTerm}
                      onChange={(e) => {filterBySpec(e.target.value); localStorage.setItem('searchTerm', e.target.value);} }
                  />
                  {isLoading ? <p>Cargando...</p> : <DoctorList doctors={filteredDoctors} />}
              </section>
          </main>
      </MainLayout>
  </DoctorContextProvider>
);

}
