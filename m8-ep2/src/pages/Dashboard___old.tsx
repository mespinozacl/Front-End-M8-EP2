import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getSecureData } from "../services/DoctorAPI2";
import { SecureData } from '../objects/SecureData';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [secureData, setSecureData] = useState<SecureData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("user");
      if (!token) {
        setError("No se encontró un token válido. Inicia sesión de nuevo.");
        setIsLoading(false); // Stop loading if no token
        return;
      }

      try {
        const data: SecureData[] | undefined = await getSecureData(token);
        if(data)
        {
        const secureDataObjects = data.map(secureData => new SecureData(secureData));
        setSecureData(secureDataObjects); // No type assertion needed!
        }
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
            setError("Token expirado o inválido. Inicia sesión de nuevo.");
            logout(); 
        } else if (err.message === 'Network Error') {
            setError("Error de red. Inténtalo de nuevo más tarde.");
        } else {
            console.error("Error fetching data:", err); 
            setError("Ocurrió un error al cargar los datos. Inténtalo de nuevo más tarde.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchData();
    }
  }, [user, logout]);

  ///https://dev-to.translate.goog/alexeagleson/how-to-use-indexeddb-to-store-data-for-your-web-application-in-the-browser-1o90?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc
  const indexedDB = window.indexedDB;

  if (!indexedDB) {
    console.log("IndexedDB could not be found in this browser.");
  }

  const request = indexedDB.open("DashboardBD", 1);

  request.onerror = function (event) {
    console.error("An error occurred with IndexedDB");
    console.error(event);
  };

  request.onupgradeneeded = function () {
    const db = request.result;
    const store = db.createObjectStore("secure-data", { keyPath: "id" });
    store.createIndex("info", ["info"], { unique: false });
  };

  request.onsuccess = function () {
    console.log("Database opened successfully");
    const db = request.result;
    const transaction = db.transaction(["secure-data"], "readwrite");
    const store = transaction.objectStore("secure-data");
    const infoIndex = store.index("info");

    const idQuery = store.getAll();
    idQuery.onsuccess = function () {
      console.log('idQuery', idQuery.result);
    };

    if(secureData){
      secureData.forEach(sdobject => {
        store.put(sdobject);
      });
    }

    const infoQuery = infoIndex.getAll(["info"]);

    infoQuery.onsuccess = function () {
      console.log('infoQuery', infoQuery.result);
    };

    transaction.oncomplete = function () {
      db.close();
    };
  };

  return (
    <MainLayout>
      <h1>Dashboard</h1>
      {user?.role === "admin" && (
        <>
          <p>Bienvenido, Administrador. Aquí están los datos protegidos:</p>
          {isLoading && <p>Cargando datos...</p>}
          {!isLoading && error && <p style={{ color: "red" }}>{error}</p>}
          {!isLoading && secureData.length > 0 && (
            <ul>
              {secureData.map((item) => (
                <li key={item.id}>{item.info}</li> // Optional chaining if needed: item?.id, item?.info
              ))}
            </ul>
          )}
          {!isLoading && secureData.length === 0 && !error && <p>No hay datos disponibles.</p>}
        </>
      )}

      {user?.role === "user" && (
        <>
          <p>Bienvenido, Usuario. No tienes acceso a los datos protegidos.</p>
          <p>Consulta con el administrador para más información.</p>
        </>
      )}

      <button onClick={logout}>Cerrar Sesión</button>
    </MainLayout>
  );
};

export default Dashboard;