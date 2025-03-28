import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditAssistantModal = ({ show, onHide, groupData, onAssistantUpdated }) => {
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [assistants, setAssistants] = useState([]);

  useEffect(() => {
    if (show && groupData?.id_group) {
      // Llamada al backend para obtener asistentes disponibles
      fetch(`${process.env.REACT_APP_API_URL}/assistants/get_assistants?id_group=${groupData.id_group}`)
        .then(response => response.json())
        .then(data => {
            const assistantsArray = Array.isArray(data) ? data : data.assistants;
          setAssistants(assistantsArray || []);
          if (groupData.id_assistant) {
            setSelectedAssistant(groupData.id_assistant);
          }
        })
        .catch(error => console.error('Error al obtener asistentes:', error));
    }
  }, [show, groupData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssistant) return;
    fetch(`${process.env.REACT_APP_API_URL}/groups/update_assistante?id_group=${groupData.id_group}&id_assistant=${selectedAssistant}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_assistant: parseInt(selectedAssistant, 10) })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          onAssistantUpdated(data.updated_assistant);
          onHide();
        } else {
          alert('Error al actualizar el asistente.');
        }
      })
      .catch(error => {
        console.error('Error al actualizar el asistente:', error);
        alert('Error al actualizar el asistente.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Asistente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="assistantSelect" className="mb-3">
            <Form.Label>Seleccione el nuevo asistente</Form.Label>
            <Form.Select
              value={selectedAssistant}
              onChange={(e) => setSelectedAssistant(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {assistants.map(assistant => (
                <option key={assistant.id_assistant} value={assistant.id_assistant}>
                  {assistant.name} {assistant.surname}
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

export default EditAssistantModal;