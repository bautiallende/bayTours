import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const OptionModal = ({
  show,
  onHide,
  client,
  dayId,
  city,
  groupId,
  cityDays,
  optional, // nuevo prop opcional
  onAdd,
  onEdit,
  onDelete,
}) => {
  const handleDeleteClick = () => {
    // Aquí se asume que "client", "dayId", "city", "cityDays" y el opcional seleccionado
    // ya se encuentran en las props o en algún estado del modal.
    // Por ejemplo, si dentro del modal el usuario ha seleccionado un opcional (almacenado en "selectedOptional")
    // se puede hacer:
    if (!client || !dayId || !city || !cityDays) {
      console.error('Faltan datos para eliminar el opcional.');
      return;
    }
    // Suponiendo que tienes un estado local "selectedOptional" en OptionModal:
    onDelete(client, dayId, { city }, cityDays);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Opciones para {city}
          {optional && optional.optional_name && (
            <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#666' }}>
              - {optional.optional_name}
            </span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {optional
            ? `¿Qué acción desea realizar para la actividad "${optional.optional_name}"?`
            : 'Seleccione una acción para el día seleccionado.'}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => { onAdd(); onHide(); }}>
          Agregar
        </Button>
        <Button variant="primary" onClick={() => { onEdit(); onHide(); }}>
          Editar
        </Button>
        <Button variant="danger" onClick={(handleDeleteClick) => { onDelete(); onHide(); }}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OptionModal;