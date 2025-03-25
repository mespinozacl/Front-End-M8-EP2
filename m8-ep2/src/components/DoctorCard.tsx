import React, { useContext, useState } from 'react';
import { DoctorContext } from '../context/DoctorContext';
import { Doctor } from '../objects/Doctor';
import { DoctorModal } from '../components/DoctorModal';

interface DoctorCardProps {
  doctor:Doctor;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const { setDoctor } = useContext(DoctorContext);
  const [showModal, setShowModal] = useState(false); // Local state for modal visibility

  const handleClick = () => {
      setDoctor(doctor);
      setShowModal(true);
  };

  return (
      <div className="card">
          <p>{doctor.id}. {doctor.nombre} y su especialidad es {doctor.especialidad} por {doctor.experiencia} años</p>{/* ... */}
          <button className="btn btn-primary" onClick={handleClick}>Ver Info</button>
          <DoctorModal // Modal is now a child of DoctorCard
              title="Información del Doctor"
              showModal={showModal}
              setShowModal={setShowModal}
          />
      </div>
  );
};

export default DoctorCard;