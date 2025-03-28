import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * ContactSection Component
 * 
 * Muestra la información de contacto del grupo y un mini mapa.
 * Incluye:
 *  - Operaciones, con opción a editar.
 *  - Asistente, con opción a editar.
 *  - Responsable de Hoteles, con opción a editar.
 *  - Un mini mapa que al hacer clic dispara una acción (por ejemplo, abrir un modal de mapa).
 *
 * Props:
 *  - groupData: Objeto con los datos del grupo.
 *  - onEditOperations: Callback para abrir el modal de edición de Operaciones.
 *  - onEditAssistant: Callback para abrir el modal de edición del Asistente.
 *  - onEditResponsible: Callback para abrir el modal de edición del Responsable de Hoteles.
 *  - onOpenMap: Callback para la acción de abrir el modal del mapa.
 */
const ContactSection = ({
  groupData,
  onEditOperations,
  onEditAssistant,
  onEditResponsible,
  onOpenMap,
}) => {
  return (
    <Card style={{ backgroundColor: '#BDD8F1', borderRadius: '10px' }}>
      <Card.Body className="p-2">
        <Row>
          <Col xs={6}>
            <h5>Contacto</h5>
            <p>
              <strong>Operaciones:</strong>{' '}
              <span id="operationsAgentInfo">
                {groupData.operaciones_name || 'No asignado'}
              </span>
              <Link className="ms-2 edit-icon" onClick={onEditOperations} to="#">
                <i className="fas fa-edit"></i>
              </Link>
            </p>
            <p>
              <strong>Asistente:</strong>{' '}
              <span id="assistantInfo">
                {groupData.nombre_asistente || 'No asignado'}
              </span>
              <Link className="ms-2 edit-icon" onClick={onEditAssistant} to="#">
                <i className="fas fa-edit"></i>
              </Link>
            </p>
            <p>
              <strong>Responsable de Hoteles:</strong>{' '}
              <span id="responsibleHotelsInfo">
                {groupData.id_responsible_hotels || 'No asignado'}
              </span>
              <Link className="ms-2 edit-icon" onClick={onEditResponsible} to="#">
                <i className="fas fa-edit"></i>
              </Link>
            </p>
          </Col>
          <Col xs={6} className="d-flex align-items-start justify-content-center">
            <Link onClick={onOpenMap} to="#">
              <img
                src="/assets/images/mini_mapa.png"
                alt="Mapa"
                className="img-fluid mini-map-img"
                style={{ borderRadius: 0, maxWidth: '90%' }}
              />
            </Link>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ContactSection;
