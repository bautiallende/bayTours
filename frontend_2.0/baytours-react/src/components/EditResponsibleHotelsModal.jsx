import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditResponsibleHotelsModal = ({ show, onHide, groupData, onResponsibleUpdated }) => {
  const [selectedResponsible, setSelectedResponsible] = useState('');
  const [responsibles, setResponsibles] = useState([]);

  useEffect(() => {
    if (show && groupData?.id_group) {
      // Llamada al backend para obtener responsables de hoteles disponibles
      fetch(`${process.env.REACT_APP_API_URL}/responsable_hotels/get_responsable_hotels?id_group=${groupData.id_group}`)
        .then(response => response.json())
        .then(data => {
            const responsiblesArray = Array.isArray(data) ? data : data.responsibles;
          setResponsibles(responsiblesArray || []);
          if (groupData.id_responsible_hotels) {
            setSelectedResponsible(groupData.id_responsible_hotels);
          }
        })
        .catch(error => console.error('Error al obtener responsables de hoteles:', error));
    }
  }, [show, groupData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedResponsible) return;
    fetch(`${process.env.REACT_APP_API_URL}/groups/update_responsable_hotels?id_group=${groupData.id_group}&id_responsible_hotels=${selectedResponsible}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_responsible_hotels: parseInt(selectedResponsible, 10) })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          onResponsibleUpdated(data.updated_responsable_hotels);
          onHide();
        } else {
          alert('Error al actualizar el responsable de hoteles.');
        }
      })
      .catch(error => {
        console.error('Error al actualizar el responsable de hoteles:', error);
        alert('Error al actualizar el responsable de hoteles.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Responsable de Hoteles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="responsibleHotelsSelect" className="mb-3">
            <Form.Label>Seleccione el nuevo responsable de hoteles</Form.Label>
            <Form.Select
              value={selectedResponsible}
              onChange={(e) => setSelectedResponsible(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {responsibles.map(r => (
                <option key={r.id_responsible_hotels} value={r.id_responsible_hotels}>
                  {r.name} {r.surname}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button variant="primary" type="submit">Guardar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditResponsibleHotelsModal;