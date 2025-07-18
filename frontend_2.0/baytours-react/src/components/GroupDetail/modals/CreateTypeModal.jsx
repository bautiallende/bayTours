import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function CreateTypeModal({ show, onHide, onSelect }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>¿Qué tipo de evento crear?</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Button variant="primary" className="m-2"
          onClick={() => onSelect('permit')}>
          Nuevo Permiso
        </Button>
        <Button variant="success" className="m-2"
          onClick={() => onSelect('transport')}>
          Nuevo Transporte
        </Button>
      </Modal.Body>
    </Modal>
  );
}