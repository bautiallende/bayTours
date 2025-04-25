import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

/**
 * ItinerarySection Component
 * 
 * Muestra la información de itinerario del grupo, incluyendo:
 * - Vuelo de Llegada y Fecha de Inicio.
 * - Vuelo de Regreso y Fecha de Regreso.
 * - Ciudad Actual y Hotel Actual.
 *
 * Props:
 *  - groupData: Objeto con los datos del grupo.
 */
const ItinerarySection = ({ groupData }) => {
  return (
    <Card style={{ backgroundColor: '#BDD8F1', borderRadius: '10px' }}>
      <Card.Body className="p-2">
        <h5>Itinerario</h5>
        <Row>
          <Col>
            <p>
              <strong>Vuelo de Llegada:</strong> {groupData.start_flight || 'No asignado'}
            </p>
            <p>
              <strong>Fecha de Inicio:</strong>{' '}
              <span id="fechaInicio">{groupData.start_date}</span>
            </p>
            <p>
              <strong>Ciudad Actual:</strong> {groupData.ciudad_actual || 'N/A'}
            </p>
          </Col>
          <Col>
            <p>
              <strong>Vuelo de Regreso:</strong> {groupData.end_flight || 'No asignado'}
            </p>
            <p>
              <strong>Fecha de Regreso:</strong>{' '}
              <span id="fechaRegreso">{groupData.end_date}</span>
            </p>
            <p>
              <strong>Hotel Actual:</strong> {groupData.hotel_actual || '-'}
            </p>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ItinerarySection;
