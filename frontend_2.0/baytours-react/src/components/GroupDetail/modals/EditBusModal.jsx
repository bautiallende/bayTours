import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditBusModal = ({ show, onHide, groupData, onBusUpdated }) => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [busCode, setBusCode] = useState('');
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    if (show) {
      // Llamada al backend para obtener la lista de compañías de buses
      fetch(`${process.env.REACT_APP_API_URL}/transports/companys`)
        .then(response => response.json())
        .then(data => {
          // Comprueba si data es un array o un objeto que contiene el array
          const companiesArray = Array.isArray(data) ? data : data.companies;
          setCompanies(companiesArray || []);
          // Si groupData tiene compañía actual, la seleccionamos
          if (groupData.bus_company_id) {
            setSelectedCompany(groupData.bus_company_id);
          }
          // Buscode, si existe
          setBusCode(groupData.bus_code || '');
        })
        .catch(error => console.error('Error al obtener compañías de buses:', error));
    }
  }, [show, groupData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCompany || !busCode) {
      alert('Debe seleccionar una compañía y proporcionar el código del bus.');
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/transports/update_bus?id_group=${groupData.id_group}&company_id=${selectedCompany}&bus_code=${busCode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: parseInt(selectedCompany, 10),
        bus_code: busCode
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          onBusUpdated(data.updated_bus);
          onHide();
        } else {
          console.error('Error al actualizar el bus:', data.message);
          alert('Error al actualizar el bus.');
        }
      })
      .catch(error => {
        console.error('Error al actualizar el bus:', error);
        alert('Error al actualizar el bus.');
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Información del Bus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="busCompanySelect" className="mb-3">
            <Form.Label>Seleccione la Compañía de Bus</Form.Label>
            <Form.Select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {companies.map(company => (
                <option key={company.company_id} value={company.company_id}>
                  {company.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="busCodeInput" className="mb-3">
            <Form.Label>Código del Bus</Form.Label>
            <Form.Control
              type="text"
              value={busCode}
              onChange={(e) => setBusCode(e.target.value)}
              placeholder="Ingrese el código del bus"
              required
            />
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

export default EditBusModal;