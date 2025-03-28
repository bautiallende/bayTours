import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * InfoGeneral Component
 * 
 * Este componente muestra la información general del grupo, incluyendo:
 *  - ID del grupo.
 *  - Nombre del guía, con opción a editar.
 *  - Información del bus (compañía y código), con opción a editar.
 *  - Estado del grupo y estado del QR, ambos con opción a edición.
 *
 * Props:
 *  - groupData: Objeto con los datos del grupo.
 *  - onEditGuide: Función callback para abrir el modal de edición del guía.
 *  - onEditBus: Función callback para abrir el modal de edición del bus.
 *  - onEditQR: Función callback para abrir el modal de edición del QR.
 */
const InfoGeneral = ({ groupData, onEditGuide, onEditBus, onEditQR }) => {
  return (
    <Card style={{ backgroundColor: '#BDD8F1', borderRadius: '10px' }}>
      <Card.Body className="p-2">
        <h5>Información General</h5>
        <Row>
          <Col>
            <p>
              <strong>ID Grupo:</strong> {groupData.id_group}
            </p>
            <p>
              <strong>Guía:</strong>{' '}
              <span>{groupData.guide_name || 'No asignado'}</span>
              <Link className="ms-2 edit-icon" onClick={onEditGuide} to="#">
                <i className="fas fa-edit"></i>
              </Link>
            </p>
            <p>
              <strong>Bus:</strong>{' '}
              <span>
                {groupData.bus_company || 'No asignado'}
                {groupData.bus_code ? ' - ' + groupData.bus_code : ''}
              </span>
              <Link className="ms-2 edit-icon" onClick={onEditBus} to="#">
                <i className="fas fa-edit"></i>
              </Link>
            </p>
          </Col>
          <Col>
            <p>
              <strong>Status:</strong>{' '}
              <Badge pill bg="success" style={{ fontSize: '1rem', padding: '5px', marginLeft: '8px' }}>
                {groupData.status.charAt(0).toUpperCase() + groupData.status.slice(1)}
              </Badge>
            </p>
            <p>
              <strong>QR:</strong>{' '}
              <span>{groupData.QR ? 'Sí' : 'No'}</span>
              <Link className="ms-2 edit-icon" onClick={onEditQR} to="#">
                <i className="fas fa-edit"></i>
              </Link>
            </p>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default InfoGeneral;