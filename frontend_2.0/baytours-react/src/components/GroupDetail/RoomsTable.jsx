import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';

// Calcula la edad a partir de la fecha de nacimiento
const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Obtiene el símbolo de la moneda
const getCurrencySymbol = (currency) => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    // Agrega más divisas según sea necesario
  };
  return currencySymbols[currency] || '-';
};

// Mapeo de estados para traducirlos
const statusMapping = {
  'New': 'Nuevo',
  'Under review': 'En revisión',
  'Confirmed': 'Confirmado',
  'Provisional': 'Provisorio'
};

const RoomsTable = ({ roomAssignments, onEditAssignment }) => {
  // 1. Agrupar asignaciones por room_composition_id (o usar id de asignación si no existe)
  const roomsMap = {};
  roomAssignments.forEach((assignment) => {
    const roomKey = assignment.room_composition_id || assignment.id;
    if (!roomsMap[roomKey]) {
      roomsMap[roomKey] = [];
    }
    roomsMap[roomKey].push(assignment);
  });
  const roomGroups = Object.values(roomsMap);

  // Función para asignar clase según estado (para cada grupo se usará el estado del sample)
  const getRowClass = (status) => {
    switch (status) {
      case 'new':
        return 'row-yellow';
      case 'Under review':
        return 'row-red';
      case 'Confirmed':
        return '';
      case 'Provisional':
        return 'row-yellow';
      default:
        return '';
    }
  };

  return (
    <Table responsive bordered>
      <thead>
        <tr>
          <th>Nombre Completo</th>
          <th>Edad</th>
          <th>Sexo</th>
          <th>Pasaporte</th>
          <th>Fecha(s)</th>
          <th>Hotel</th>
          <th>Ciudad</th>
          <th>Tipo de Habitación</th>
          <th>Nº Habitación</th>
          <th>Precio</th>
          <th>Suplementos</th>
          <th>Divisa</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Estado</th>
          <th>Notas</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {roomGroups.length ? (
          roomGroups.map((group, groupIndex) => {
            // Datos comunes de la habitación (tomando el primer assignment)
            const sample = group[0] || {};
            const hotelName = sample.hotel_name || '-';
            const city = sample.city || '-';
            const roomType = sample.type || '-';
            const roomNumber = sample.room_number || '-';
            const currencySymbol = getCurrencySymbol(sample.currency);
            const price = sample.price || '';
            const supSymbol = getCurrencySymbol(sample.supplements_currency);
            const supplements = sample.supplements || '';
            const supCurrency = sample.supplements_currency || '-';
            const checkIn = sample.check_in_date ? sample.check_in_date.split('T')[0] : '-';
            const checkOut = sample.departure_date ? sample.departure_date.split('T')[0] : '-';
            const statusText = statusMapping[sample.status] || sample.status;
            const comments = sample.comments || '-'; 
            // const comments =
            //   Array.isArray(sample.comments) && sample.comments.length
            //     ? sample.comments.join(', ')
            //     : '-';

            // Se calculan las fechas únicas para todo el grupo (celda combinada para "Fecha(s)")
            const uniqueGroupDates = Array.from(
              new Set(group.map((a) => (a.date ? a.date.split('T')[0] : '-')))
            );

            // Dentro del grupo, agrupar por cliente para evitar duplicados
            const clientsMap = {};
            group.forEach((asg) => {
              const clientKey = asg.id_clients;
              if (!clientsMap[clientKey]) {
                clientsMap[clientKey] = [];
              }
              clientsMap[clientKey].push(asg);
            });
            const clientsArray = Object.values(clientsMap);
            const totalClients = clientsArray.length;

            // Se define un color de fondo alternado para cada grupo
            const groupBackground = groupIndex % 2 === 0 ? "#ffffff" : "#f2f2f2";

            return clientsArray.map((clientAssignments, clientIndex) => {
              const refAsg = clientAssignments[0] || {};
              const fullName = [refAsg.first_name, refAsg.second_name, refAsg.paternal_surname, refAsg.mother_surname]
                .filter(Boolean)
                .join(' ');
              const age = calculateAge(refAsg.birth_date);
              const sex = refAsg.sex || '-';
              const passport = refAsg.passport || '-';

              // Estilo para la fila: fondo según el grupo; si es la última fila del grupo, se agrega borde inferior
              const rowStyle = { backgroundColor: groupBackground };
              if (clientIndex === totalClients - 1) {
                rowStyle.borderBottom = "2px solid #333";
              }

              return (
                <tr
                  key={`group-${groupIndex}-client-${clientIndex}`}
                  className={getRowClass(sample.status)}
                  style={rowStyle}
                >
                  {/* Datos personales */}
                  <td>{fullName}</td>
                  <td>{age}</td>
                  <td>{sex}</td>
                  <td>{passport}</td>
                  {/* La columna Fecha(s) se muestra sólo en la primera fila del grupo */}
                  {clientIndex === 0 && (
                    <td rowSpan={totalClients}>
                      {uniqueGroupDates.map((d, i) => (
                        <div key={i}>{d}</div>
                      ))}
                    </td>
                  )}
                  {/* Columnas comunes a la habitación (solo en la primera fila del grupo) */}
                  {clientIndex === 0 && (
                    <>
                      <td rowSpan={totalClients}>{hotelName}</td>
                      <td rowSpan={totalClients}>{city}</td>
                      <td rowSpan={totalClients}>{roomType}</td>
                      <td rowSpan={totalClients}>{roomNumber}</td>
                      <td rowSpan={totalClients}>{`${currencySymbol}${price}`}</td>
                      <td rowSpan={totalClients}>{`${supSymbol}${supplements}`}</td>
                      <td rowSpan={totalClients}>{supCurrency}</td>
                      <td rowSpan={totalClients}>{checkIn}</td>
                      <td rowSpan={totalClients}>{checkOut}</td>
                      <td rowSpan={totalClients}>{statusText}</td>
                      <td rowSpan={totalClients}>{comments}</td>
                      <td rowSpan={totalClients}>
                        <Button variant="primary" size="sm" onClick={() => onEditAssignment(sample)}>
                          Editar
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              );
            });
          })
        ) : (
          <tr>
            <td colSpan="17" className="text-center">
              No hay asignaciones de cuartos.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

RoomsTable.propTypes = {
  roomAssignments: PropTypes.array.isRequired,
  onEditAssignment: PropTypes.func.isRequired,
};

export default RoomsTable;