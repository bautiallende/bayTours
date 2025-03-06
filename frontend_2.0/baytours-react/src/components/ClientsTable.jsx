import React from 'react';
import { Table } from 'react-bootstrap';

const ClientsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No se encontraron clientes.</p>;
  }

  return (
    <Table responsive hover>
      <thead className="thead-light">
        <tr>
          <th>Nombre</th>
          <th>Pasaporte</th>
          <th>Teléfono</th>
          <th>Fecha de Nacimiento</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {data.map((client) => (
          <tr key={client.id_clients}>
            <td>
              {[
                client.first_name,
                client.second_name,
                client.paternal_surname,
                client.mother_surname,
              ]
                .filter(Boolean)
                .join(' ')}
            </td>
            <td>{client.passport || 'N/A'}</td>
            <td>{client.phone || 'N/A'}</td>
            <td>{client.birth_date || 'N/A'}</td>
            <td>{client.mail || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ClientsTable;