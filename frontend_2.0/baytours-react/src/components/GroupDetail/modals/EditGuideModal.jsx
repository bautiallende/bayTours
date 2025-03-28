import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditGuideModal = ({ show, onHide, groupData, onGuideUpdated }) => {
  // Estado para almacenar el guía seleccionado
  const [selectedGuide, setSelectedGuide] = useState('');

  // Estado para la lista de guías disponibles (se cargarán cuando se abra el modal)
  const [availableGuides, setAvailableGuides] = useState([]);

  // Función para convertir fechas al formato adecuado
  const convertToISODate = (dateStr) => {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}T${timePart}:00`);
  };

  // Cuando el modal se abre, carga la lista de guías (usando fetch)
  useEffect(() => {
    if (show) {
      // Aquí llamamos al endpoint del backend para obtener los guías disponibles.
      // Se pueden pasar parámetros como startingDate y endingDate que se extraigan de groupData.

      const startingDate = convertToISODate(groupData.start_date); // Ajusta según corresponda
      const endingDate = convertToISODate(groupData.end_date);

      // Formatea las fechas a 'YYYY-MM-DD'
      const formattedStartingDate = startingDate.toISOString().split('T')[0];
      const formattedEndingDate = endingDate.toISOString().split('T')[0];

      fetch(`${process.env.REACT_APP_API_URL}/guides/get_group_dispo?id_group=${groupData.id_group}&starting_date=${formattedStartingDate}&ending_date=${formattedEndingDate}`)
        .then(response => response.json())
        .then(data => {
          if (data.available_guides) {
            setAvailableGuides(data.available_guides);
            // Si groupData tiene guía actual, la seleccionamos por defecto
            if (data.current_guide) {
              setSelectedGuide(data.current_guide.id);
            }
          } else {
            setAvailableGuides([]);
          }
        })
        .catch(error => console.error('Error al obtener los guías disponibles:', error));
    }
  }, [show, groupData]);

  // Función para enviar la actualización
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedGuide) return;
    // Enviar la actualización al backend
    fetch(`${process.env.REACT_APP_API_URL}/groups/update_guide?id_group=${groupData.id_group}&id_guide=${parseInt(selectedGuide, 10)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guide_id: parseInt(selectedGuide, 10) })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Notificar al componente padre con el nuevo guía
          onGuideUpdated(data.updated_guide);
          onHide();
        } else {
          console.error('Error al actualizar el guía:', data.message);
          alert('Error al actualizar el guía.');
        }
      })
      .catch(error => {
        console.error('Error al actualizar el guía:', error);
        alert('Error al actualizar el guía.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Guía</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="guideSelect" className="mb-3">
            <Form.Label>Seleccione el nuevo guía</Form.Label>
            <Form.Select
              value={selectedGuide}
              onChange={(e) => setSelectedGuide(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {availableGuides.map((guide) => (
                <option key={guide.id} value={guide.id}>
                  {guide.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditGuideModal;