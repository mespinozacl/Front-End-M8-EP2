import { useState, useEffect, useContext } from 'react';
import MainLayout from "../layouts/MainLayout";
import { fetchDoctors } from '../services/DoctorAPI';
import DoctorList from '../components/DoctorList';
import DoctorContextProvider from '../context/DoctorContextProvider';
import { DoctorContext } from '../context/DoctorContext';
import { Doctor } from '../objects/Doctor';
import { useDebounce } from 'use-debounce';

export default function EquipoMedico() {
    const [isLoading, setIsLoading] = useState(true);
    const { doctors, setDoctors } = useContext(DoctorContext);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

    let searchTermLocal = localStorage.getItem('searchTerm');
    const [searchTerm, setSearchTerm] = useState(searchTermLocal ? searchTermLocal : '');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    const [initialLoad, setInitialLoad] = useState(false);

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
            const db = await openDatabase();
            const storedDoctors = await getStoredDoctors(db);

            if (storedDoctors && storedDoctors.length > 0) {
                setDoctors(storedDoctors);
                setFilteredDoctors(storedDoctors);
                setIsLoading(false);
                if (navigator.onLine) {
                    fetchOnlineDoctors(db);
                }
                return;
            }

            if (navigator.onLine) {
                fetchOnlineDoctors(db);
            } else {
                setIsLoading(false);
                alert("No hay conexión a internet y no hay datos locales disponibles.");
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            alert('Error al obtener los medicos');
            setIsLoading(false);
        } finally {
            setInitialLoad(true);
        }
    };

    const fetchOnlineDoctors = async (db: IDBDatabase) => {
        try {
            const data = await fetchDoctors();
            if (data) {
                const doctorObjects = data.map(doctor => new Doctor(doctor));
                setDoctors(doctorObjects);
                setFilteredDoctors(doctorObjects);
                await storeDoctors(db, doctorObjects);
            } else {
                console.warn("fetchDoctors returned no data.");
                alert("No se encontraron médicos.");
            }
        } catch (error) {
            console.error('Error fetching online doctors:', error);
            alert('Error al obtener los medicos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!initialLoad) {
            getAllDoctors();
        }
    }, [initialLoad]);

    const openDatabase = (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("EquipoMedicoBD", 1);
            request.onerror = (event) => reject(event);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = () => {
                const db = request.result;
                const store = db.createObjectStore("doctores", { keyPath: "id" });
                store.createIndex("especialidades", ["especialidad"], { unique: false });
                store.createIndex("esp_exp", ["especialidad", "experiencia"], { unique: false });
            };
        });
    };

    const getStoredDoctors = (db: IDBDatabase): Promise<Doctor[]> => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["doctores"], "readonly");
            const store = transaction.objectStore("doctores");
            const request = store.getAll();
            request.onerror = (event) => reject(event);
            request.onsuccess = () => resolve(request.result);
        });
    };

    const storeDoctors = (db: IDBDatabase, doctors: Doctor[]): Promise<void> => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["doctores"], "readwrite");
            const store = transaction.objectStore("doctores");
            doctors.forEach(doctor => store.put(doctor));
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event);
        });
    };

    return (
        <DoctorContextProvider>
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
                            onChange={(e) => { filterBySpec(e.target.value); localStorage.setItem('searchTerm', e.target.value); }}
                        />
                        {isLoading ? <p>Cargando...</p> : <DoctorList doctors={filteredDoctors} />}
                    </section>
                </main>
            </MainLayout>
        </DoctorContextProvider>
    );
}