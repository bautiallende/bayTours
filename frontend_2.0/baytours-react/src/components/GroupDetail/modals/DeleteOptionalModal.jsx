import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const DeleteOptionalModal = ({ show, onHide, clientId, groupId, dayId, optionalData, onOptionalDeleted }) => {
  const [confirmText, setConfirmText] = useState('');
  const expectedText = `Eliminar ${optionalData?.optional_name}`;

  const handleDelete = () => {
    // Enviar solicitud DELETE al backend
    fetch(`${process.env.REACT_APP_API_URL}/optionals_purchase?id_group=${encodeURIComponent(groupId)}&client_id=${encodeURIComponent(clientId)}&id_activity=${encodeURIComponent(optionalData.id_activity)}`, {
      method: 'DELETE'
    })
      .then(r => {
        if (r.ok) {
          onOptionalDeleted(optionalData);
          onHide();
        } else {
          return r.json().then(data => {
            alert('Error al eliminar el opcional: ' + (data.message || 'Error desconocido'));
          });
        }
      })
      .catch(error => {
        console.error('Error al eliminar el opcional:', error);
        alert('Error al eliminar el opcional.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Borrado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Para eliminar la actividad <strong>{optionalData?.optional_name}</strong>, escriba:</p>
        <p className="text-muted">Eliminar {optionalData?.optional_name}</p>
        <Form.Control
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Escribir aquí..."
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={handleDelete} disabled={confirmText.trim() !== expectedText}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteOptionalModal;