import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// URL base para obtener datos y opciones desde el backend
const backendUrl = `${process.env.REACT_APP_API_URL}/groups/tabla_groups`;
const optionsUrl = `${process.env.REACT_APP_API_URL}/groups/groups_filter_options`;

/**
 * Componente Groups
 * Muestra una tabla con los grupos, permite ordenar y filtrar datos,
 * y ofrece funcionalidad para exportar información y redirigir al detalle de un grupo.
 */
const Groups = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para almacenar la información de grupos y opciones de filtro
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para el ordenamiento
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');

  // Estado para filtros; se pueden agregar o modificar campos según sea necesario
  const [filters, setFilters] = useState({
    id_grupo: '',
    bus_company: '',
    guide_name: '',
    operaciones_name: '',
    status: '',
    start_date: '',
    end_date: '',
    assistant_name: '',
    has_qr: null,
    current_city: '',
    current_hotel: '',
  });

  // Opciones de filtro obtenidas del backend
  const [options, setOptions] = useState({
    bus_companies: [],
    guides: [],
    operations: [],
    statuses: [],
    assistants: [],
    cities: [],
    hotels: [],
  });

  // Estado para controlar la visibilidad del modal de filtros
  const [showModal, setShowModal] = useState(false);

  /**
   * Al cargar el componente, se leen los parámetros de la URL para establecer
   * el ordenamiento inicial.
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sort = params.get('sort_by') || '';
    const ord = params.get('order') || 'asc';
    setSortBy(sort);
    setOrder(ord);
    // Aquí podríamos extraer otros filtros si se pasan por la URL.
  }, [location.search]);

  /**
   * Función para obtener los datos de grupos desde el backend.
   * Construye los parámetros de consulta a partir de los estados de ordenamiento y filtros.
   */
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      sort_by: sortBy,
      order: order,
      ...filters,
    });
    try {
      const response = await fetch(`${backendUrl}?${params.toString()}`);
      if (!response.ok) throw new Error('Error al obtener los datos');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('fetchGroups error:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, order, filters]);

  /**
   * Función para obtener las opciones de filtros desde el backend.
   */
  const fetchOptions = useCallback(async () => {
    try {
      const response = await fetch(optionsUrl);
      if (!response.ok) throw new Error('Error al obtener las opciones');
      const data = await response.json();
      setOptions(data);
    } catch (error) {
      console.error('fetchOptions error:', error);
    }
  }, []);

  // Ejecuta los fetch cada vez que cambian el orden o los filtros
  useEffect(() => {
    fetchGroups();
    fetchOptions();
  }, [fetchGroups, fetchOptions]);

  /**
   * Maneja el cambio de ordenamiento al hacer clic en una columna.
   * Actualiza el estado de orden y actualiza la URL con los nuevos parámetros.
   */
  const handleSort = (column) => {
    const newOrder = sortBy === column && order === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setOrder(newOrder);
    // Actualiza la URL para reflejar los cambios en el orden
    const params = new URLSearchParams(location.search);
    params.set('sort_by', column);
    params.set('order', newOrder);
    navigate({ search: params.toString() });
  };

  /**
   * Redirige al usuario al detalle de un grupo al hacer clic en una fila.
   */
  const handleRowClick = (groupId) => {
    navigate(`/grupo/${groupId}`);
  };

  /**
   * Función para exportar datos.
   * Envía una petición POST y maneja diferentes respuestas, incluyendo autenticación requerida.
   */
  const exportData = async () => {
    const params = new URLSearchParams({
      ...filters,
      sort_by: sortBy,
      order: order,
    });
    const paramsObj = {};
    params.forEach((value, key) => {
      paramsObj[key] = value;
    });

    // Abre una nueva ventana para la exportación
    const newWindow = window.open('', '_blank');
    try {
      const response = await fetch('/exportar_datos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paramsObj),
      });
      if (response.status === 401) {
        const data = await response.json();
        if (data.auth_url) {
          newWindow.location.href = data.auth_url;
        } else {
          alert('Se requiere autenticación. Por favor, inténtalo de nuevo.');
          newWindow.close();
        }
      } else if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      } else {
        const data = await response.json();
        if (data.sheet_url) {
          newWindow.location.href = data.sheet_url;
        } else if (data.error) {
          alert(data.error);
          newWindow.close();
        }
      }
    } catch (error) {
      console.error('exportData error:', error);
      alert('Ocurrió un error al exportar los datos.');
      newWindow.close();
    }
  };

  /**
   * Maneja el envío del formulario de filtros.
   * Al aplicar los filtros, se cierra el modal y se actualizan los datos.
   */
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setShowModal(false);
    // El efecto de fetch se disparará automáticamente al actualizar el estado de filtros.
  };

  /**
   * Renderiza el icono de ordenamiento según la columna y el estado actual.
   */
  const renderSortIcon = (column) => {
    if (sortBy === column) {
      return order === 'asc' ? (
        <i className="fas fa-sort-up"></i>
      ) : (
        <i className="fas fa-sort-down"></i>
      );
    }
    return null;
  };

  const clearFilters = () => {
    // Reinicia el estado de filtros a sus valores iniciales
    setFilters({
      id_grupo: '',
      bus_company: '',
      guide_name: '',
      operaciones_name: '',
      status: '',
      start_date: '',
      end_date: '',
      assistant_name: '',
      has_qr: null,
      current_city: '',
      current_hotel: '',
    });
    // Opcional: cierra el modal si lo deseas
    setShowModal(false);
    // Opcional: actualiza la URL para remover parámetros, si es necesario
  };

  return (
    <div className="container-fluid">
      {/* Botones superiores para filtros, creación de nuevos registros y exportación */}
      <div className="d-flex justify-content-end mb-3">
        <Button className="btn-custom me-2" onClick={() => setShowModal(true)}>
          <i className="fas fa-filter"></i> Filtro
        </Button>
        <Link to="/nueva_rooming_list" className="btn btn-custom me-2">
          <i className="fas fa-plus"></i> Nueva Rooming List
        </Link>
        <Button className="btn btn-custom" onClick={exportData}>
          <i className="fas fa-file-export"></i> Exportar Datos
        </Button>
      </div>

      {/* Tabla de Grupos */}
      <div className="table-responsive">
        {loading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        ) : (
          <Table className="table table-hover">
            <thead className="thead-custom">
              <tr>
                <th onClick={() => handleSort('id_grupo')}>
                  <a href="#!">ID Grupo {renderSortIcon('id_grupo')}</a>
                </th>
                <th onClick={() => handleSort('bus_company')}>
                  <a href="#!">Compañía de Bus {renderSortIcon('bus_company')}</a>
                </th>
                <th onClick={() => handleSort('guide_name')}>
                  <a href="#!">Nombre del Guía {renderSortIcon('guide_name')}</a>
                </th>
                <th onClick={() => handleSort('operaciones_name')}>
                  <a href="#!">Operaciones {renderSortIcon('operaciones_name')}</a>
                </th>
                <th onClick={() => handleSort('status')}>
                  <a href="#!">Estado {renderSortIcon('status')}</a>
                </th>
                <th onClick={() => handleSort('start_date')}>
                  <a href="#!">Fecha de Inicio {renderSortIcon('start_date')}</a>
                </th>
                <th onClick={() => handleSort('end_date')}>
                  <a href="#!">Fecha de Fin {renderSortIcon('end_date')}</a>
                </th>
                <th onClick={() => handleSort('nombre_asistente')}>
                  <a href="#!">Asistente {renderSortIcon('nombre_asistente')}</a>
                </th>
                <th onClick={() => handleSort('PAX')}>
                  <a href="#!">PAX {renderSortIcon('PAX')}</a>
                </th>
                <th>
                  <span>QR</span>
                </th>
                <th onClick={() => handleSort('ciudad_actual')}>
                  <a href="#!">Ciudad Actual {renderSortIcon('ciudad_actual')}</a>
                </th>
                <th onClick={() => handleSort('hotel_actual')}>
                  <a href="#!">Hotel Actual {renderSortIcon('hotel_actual')}</a>
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.length > 0 ? (
                groups.map((grupo) => (
                  <tr
                    key={grupo.id_group}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(grupo.id_group)}
                  >
                    <td>{grupo.id_group}</td>
                    <td>{grupo.bus_company}</td>
                    <td>{grupo.guide_name}</td>
                    <td>{grupo.operaciones_name}</td>
                    <td>{grupo.status}</td>
                    <td>{grupo.start_date}</td>
                    <td>{grupo.end_date}</td>
                    <td>{grupo.nombre_asistente}</td>
                    <td>{grupo.PAX}</td>
                    <td>{grupo.QR}</td>
                    <td>{grupo.ciudad_actual}</td>
                    <td>{grupo.hotel_actual}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12">No se encontraron grupos.</td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal de Filtros */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Filtros</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFilterSubmit}>
          <Modal.Body>
            <Row>
              {/* Primera columna de filtros */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Grupo</Form.Label>
                  <Form.Control
                    type="text"
                    name="id_grupo"
                    value={filters.id_grupo}
                    onChange={(e) =>
                      setFilters({ ...filters, id_grupo: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Compañía de Bus</Form.Label>
                  <Form.Select
                    name="bus_company"
                    value={filters.bus_company}
                    onChange={(e) =>
                      setFilters({ ...filters, bus_company: e.target.value })
                    }
                  >
                    <option value="">Todas</option>
                    {options.bus_companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Guía</Form.Label>
                  <Form.Select
                    name="guide_name"
                    value={filters.guide_name}
                    onChange={(e) =>
                      setFilters({ ...filters, guide_name: e.target.value })
                    }
                  >
                    <option value="">Todos</option>
                    {options.guides.map((guide) => (
                      <option key={guide} value={guide}>
                        {guide}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Operaciones</Form.Label>
                  <Form.Select
                    name="operaciones_name"
                    value={filters.operaciones_name}
                    onChange={(e) =>
                      setFilters({ ...filters, operaciones_name: e.target.value })
                    }
                  >
                    <option value="">Todos</option>
                    {options.operations.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                  >
                    <option value="">Todos</option>
                    {options.statuses.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {/* Segunda columna de filtros */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={(e) =>
                      setFilters({ ...filters, start_date: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Fin</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={(e) =>
                      setFilters({ ...filters, end_date: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Asistente</Form.Label>
                  <Form.Select
                    name="assistant_name"
                    value={filters.assistant_name}
                    onChange={(e) =>
                      setFilters({ ...filters, assistant_name: e.target.value })
                    }
                  >
                    <option value="">Todos</option>
                    {options.assistants.map((assistant) => (
                      <option key={assistant} value={assistant}>
                        {assistant}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>QR</Form.Label>
                  <Form.Check
                    type="switch"
                    id="has_qr"
                    label="Sí"
                    checked={filters.has_qr}
                    onChange={(e) =>
                      setFilters({ ...filters, has_qr: e.target.checked })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad Actual</Form.Label>
                  <Form.Select
                    name="current_city"
                    value={filters.current_city}
                    onChange={(e) =>
                      setFilters({ ...filters, current_city: e.target.value })
                    }
                  >
                    <option value="">Todas</option>
                    {options.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel Actual</Form.Label>
                  <Form.Select
                    name="current_hotel"
                    value={filters.current_hotel}
                    onChange={(e) =>
                      setFilters({ ...filters, current_hotel: e.target.value })
                    }
                  >
                    <option value="">Todos</option>
                    {options.hotels.map((hotel) => (
                      <option key={hotel} value={hotel}>
                        {hotel}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            {/* Botón para limpiar filtros: recarga la página actual */}
            <Button variant="secondary" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
            <Button type="submit" className="btn-custom">
              Aplicar Filtros
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Groups;