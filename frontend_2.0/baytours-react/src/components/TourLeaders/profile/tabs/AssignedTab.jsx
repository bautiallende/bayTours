import React, {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import { formatDate } from '../utils';

function parseNotes(raw) {
  // Devuelve siempre un array de strings (comentarios)
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    // 1) Intentar JSON.parse directo
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.map(String);
    } catch (_) {}
    const trimmed = raw.trim();

    // 2) Si parece un array pero JSON.parse falló, separar por comillas
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const parts = trimmed
        .slice(1, -1)
        .split(/"\s*,\s*"/)
        .map(s => s.replace(/^"+|"+$/g, '').trim())
        .filter(Boolean);
      if (parts.length) return parts;
    }

    // 3) Último recurso: separar por saltos de línea
    const lines = trimmed.split('\n').map(s => s.trim()).filter(Boolean);
    if (lines.length) return lines;
  }
  return [];
}

const AssignedTab = forwardRef(function AssignedTab(
  {
    assignments = [],
    assSortBy = 'start_date',
    assOrder = 'desc',
    handleAssSort = () => {},
    renderAssSortIcon = () => null,
  },
  ref
) {
  const API_URL = process.env.REACT_APP_API_URL;

  // ---- Filtros (locales) ----
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    groupText: '',
    circuitText: '',
    status: '', // any | confirmed | free | unavailable | vacation
    from: '',
    to: '',
  });

  const applyFilters = (list) => {
    return list.filter((a) => {
      if (filters.groupText && !String(a.id_group || '').toLowerCase().includes(filters.groupText.toLowerCase())) {
        return false;
      }
      if (filters.circuitText && !String(a.circuit_name || '').toLowerCase().includes(filters.circuitText.toLowerCase())) {
        return false;
      }
      if (filters.status && String(a.status || '').toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
      if (filters.from) {
        const s = new Date(a.start_date);
        const f = new Date(filters.from);
        s.setHours(0,0,0,0); f.setHours(0,0,0,0);
        if (s < f) return false;
      }
      if (filters.to) {
        const e = new Date(a.end_date);
        const t = new Date(filters.to);
        e.setHours(0,0,0,0); t.setHours(0,0,0,0);
        if (e > t) return false;
      }
      return true;
    });
  };

  const filtered = useMemo(() => applyFilters(assignments), [assignments, filters]);

  // ---- Selección y edición de "Notas" como NUEVO comentario ----
  const [selectedId, setSelectedId] = useState(null);        // id_availability seleccionado
  const [editingId, setEditingId] = useState(null);          // id_availability en edición
  const [editValue, setEditValue] = useState('');            // NUEVO comentario a agregar
  const [notesOverrides, setNotesOverrides] = useState({});  // { [id_availability]: string[] } (array de comentarios)

  const onRowClick = (a) => {
    const newSelected = selectedId === a.id_availability ? null : a.id_availability;
    setSelectedId(newSelected);
    if (editingId && editingId !== a.id_availability) {
      setEditingId(null);
      setEditValue('');
    }
  };

  const beginEdit = (a) => {
    // Nuevo comentario: el textarea arranca vacío
    setEditingId(a.id_availability);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveNotes = async (a) => {
    const newText = (editValue || '').trim();
    if (!newText) {
      alert('Escribe un comentario antes de guardar.');
      return;
    }
    try {
      // Payload EXACTO pedido
      const body = {
        notes: newText,
        modified_by: 'UI',
        start_date: a.start_date,
        end_date: a.end_date,
        id_group: a.id_group,
        status: a.status,
      };

      const res = await fetch(`${API_URL}/guides/availability/${a.id_availability}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('No se pudo guardar el comentario');

      // Reflejo en UI local: agrego nuevo comentario al inicio (array de strings)
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      const hh = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      const stamped = `(${dd}/${mm}/${yy} ${hh}:${mi}) - ${newText}`;

      const currentArr = notesOverrides[a.id_availability] ?? parseNotes(a.notes);
      const updatedArr = [stamped, ...currentArr];

      setNotesOverrides((prev) => ({ ...prev, [a.id_availability]: updatedArr }));
      setEditingId(null);
      setEditValue('');
    } catch (e) {
      alert(e.message);
    }
  };

  // ---- Export CSV de lo filtrado ----
  const exportCSV = () => {
    const headers = ['Grupo', 'Circuito', 'Estado', 'Desde', 'Hasta', 'Notas'];
    const rows = filtered.map(a => {
      const notesArr = notesOverrides[a.id_availability] ?? parseNotes(a.notes);
      const allNotes = notesArr.join(' | ');
      return [
        a.id_group || '',
        a.circuit_name || '',
        a.status || '',
        formatDate(a.start_date) || '',
        formatDate(a.end_date) || '',
        allNotes.replace(/\r?\n/g, ' '),
      ];
    });
    const csv = [headers, ...rows].map(r =>
      r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement('a');
    aEl.href = url;
    const ts = new Date().toISOString().slice(0,10);
    aEl.download = `grupos_asignados_${ts}.csv`;
    aEl.click();
    URL.revokeObjectURL(url);
  };

  // ---- Exponer acciones al padre (index.jsx) ----
  useImperativeHandle(ref, () => ({
    openFilter: () => setShowFilter(true),
    exportCSV,
    clearFilters: () => setFilters({ groupText: '', circuitText: '', status: '', from: '', to: '' }),
  }), [filtered]);

  const showActionCol = selectedId !== null;

  // Render popover con TODAS las notas (excepto la primera que se ve en la tabla)
  const renderNotesPopover = (notesArr, key) => {
    const rest = notesArr.slice(1);
    return (
      <Popover id={`pop-notes-${key}`}>
        <Popover.Header as="h6">Notas</Popover.Header>
        <Popover.Body style={{ maxHeight: 220, overflowY: 'auto', minWidth: 340 }}>
          {rest.length ? (
            <ul className="mb-0 ps-3">
              {rest.map((ln, i) => <li key={i} className="small">{ln}</li>)}
            </ul>
          ) : (
            <div className="text-muted small">Sin comentarios adicionales.</div>
          )}
        </Popover.Body>
      </Popover>
    );
  };

  return (
    <div>
      {/* Tabla */}
      <Table size="sm" bordered hover responsive="md">
        <thead style={{ backgroundColor: '#C0C9EE' }}>
          <tr>
            <th
              role="button"
              onClick={() => handleAssSort('id_group')}
              className="user-select-none"
            >
              Grupo {renderAssSortIcon('id_group')}
            </th>
            <th
              role="button"
              onClick={() => handleAssSort('circuit_name')}
              className="user-select-none"
            >
              Circuito {renderAssSortIcon('circuit_name')}
            </th>
            <th
              role="button"
              onClick={() => handleAssSort('status')}
              className="user-select-none"
            >
              Estado {renderAssSortIcon('status')}
            </th>
            <th
              role="button"
              onClick={() => handleAssSort('start_date')}
              className="user-select-none"
            >
              Desde {renderAssSortIcon('start_date')}
            </th>
            <th
              role="button"
              onClick={() => handleAssSort('end_date')}
              className="user-select-none"
            >
              Hasta {renderAssSortIcon('end_date')}
            </th>
            <th>Notas</th>
            {showActionCol && <th style={{ width: 120 }}>Acción</th>}
          </tr>
        </thead>
        <tbody>
          {filtered.length ? filtered.map((a) => {
            const isSelected = selectedId === a.id_availability;
            const isEditing = editingId === a.id_availability;

            // Array de notas desde back (string JSON) + posibles overrides locales
            const baseArr = parseNotes(a.notes);
            const notesArr = notesOverrides[a.id_availability] ?? baseArr;
            const firstLine = notesArr[0] || '';

            return (
              <tr
                key={`ass-${a.id_availability || `${a.id_group}-${a.start_date}`}`}
                onClick={() => onRowClick(a)}
                style={{ cursor: 'pointer' }}
              >
                <td>{a.id_group}</td>
                <td>{a.circuit_name || '-'}</td>
                <td className="text-capitalize">{a.status || '-'}</td>
                <td>{formatDate(a.start_date)}</td>
                <td>{formatDate(a.end_date)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  {!isEditing ? (
                    <OverlayTrigger
                      trigger={['hover', 'focus']}
                      placement="auto"
                      overlay={renderNotesPopover(notesArr, a.id_availability)}
                    >
                      <span
                        className="d-inline-block text-truncate"
                        style={{ maxWidth: 340 }}
                        title={firstLine}
                      >
                        {firstLine || <span className="text-muted">—</span>}
                      </span>
                    </OverlayTrigger>
                  ) : (
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Escribe un nuevo comentario…"
                    />
                  )}
                </td>

                {/* Columna Acción solo si hay una fila seleccionada */}
                {showActionCol && (
                  <td onClick={(e) => e.stopPropagation()}>
                    {!isSelected ? (
                      <span className="text-muted">—</span>
                    ) : !isEditing ? (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="btn-custom"
                        onClick={() => beginEdit(a)}
                      >
                        <i className="fas fa-pen me-1"></i> Editar
                      </Button>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="btn-custom"
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          className="btn-custom"
                          onClick={() => saveNotes(a)}
                        >
                          Guardar
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={showActionCol ? 7 : 6} className="text-center text-muted">
                Sin asignaciones.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal de Filtros (lo abrimos desde el padre via ref) */}
      <Modal show={showFilter} onHide={() => setShowFilter(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Filtrar asignaciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Grupo (contiene)</Form.Label>
                <Form.Control
                  value={filters.groupText}
                  onChange={(e) => setFilters({ ...filters, groupText: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Circuito (contiene)</Form.Label>
                <Form.Control
                  value={filters.circuitText}
                  onChange={(e) => setFilters({ ...filters, circuitText: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">(todos)</option>
                  <option value="confirmed">confirmed</option>
                  <option value="free">free</option>
                  <option value="unavailable">unavailable</option>
                  <option value="vacation">vacation</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Desde (fecha inicio ≥)</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Hasta (fecha fin ≤)</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setFilters({ groupText: '', circuitText: '', status: '', from: '', to: '' })}
          >
            Limpiar
          </Button>
          <Button variant="primary" onClick={() => setShowFilter(false)}>
            Aplicar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
});

export default AssignedTab;