import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { HEADER_BG, formatDate } from '../utils';

export default function EvaluationsTab({ evaluations = [] }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Table size="sm" bordered>
          <thead>
            <tr>
              <th style={HEADER_BG}>Fecha</th>
              <th style={HEADER_BG}>Puntaje</th>
              <th style={HEADER_BG}>Fuente</th>
              <th style={HEADER_BG}>Grupo</th>
              <th style={HEADER_BG}>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.length ? evaluations.map(ev => (
              <tr key={ev.id_eval}>
                <td>{formatDate(ev.created_at)}</td>
                <td>{ev.rating}</td>
                <td>{ev.source}</td>
                <td>{ev.id_group}</td>
                <td>{ev.comment}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center text-muted">Sin evaluaciones.</td></tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}