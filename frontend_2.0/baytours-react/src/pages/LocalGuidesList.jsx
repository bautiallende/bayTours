import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Table, Button, Spinner, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LocalGuideModal from '../components/LocalGuides/LocalGuideModal';
import LocalGuidesFilterModal from '../components/LocalGuides/LocalGuidesFilterModal';

// Stub for FilterModal
const FilterModal = ({ show, onHide, onApply, initialFilters }) => null;

const LocalGuidesList = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [localGuides, setLocalGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('surname');
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({});

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      const res = await fetch(`${API_URL}/local_guides/get_cities`);
      if (!res.ok) return;
      const data = await res.json();
      setCities(data);
      if (!selectedCity && data.length) setSelectedCity(data[0].city_id);
    };
    fetchCities();
  }, [API_URL, selectedCity]);

  const fetchLocalGuides = useCallback(async () => {
    if (!selectedCity) return;
    setLoading(true);
    const params = new URLSearchParams({ city: selectedCity, sort_by: sortBy, order });
    Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
    if (Object.keys(filters).length) {
      params.append('filter', JSON.stringify(filters));
    }
    const res = await fetch(`${API_URL}/local_guides/local_guides?${params}`);
    if (!res.ok) { setLocalGuides([]); setLoading(false); return; }
    let data = await res.json();
    // Client-side sorting
    data.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      // Booleans
      if (typeof aVal === 'boolean') { aVal = aVal ? 1 : 0; bVal = bVal ? 1 : 0; }
      // Dates in ISO strings
      if (/Date$/.test(sortBy) || sortBy === 'created_at' || sortBy === 'updated_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      // Numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      // Dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      // Strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return order === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
    setLocalGuides(data);
    setLoading(false);
  }, [API_URL, selectedCity, sortBy, order, filters]);

  // Collapse expanded rows when changing city
  useEffect(() => {
    setExpandedIds([]);
  }, [selectedCity]);
  
  useEffect(() => {
  setFilters({});
}, [selectedCity]);

  useEffect(() => { fetchLocalGuides(); }, [fetchLocalGuides]);

  const handleSort = col => {
    if (sortBy === col) setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setOrder('asc'); }
  };
  const renderSortIcon = col => sortBy === col && <i className={`fas fa-sort-${order === 'asc' ? 'up' : 'down'} ms-1`} />;

  const openFilterModal = () => setShowFilterModal(true);
  const applyFilters = f => { setFilters(f); setShowFilterModal(false); };
  const exportData = () => console.log('Exportar guías', { city: selectedCity, sortBy, order, filters });

  const handleNew = () => { setEditingGuide(null); setShowGuideModal(true); };
  const handleEdit = guide => { setEditingGuide(guide); setShowGuideModal(true); };

  const toggleExpand = id => {
    setExpandedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Guías Locales</h2>
        <div>
          <Button variant="outline-secondary" className="btn-custom me-2" onClick={openFilterModal}>
            <i className="fas fa-filter me-1" />Filtro
          </Button>
          <Button variant="primary" className="btn-custom me-2" onClick={handleNew}>
            <i className="fas fa-plus me-1" />Nuevo
          </Button>
          <Button variant="outline-success" className="btn-custom" onClick={exportData}>
            <i className="fas fa-file-export me-1" />Exportar
          </Button>
        </div>
      </div>

      <Nav variant="tabs" activeKey={selectedCity} onSelect={k => setSelectedCity(Number(k))} className="mb-3">
        {cities.map(c => <Nav.Item key={c.city_id}><Nav.Link eventKey={c.city_id}>{c.city_name}</Nav.Link></Nav.Item>)}
      </Nav>

      {loading ? <div className="text-center my-5"><Spinner animation="border" /></div> : (
        <Table hover>
          <thead>
            <tr>
              <th>ID</th>
              <th onClick={() => handleSort('surname')} style={{ cursor: 'pointer' }}>Apellido{renderSortIcon('surname')}</th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Nombre{renderSortIcon('name')}</th>
              <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>Teléfono{renderSortIcon('phone')}</th>
              <th onClick={() => handleSort('mail')} style={{ cursor: 'pointer' }}>Email{renderSortIcon('mail')}</th>
              <th onClick={() => handleSort('payment_method')} style={{ cursor: 'pointer' }}>Pago{renderSortIcon('payment_method')}</th>
              <th onClick={() => handleSort('active')} style={{ cursor: 'pointer' }}>Activo{renderSortIcon('active')}</th>
              <th onClick={() => handleSort('comments')} style={{ cursor: 'pointer' }}>Comentarios{renderSortIcon('comments')}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {localGuides.map(g => (
              <Fragment key={g.id_local_guide}>
                <tr
                  onClick={() => g.tariffs && g.tariffs.length > 0 && toggleExpand(g.id_local_guide)}
                  style={{ cursor: g.tariffs && g.tariffs.length > 0 ? 'pointer' : 'default' }}
                >
                  <td>{g.id_local_guide}</td>
                  <td>{g.surname}</td>
                  <td>{g.name}</td>
                  <td>{g.phone}</td>
                  <td>{g.mail}</td>
                  <td>{g.payment_method}</td>
                  <td>{g.active ? 'Sí' : 'No'}</td>
                  <td>{g.comments}</td>
                  <td><Button variant="link" size="sm" onClick={e => { e.stopPropagation(); handleEdit(g); }}><i className="fas fa-edit" /></Button></td>
                </tr>
                {g.tariffs && g.tariffs.length > 0 && expandedIds.includes(g.id_local_guide) && (
                  <tr>
                    <td colSpan={9} style={{ paddingLeft: '2rem'}}>
                      <Table size="sm" bordered>
                        <thead style={{ backgroundColor: '#C0C9EE' }}>
                          <tr>
                            <th style={{ backgroundColor: '#C0C9EE' }}>Actividad</th>
                            <th style={{ backgroundColor: '#C0C9EE' }}>Pax Min</th>
                            <th style={{ backgroundColor: '#C0C9EE' }}>Pax Max</th>
                            <th style={{ backgroundColor: '#C0C9EE' }}>Tipo Día</th>
                            <th style={{ backgroundColor: '#C0C9EE' }}>Precio</th>
                            <th style={{ backgroundColor: '#C0C9EE' }}>Moneda</th>
                            <th style={{ backgroundColor: '#C0C9EE' }}>Notas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.tariffs.map(t => (
                            <tr key={t.id_tariff}>
                              <td>{t.optional.name}</td>
                              <td>{t.pax_min}</td>
                              <td>{t.pax_max || '-'}</td>
                              <td>{t.day_type}</td>
                              <td>{t.price}</td>
                              <td>{t.currency}</td>
                              <td>{t.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </Table>
      )}

      <LocalGuidesFilterModal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        onApply={applyFilters}
        initialFilters={filters}
        currentCity={selectedCity}
      />

      <LocalGuideModal
        show={showGuideModal}
        onHide={() => setShowGuideModal(false)}
        onSave={() => { setShowGuideModal(false); fetchLocalGuides(); }}
        initialData={editingGuide}
        currentCity={selectedCity}
        currentCityName={cities.find(c => c.city_id === selectedCity)?.city_name}
      />
    </div>
  );
};

export default LocalGuidesList;
