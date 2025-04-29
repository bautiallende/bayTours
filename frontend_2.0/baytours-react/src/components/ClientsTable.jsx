import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import countriesLib from 'i18n-iso-countries';

// Registrar idiomas para i18n-iso-countries
countriesLib.registerLocale(require('i18n-iso-countries/langs/en.json'));
countriesLib.registerLocale(require('i18n-iso-countries/langs/es.json'));

// Función para calcular la edad a partir de la fecha de nacimiento
const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Formatea fecha ISO a DD/MM/YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Obtiene nombre de país a partir de código ISO
const getCountryName = (code) => {
  if (!code) return '-';
  const upper = code.toUpperCase();
  const name = countriesLib.getName(upper, 'en');
  return name || upper;
};

const ClientsTable = ({ data, onEditClient }) => {
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedClientId, setSelectedClientId] = useState(null);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    return [...data].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'age') {
        valA = calculateAge(a.birth_date);
        valB = calculateAge(b.birth_date);
      }
      if (sortBy === 'birth_date' || sortBy === 'vtc_passport') {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
      }
      const aNull = valA == null;
      const bNull = valB == null;
      if (aNull && bNull) return 0;
      if (aNull) return sortOrder === 'asc' ? 1 : -1;
      if (bNull) return sortOrder === 'asc' ? -1 : 1;
      if (valA instanceof Date && valB instanceof Date) {
        return sortOrder === 'asc'
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA);
      const strB = String(valB);
      return sortOrder === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [data, sortBy, sortOrder]);

  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  if (!data || data.length === 0) {
    return <p>No se encontraron clientes.</p>;
  }

  const getRowClass = (client) => {
    if (client.shown === false) {
      return 'row-red';
    }
    return '';
  };

  return (
    <Table responsive hover bordered>
      <thead className="thead-light">
        <tr>
          <th onClick={() => handleSort('pax_number')}>PAX{renderSortIcon('pax_number')}</th>
          <th onClick={() => handleSort('first_name')}>Nombre{renderSortIcon('first_name')}</th>
          <th onClick={() => handleSort('second_name')}>Segundo Nombre{renderSortIcon('second_name')}</th>
          <th onClick={() => handleSort('paternal_surname')}>Apellido Paterno{renderSortIcon('paternal_surname')}</th>
          <th onClick={() => handleSort('mother_surname')}>Apellido Materno{renderSortIcon('mother_surname')}</th>
          <th onClick={() => handleSort('sex')}>Sexo{renderSortIcon('sex')}</th>
          <th onClick={() => handleSort('age')}>Edad{renderSortIcon('age')}</th>
          <th onClick={() => handleSort('birth_date')}>Fecha Nac.{renderSortIcon('birth_date')}</th>
          <th onClick={() => handleSort('phone')}>Teléfono{renderSortIcon('phone')}</th>
          <th onClick={() => handleSort('mail')}>Email{renderSortIcon('mail')}</th>
          <th onClick={() => handleSort('nationality')}>Nacionalidad{renderSortIcon('nationality')}</th>
          <th onClick={() => handleSort('passport')}>Pasaporte{renderSortIcon('passport')}</th>
          <th onClick={() => handleSort('vtc_passport')}>Venc. Pasaporte{renderSortIcon('vtc_passport')}</th>
          <th onClick={() => handleSort('packages')}>Paquetes{renderSortIcon('packages')}</th>
          <th onClick={() => handleSort('room_type')}>Hab. Asignada{renderSortIcon('room_type')}</th>
          { /* Mostrar cabecera de acciones solo si hay uno seleccionado */ }
          {selectedClientId && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((client) => {
          const {
            pax_number,
            id_clients,
            first_name,
            second_name,
            paternal_surname,
            mother_surname,
            sex,
            birth_date,
            phone,
            mail,
            nationality,
            passport,
            vtc_passport,
            packages,
            room_type,
          } = client;
          const age = calculateAge(birth_date);

          return (
            <tr
              key={id_clients}
              style={{ cursor: 'pointer'
               }}
              className={getRowClass(client)}
              onClick={() => setSelectedClientId(prev => prev === id_clients ? null : id_clients)}
            >
              <td>{pax_number || '-'}</td>
              <td>{first_name || '-'}</td>
              <td>{second_name || '-'}</td>
              <td>{paternal_surname || '-'}</td>
              <td>{mother_surname || '-'}</td>
              <td>{sex || '-'}</td>
              <td>{age}</td>
              <td>{formatDate(birth_date) || '-'}</td>
              <td>{phone || '-'}</td>
              <td>{mail || '-'}</td>
              <td>{getCountryName(nationality) || '-'}</td>
              <td>{passport || '-'}</td>
              <td>{formatDate(vtc_passport) || '-'}</td>
              <td>{ packages ? `Paquete ${packages}` : '-' }</td>
              <td>{room_type || '-'}</td>
              {selectedClientId === id_clients && (
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onEditClient(client); }}
                  >
                    Editar
                  </Button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

ClientsTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ id_clients: PropTypes.string.isRequired })
  ).isRequired,
  onEditClient: PropTypes.func.isRequired,
};

export default ClientsTable;