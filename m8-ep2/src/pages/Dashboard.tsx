import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getSecureData } from "../services/DoctorAPI2";
import { SecureData } from '../objects/SecureData';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [secureData, setSecureData] = useState<SecureData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const db = await openDatabase();
        const storedData = await getStoredData(db);

        if (storedData && storedData.length > 0) {
          setSecureData(storedData);
          setIsLoading(false);
          if (navigator.onLine) {
            fetchOnlineData(db); // Attempt to update if online
          }
          return;
        }

        if (user?.role === "admin" && navigator.onLine) {
          fetchOnlineData(db);
        } else {
          setIsLoading(false);
          if(!navigator.onLine){
            setError("No hay conexión a internet y no hay datos locales disponibles.");
          } else{
            setError("No hay datos disponibles.");
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Ocurrió un error al cargar los datos.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, logout]);

  const fetchOnlineData = async (db: IDBDatabase) => {
    const token = localStorage.getItem("user");
    if (!token) {
      setError("No se encontró un token válido. Inicia sesión de nuevo.");
      setIsLoading(false);
      return;
    }

    try {
      const apiData = await getSecureData(token);
      if (apiData) {
        const secureDataObjects = apiData.map(secureData => new SecureData(secureData));
        setSecureData(secureDataObjects);
        await storeData(db, secureDataObjects);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError("Token expirado o inválido. Inicia sesión de nuevo.");
        logout();
      } else if (err.message === 'Network Error') {
        setError("Error de red. Los datos locales podrían estar desactualizados.");
      } else {
        console.error("Error fetching data:", err);
        setError("Ocurrió un error al cargar los datos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DashboardBD", 1);
      request.onerror = (event) => reject(event);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        const store = db.createObjectStore("secure-data", { keyPath: "id" });
        store.createIndex("info", ["info"], { unique: false });
      };
    });
  };

  const getStoredData = (db: IDBDatabase): Promise<SecureData[]> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["secure-data"], "readonly");
      const store = transaction.objectStore("secure-data");
      const request = store.getAll();
      request.onerror = (event) => reject(event);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const storeData = (db: IDBDatabase, data: SecureData[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["secure-data"], "readwrite");
      const store = transaction.objectStore("secure-data");
      data.forEach(item => store.put(item));
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event);
    });
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
                <li key={item.id}>{item.info}</li>
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