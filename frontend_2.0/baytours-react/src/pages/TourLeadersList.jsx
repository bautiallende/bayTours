import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// TEMP: stub de filtro hasta implementar el modal real de Tour Leaders
const TourLeadersFilterModal = ({ show, onHide, onApply, initialFilters }) => null;

export default function TourLeadersList() {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [tourLeaders, setTourLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('surname');
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [expanded, setExpanded] = useState([]);

  // --- utils ---
  const formatDate = (s) => {
    if (!s) return '-';
    const str = String(s);
    // ISO YYYY-MM-DD => DD-MM-YYYY
    if (str.length >= 10 && str[4] === '-' && str[7] === '-') {
      return str.slice(8, 10) + '-' + str.slice(5, 7) + '-' + str.slice(0, 4);
    }
    const dt = new Date(str);
    if (isNaN(dt)) return str;
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  };

  const isUpcomingOrCurrent = (endStr) => {
    if (!endStr) return true; // si no hay fin, lo consideramos relevante
    const end = new Date(endStr);
    if (isNaN(end)) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // incluir en curso y futuros: end >= hoy
    return end >= today;
  };

  // --- data fetch ---
  const fetchTourLeaders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort_by: sortBy, order });
    if (Object.keys(filters).length) params.append('filter', JSON.stringify(filters));
    const res = await fetch(`${API_URL}/guides?${params}`);
    if (res.ok) {
      let data = await res.json();
      // ordenamiento cliente-side
      data.sort((a, b) => {
        let av = a[sortBy];
        let bv = b[sortBy];
        if (typeof av === 'boolean') { av = av ? 1 : 0; bv = bv ? 1 : 0; }
        if (typeof av === 'number' && typeof bv === 'number') {
          return order === 'asc' ? av - bv : bv - av;
        }
        if (typeof av === 'string' && typeof bv === 'string') {
          return order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        return 0;
      });
      setTourLeaders(data);
    } else {
      setTourLeaders([]);
    }
    setLoading(false);
  }, [API_URL, sortBy, order, filters]);

  useEffect(() => { fetchTourLeaders(); }, [fetchTourLeaders]);

  // --- sorting ---
  const handleSort = (col) => {
    if (sortBy === col) setOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setOrder('asc'); }
  };
  const renderSortIcon = (col) => sortBy === col && (
    <i className={`fas fa-sort-${order === 'asc' ? 'up' : 'down'} ms-1`} />
  );

  // --- expand ---
  const toggleExpand = (id) => {
    setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);
  };

  const exportData = () => {
    console.log('Export', { sortBy, order, filters });
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Tour Leaders</h2>
        <div>
          <Button variant="outline-secondary" className="btn-custom me-2" onClick={() => setShowFilter(true)}>
            <i className="fas fa-filter me-1"></i> Filtro
          </Button>
          <Button variant="primary" className="btn-custom me-2" onClick={() => navigate('/tour-leaders/0')}>
            <i className="fas fa-plus me-1"></i> Nuevo
          </Button>
          <Button variant="outline-success" className="btn btn-custom" onClick={exportData}>
            <i className="fas fa-file-export me-1"></i> Exportar Datos
          </Button>
        </div>
      </div>

      {loading ? <div className="text-center my-5"><Spinner animation="border" /></div> : (
        <Table hover>
          <thead>
            <tr>
              <th onClick={() => handleSort('surname')} style={{ cursor: 'pointer' }}>Apellido {renderSortIcon('surname')}</th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Nombre {renderSortIcon('name')}</th>
              <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>Teléfono {renderSortIcon('phone')}</th>
              <th onClick={() => handleSort('mail')} style={{ cursor: 'pointer' }}>Email {renderSortIcon('mail')}</th>
              <th onClick={() => handleSort('passport_number')} style={{ cursor: 'pointer' }}>Pasaporte {renderSortIcon('passport_number')}</th>
              <th onClick={() => handleSort('daily_rate')} style={{ cursor: 'pointer' }}>Tarifa/Día {renderSortIcon('daily_rate')}</th>
              <th onClick={() => handleSort('currency')} style={{ cursor: 'pointer' }}>Moneda {renderSortIcon('currency')}</th>
              <th onClick={() => handleSort('active')} style={{ cursor: 'pointer' }}>Activo {renderSortIcon('active')}</th>
              <th onClick={() => handleSort('contract_type')} style={{ cursor: 'pointer' }}>Tipo Contrato {renderSortIcon('contract_type')}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tourLeaders.map(tl => {
              const id = tl.id_guide;
              const allAvail = tl.availability || [];

              // Indisponibilidades por status y solo futuras/en curso
              const vacationsRaw = allAvail.filter(a => {
                const r = (a.status || '').toLowerCase();
                return r.includes('vacation') || r.includes('holiday') || r.includes('unavailable');
              });
              const vacations = vacationsRaw.filter(v => isUpcomingOrCurrent(v.end_date || v.endDate || v.end));

              // Asignaciones por tener id_group y solo futuras/en curso
              const assignmentsRaw = allAvail.filter(a => a.id_group);
              const assignments = assignmentsRaw.filter(a => isUpcomingOrCurrent(a.end_date || a.endDate));

              const canExpand = vacations.length > 0 || assignments.length > 0;

              return (
                <Fragment key={id}>
                  <tr
                    onClick={() => canExpand && toggleExpand(id)}
                    style={{ cursor: canExpand ? 'pointer' : 'default' }}
                  >
                    <td>{tl.surname}</td>
                    <td>{tl.name}</td>
                    <td>{tl.phone}</td>
                    <td>{tl.mail}</td>
                    <td>{tl.passport_number}</td>
                    <td>{tl.daily_rate}</td>
                    <td>{tl.currency}</td>
                    <td>{tl.active ? 'Sí' : 'No'}</td>
                    <td>{tl.contract_type}</td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={e => { e.stopPropagation(); navigate(`/tour-leaders/${id}`); }}
                      >
                        <i className="fas fa-eye me-1"></i> Ver
                      </Button>
                    </td>
                  </tr>

                  {canExpand && expanded.includes(id) && (
                    <tr>
                      <td colSpan={10} style={{ paddingLeft: '2rem' }}>
                        {/* Indisponibilidades */}
                        <Table size="sm" bordered>
                          <thead>
                            <tr>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Indisponibilidad</th>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Desde</th>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Hasta</th>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Notas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vacations.length ? vacations.map(v => (
                              <tr key={`v-${v.id || `${v.start_date}-${v.end_date}`}`}>
                                <td>{v.status || '-'}</td>
                                <td>{formatDate(v.start_date)}</td>
                                <td>{formatDate(v.end_date)}</td>
                                <td>{v.notes || '-'}</td>
                              </tr>
                            )) : (
                              <tr><td colSpan={4}>Sin indisponibilidades futuras.</td></tr>
                            )}
                          </tbody>
                        </Table>

                        {/* Asignaciones */}
                        <Table size="sm" bordered className="mt-2">
                          <thead>
                            <tr>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Grupo</th>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Circuito</th>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Desde</th>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Hasta</th>
                              <th style={{ backgroundColor: '#C0C9EE' }}>Notas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignments.length ? assignments.map(a => (
                              <tr key={`a-${a.id || `${a.id_group}-${a.start_date}`}`}>
                                <td>{a.id_group}</td>
                                <td>{a.circuit_name || '-'}</td>
                                <td>{formatDate(a.start_date)}</td>
                                <td>{formatDate(a.end_date)}</td>
                                <td>{a.notes || '-'}</td>
                              </tr>
                            )) : (
                              <tr><td colSpan={5}>Sin asignaciones futuras.</td></tr>
                            )}
                          </tbody>
                        </Table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </Table>
      )}

      <TourLeadersFilterModal
        show={showFilter}
        onHide={() => setShowFilter(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </div>
  );
}