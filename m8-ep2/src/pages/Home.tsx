import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define el tipo para la ubicación
interface Location {
  latitude: number;
  longitude: number;
}

const Home = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null); // Define el tipo como Location o null
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      const newMap = L.map("map").setView([location.latitude, location.longitude], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(newMap);
      L.marker([location.latitude, location.longitude]).addTo(newMap);
      setMap(newMap);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [location]);

  return (
    <MainLayout>
      <h1>Bienvenido a SafeApp</h1>
      {!user && <p><a href="/login">Iniciar Sesión</a></p>}
      {user && <p>Estás autenticado como <strong>{user.role}</strong>.</p>}

      {loading && <p>Obteniendo ubicación...</p>}

      {location && (
        <div>
          <h2>Tu ubicación:</h2>
          <p>Latitud: {location.latitude}</p>
          <p>Longitud: {location.longitude}</p>
          <div id="map" style={{ height: "300px", width: "100%" }}></div>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </MainLayout>
  );
};

export default Home;