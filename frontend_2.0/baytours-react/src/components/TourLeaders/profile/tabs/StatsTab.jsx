import React from 'react';
import { Card } from 'react-bootstrap';

export default function StatsTab() {
  return (
    <Card className="mb-5">
      <Card.Body>
        <p className="text-muted">Próximamente: métricas (promedio de ventas, tasa de conversión, antigüedad, etc.).</p>
      </Card.Body>
    </Card>
  );
}
