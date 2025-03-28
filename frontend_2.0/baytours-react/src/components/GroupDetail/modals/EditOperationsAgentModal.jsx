import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditOperationsAgentModal = ({ show, onHide, groupData, onOperationsUpdated }) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    if (show && groupData?.id_group) {
      // Llamada al backend para obtener agentes de operaciones disponibles
      fetch(`${process.env.REACT_APP_API_URL}/operations/get_operations_dispo?id_group=${groupData.id_group}`)
        .then(response => response.json())
        .then(data => {
            const agentsArray = Array.isArray(data) ? data : data.agents;
          setAgents(agentsArray || []);
          // Si hay agente actual, lo seleccionamos por defecto
          if (groupData.id_operations) {
            setSelectedAgent(groupData.id_operations);
          }
        })
        .catch(error => console.error('Error al obtener agentes de operaciones:', error));
    }
  }, [show, groupData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    fetch(`${process.env.REACT_APP_API_URL}/groups/update_operations?id_group=${groupData.id_group}&id_operations=${selectedAgent}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_operations: parseInt(selectedAgent, 10) })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          onOperationsUpdated(data.updated_operations);
          onHide();
        } else {
          alert('Error al actualizar el agente de operaciones.');
        }
      })
      .catch(error => {
        console.error('Error al actualizar el agente de operaciones:', error);
        alert('Error al actualizar el agente de operaciones.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Agente de Operaciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="operationsAgentSelect" className="mb-3">
            <Form.Label>Seleccione el nuevo agente de operaciones</Form.Label>
            <Form.Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {agents.map(agent => (
                <option key={agent.id_operation} value={agent.id_operation}>
                  {agent.name} {agent.surname}
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

export default EditOperationsAgentModal;