import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';

const OptionalCardsList = ({ optionals, clientAge, onSelectOptional }) => {
  const [selectedId, setSelectedId] = useState('');

  // Solo se inicializa la selección si aún no hay una seleccionada
  useEffect(() => {
    if ((!selectedId || selectedId === '') && optionals && optionals.length > 0) {
      const firstId = optionals[0].id_optional.toString();
      setSelectedId(firstId);
      onSelectOptional(optionals[0]);
    }
  }, [optionals, onSelectOptional, selectedId]);

  const handleSelect = (e, optional) => {
    setSelectedId(optional.id_optional.toString());
    onSelectOptional(optional);
  };

  return (
    <div className="mb-4">
      <Row className="gy-3 justify-content-center">
        {optionals && optionals.length > 0 ? (
          optionals.map(opt => (
            <Col key={opt.id_optional} md={6} lg={4} className="d-flex align-items-stretch">
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{opt.name}</Card.Title>
                  <Card.Text>
                    Precio adulto: {opt.adult_price}€<br />Precio menor: {opt.minor_price}€
                  </Card.Text>
                  <div className="flex-grow-1"></div>
                  <div className="form-check mt-auto">
                    <Form.Check
                      type="radio"
                      name="optionalRadio"
                      id={`optional-${opt.id_optional}`}
                      value={opt.id_optional}
                      checked={selectedId === opt.id_optional.toString()}
                      onChange={(e) => handleSelect(e, opt)}
                      label="Seleccionar"
                      style={{ marginRight: '10px' }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No hay opcionales disponibles para este día.</p>
        )}
      </Row>
    </div>
  );
};

export default OptionalCardsList;