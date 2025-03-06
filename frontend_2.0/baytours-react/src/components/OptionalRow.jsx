import React, { useState } from 'react';

/**
 * OptionalRow renderiza una fila de la tabla de opcionales para un cliente.
 * Recibe:
 *  - client: objeto con datos del cliente, incluyendo opcionales (day_optionals)
 *  - itinerary: información del itinerario para iterar sobre los días
 *  - idGroup: ID del grupo
 *  - currentDate: fecha actual (para estilos de días)
 *  - onAddOptional, onEditOptional, onOptionModal: callbacks para las acciones
 */
const OptionalRow = ({ client, itinerary, idGroup, currentDate, onAddOptional, onEditOptional, onOptionModal }) => {
  // Estado para controlar si la fila está expandida
  const [expanded, setExpanded] = useState(false);

  // Calcula el total opcionales para el cliente
  const totalOpcionales = Object.values(client.day_optionals || {}).reduce((sum, optionals) => {
    return sum + optionals.reduce((s, opt) => s + (opt.total || 0), 0);
  }, 0);

  // Función para alternar la expansión
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Función para renderizar el contenido de un día para este cliente
  const renderDayContent = (day, cityInfo) => {
    const dayId = day.id;
    const optionalsList = client.day_optionals ? client.day_optionals[dayId] : null;

    if (optionalsList && optionalsList.length > 0) {
      if (!expanded) {
        // Vista contraída: mostrar solo los nombres resumidos
        return (
          <div className="contracted-content">
            {optionalsList.map((opt, idx) => (
              <p key={idx} className="activity-name"><strong>{opt.optional_name}</strong></p>
            ))}
          </div>
        );
      } else {
        // Vista expandida: mostrar detalles completos, incluyendo la línea con lugar, fecha y método
        return (
          <div className="expanded-content">
            {optionalsList.map((opt, idx) => {
              // Calcular placeAbbrev
              const placeAbbrev = opt.place_of_purchase === 'before_trip' ? 'BT' : 'OT';
              // Calcular paymentAbbrev
              const paymentAbbrev =
                opt.payment_method === 'credit_card'
                  ? 'CC'
                  : opt.payment_method === 'debit_card'
                  ? 'DC'
                  : opt.payment_method === 'Cash'
                  ? '$'
                  : opt.payment_method;
              // Calcular pdateStr (asumiendo formato "dd-mm-yyyy")
              let pdateStr = '';
              if (opt.purchase_date) {
                const parts = opt.purchase_date.substring(0, 10).split('-'); // Extrae "dd-mm-yyyy"
                if (parts.length >= 2) {
                  pdateStr = `${parts[1]}/${parts[0]}`;
                }
              }
              return (
                <div key={idx}>
                  <p><strong>{opt.optional_name}</strong></p>
                  {/* Línea con lugar, fecha y método */}
                  <p style={{ fontStyle: 'italic', fontSize: 'small' }}>
                    {placeAbbrev}-{pdateStr}-{paymentAbbrev}
                  </p>
                  <p>Precio: {opt.price} €</p>
                  <p>Desc: {opt.discount || 0} %</p>
                  <p>Total: {opt.total} €</p>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Se llama al modal de opciones; aquí puedes ajustar según tus necesidades.
                      onOptionModal(client, day.id, cityInfo, cityInfo.days, opt);
                    }}
                  >
                    Editar
                  </button>
                  
                  <hr />
                </div>
              );
            })}
          </div>
        );
      }
    } else if (!expanded) {
      return (
        <div className="contracted-content">
          <p>Sin opcionales</p>
        </div>
      );
    } else {
      return (
        <div className="contracted-content">
          <p>Sin opcionales</p>
          <button
            className="btn btn-sm btn-success"
            onClick={(e) => {
              e.stopPropagation();
              onAddOptional(client, day.id, cityInfo.city, cityInfo.days);
            }}
          >
            Agregar
          </button>
        </div>
      );
    }
  };

  return (
    <>
      <tr className="clickable" onClick={toggleExpanded}>
        <td>
          {[
            client.first_name,
            client.second_name,
            client.paternal_surname,
            client.mother_surname,
          ].filter(Boolean).join(' ')}
          <span className="collapse-icon" style={{ float: 'right' }}>
            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
          </span>
        </td>
        <td>{client.age}</td>
        <td>{client.sex}</td>
        {itinerary.map((cityInfo, cityIndex) =>
          cityInfo.days.map((day, dayIndex) => (
            <td key={`${cityIndex}-${dayIndex}`}>
              {renderDayContent(day, cityInfo)}
            </td>
          ))
        )}
        <td>{totalOpcionales.toFixed(2)} €</td>
      </tr>
    </>
  );
};

export default OptionalRow;