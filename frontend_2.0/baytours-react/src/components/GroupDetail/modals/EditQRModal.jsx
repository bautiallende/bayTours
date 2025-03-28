import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditQRModal = ({ show, onHide, groupData, onQRUpdated }) => {
  const [qrState, setQrState] = useState(false);

  useEffect(() => {
    if (show) {
      setQrState(groupData.QR);
    }
  }, [show, groupData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_URL}/groups/update_qr?id_group=${groupData.id_group}&has_qr=${qrState}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ has_qr: qrState })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          onQRUpdated(qrState);
          onHide();
        } else {
          console.error('Error al actualizar el QR:', data.message);
          alert('Error al actualizar el QR.');
        }
      })
      .catch(error => {
        console.error('Error al actualizar el QR:', error);
        alert('Error al actualizar el QR.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Estado del QR</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Check 
            type="switch"
            id="qrSwitch"
            label="QR Enviado"
            checked={qrState}
            onChange={(e) => setQrState(e.target.checked)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button variant="primary" type="submit">Guardar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditQRModal;