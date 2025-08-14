import React, {
  useEffect,
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
import { useParams } from 'react-router-dom';
import { formatDate, toISODate } from '../utils';

/** Normaliza "notes" del backend (puede llegar como string JSON). Devuelve array de strings. */
function parseNotes(raw) {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.map(String);
    } catch (_) {}
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const parts = trimmed
        .slice(1, -1)
        .split(/"\s*,\s*"/)
        .map((s) => s.replace(/^"+|"+$/g, '').trim())
        .filter(Boolean);
      if (parts.length) return parts;
    }
    const lines = trimmed.split('\n').map((s) => s.trim()).filter(Boolean);
    if (lines.length) return lines;
  }
  return [];
}

/**
 * Pestaña: Indisponibilidad (vacaciones/ausencias).
 * - Crear:   POST   /guides/{id_guide}/availability
 * - Editar:  PATCH  /guides/availability/{id_availability}  (envía todo; incluye "notes" solo si hay nuevo comentario)
 * - Borrar:  DELETE /guides/availability/{id_availability}  (con modal de confirmación)
 * - Filtro/Export: expuestos por ref para usar los botones del header en index.jsx
 */
const UnavailabilityTab = forwardRef(function UnavailabilityTab(
  {
    unavailability = [],
    form = {},          // usamos form.name / form.surname para el texto del modal de borrado
    externalRef,        // opcional, por si el padre prefiere usar este ref
  },
  ref
) {
  const API_URL = process.env.REACT_APP_API_URL;
  const { id } = useParams(); // fallback si no viene form.id_guide

  // Fuente local
  const [items, setItems] = useState(() => Array.isArray(unavailability) ? unavailability : []);
  useEffect(() => {
    setItems(Array.isArray(unavailability) ? unavailability : []);
  }, [unavailability]);

  // ------- Filtros -------
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: '',     // (todos) | vacation | unavailable
    from: '',       // fecha inicio ≥
    to: '',         // fecha fin ≤
    text: '',       // buscar en notas
  });

  const applyFilters = (list) =>
    list.filter((a) => {
      if (filters.status && String(a.status || '').toLowerCase() !== filters.status.toLowerCase()) return false;

      if (filters.from) {
        const s = new Date(a.start_date);
        const f = new Date(filters.from);
        s.setHours(0, 0, 0, 0);
        f.setHours(0, 0, 0, 0);
        if (s < f) return false;
      }
      if (filters.to) {
        const e = new Date(a.end_date);
        const t = new Date(filters.to);
        e.setHours(0, 0, 0, 0);
        t.setHours(0, 0, 0, 0);
        if (e > t) return false;
      }

      if (filters.text) {
        const notesArr = parseNotes(a.notes);
        const hay = notesArr.some((ln) => ln.toLowerCase().includes(filters.text.toLowerCase()));
        if (!hay) return false;
      }
      return true;
    });

  const filtered = useMemo(() => applyFilters(items), [items, filters]);

  // ------- Ordenamiento -------
  const [sortBy, setSortBy] = useState('start_date');
  const [order, setOrder] = useState('desc');
  const handleSort = (col) => {
    if (sortBy === col) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setOrder('asc');
    }
  };
  const renderSortIcon = (col) => {
    if (sortBy !== col) return <i className="fas fa-sort ms-1 text-muted"></i>;
    return order === 'asc' ? <i className="fas fa-sort-up ms-1"></i> : <i className="fas fa-sort-down ms-1"></i>;
  };
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];
      if (sortBy.includes('date')) {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      } else {
        av = String(av ?? '').toLowerCase();
        bv = String(bv ?? '').toLowerCase();
      }
      if (av === bv) return 0;
      return order === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
    return arr;
  }, [filtered, sortBy, order]);

  // ------- Selección / edición -------
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');        // NUEVA nota
  const [editDraft, setEditDraft] = useState(null);      // { start_date, end_date, status }
  const [notesOverrides, setNotesOverrides] = useState({}); // { id_availability: string[] }

  const onRowClick = (row) => {
    const newSel = selectedId === row.id_availability ? null : row.id_availability;
    setSelectedId(newSel);
    if (editingId && editingId !== row.id_availability) {
      // si cambio de fila, cancelo edición anterior
      setEditingId(null);
      setEditValue('');
      setEditDraft(null);
    }
  };

  const beginEdit = (row, e) => {
    if (e) e.stopPropagation(); // no des-seleccionar la fila al pulsar el botón
    setEditingId(row.id_availability);
    setEditValue(''); // NUEVO comentario vacío
    setEditDraft({
      start_date: row.start_date || '',
      end_date: row.end_date || '',
      status: row.status || 'unavailable',
    });
  };

  const cancelEdit = (e) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditValue('');
    setEditDraft(null);
  };

  const validateDraft = (d) => {
    if (!d) return 'Error de edición.';
    if (!d.start_date || !d.end_date) return 'Completa fecha de inicio y fin.';
    const s = new Date(d.start_date);
    const e = new Date(d.end_date);
    if (e < s) return 'La fecha fin no puede ser anterior a la fecha inicio.';
    if (!['vacation', 'unavailable'].includes(String(d.status))) return 'Estado inválido.';
    return null;
  };

  const saveEdit = async (row, e) => {
    if (e) e.stopPropagation();
    const err = validateDraft(editDraft || {});
    if (err) {
      alert(err);
      return;
    }
    try {
      const includeNotes = !!editValue.trim();
      const body = {
        start_date: toISODate(editDraft.start_date),
        end_date: toISODate(editDraft.end_date),
        status: editDraft.status,
        id_group: '',
        modified_by: 'UI',
        ...(includeNotes ? { notes: editValue.trim() } : {}),
      };

      const res = await fetch(`${API_URL}/guides/availability/${row.id_availability}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('No se pudo guardar los cambios');

      // Reflejar localmente
      const stampIfAny = (() => {
        if (!includeNotes) return null;
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        return `(${dd}/${mm}/${yy} ${hh}:${mi}) - ${editValue.trim()}`;
      })();

      setItems((prev) =>
        prev.map((it) =>
          it.id_availability === row.id_availability
            ? {
                ...it,
                start_date: body.start_date,
                end_date: body.end_date,
                status: body.status,
              }
            : it
        )
      );

      if (stampIfAny) {
        const baseArr = notesOverrides[row.id_availability] ?? parseNotes(row.notes);
        const updated = [stampIfAny, ...baseArr];
        setNotesOverrides((prev) => ({ ...prev, [row.id_availability]: updated }));
      }

      setEditingId(null);
      setEditValue('');
      setEditDraft(null);
    } catch (e2) {
      alert(e2.message);
    }
  };

  // ------- Borrado con confirmación -------
  const [showDelete, setShowDelete] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);
  const [deleteText, setDeleteText] = useState('');

  const openDelete = (row, e) => {
    if (e) e.stopPropagation();
    setDeleteRow(row);
    setDeleteText('');
    setShowDelete(true);
  };
  const closeDelete = () => {
    setShowDelete(false);
    setDeleteRow(null);
    setDeleteText('');
  };

  const expectedDeletePhrase = (() => {
    const name = `${form?.name || '-'} ${form?.surname || ''}`.trim();
    const f1 = deleteRow ? formatDate(deleteRow.start_date) : '';
    const f2 = deleteRow ? formatDate(deleteRow.end_date) : '';
    return `borrar vacaciones de ${name} para las fechas ${f1} - ${f2}`;
  })();

  const canConfirmDelete = deleteText === expectedDeletePhrase;

  const doDelete = async () => {
    if (!deleteRow) return;
    if (!canConfirmDelete) return;
    try {
      const res = await fetch(`${API_URL}/guides/availability/${deleteRow.id_availability}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('No se pudo eliminar el evento');
      setItems((prev) => prev.filter((it) => it.id_availability !== deleteRow.id_availability));
      if (selectedId === deleteRow.id_availability) setSelectedId(null);
      closeDelete();
    } catch (e) {
      alert(e.message);
    }
  };

  // ------- Crear -------
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    start_date: '',
    end_date: '',
    status: 'vacation',
    notes: '',
  });

  const openCreate = () => {
    setNewItem({ start_date: '', end_date: '', status: 'vacation', notes: '' });
    setShowCreate(true);
  };
  const closeCreate = () => setShowCreate(false);

  const handleCreate = async () => {
    if (!newItem.start_date || !newItem.end_date) {
      alert('Completa fecha de inicio y fin.');
      return;
    }
    const s = new Date(newItem.start_date);
    const e = new Date(newItem.end_date);
    if (e < s) {
      alert('La fecha fin no puede ser anterior a la fecha inicio.');
      return;
    }
    try {
      setCreating(true);
      const guideId = form.id_guide || id;
      const body = {
        start_date: toISODate(newItem.start_date),
        end_date: toISODate(newItem.end_date),
        status: newItem.status || 'unavailable',
        id_group: '',
        notes: (newItem.notes || '').trim(),
        modified_by: 'UI',
      };
      const resp = await fetch(`${API_URL}/guides/${guideId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error('No se pudo crear la indisponibilidad');

      let created = null;
      try { created = await resp.json(); } catch (_) {}

      const local = created || {
        id_availability: `tmp-${Date.now()}`,
        start_date: body.start_date,
        end_date: body.end_date,
        status: body.status,
        id_group: '',
        notes: body.notes ? JSON.stringify([body.notes]) : '[]',
        modified_by: 'UI',
        modified_at: new Date().toISOString(),
      };

      setItems((prev) => [local, ...prev]);
      setShowCreate(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  };

  // ------- Export CSV -------
  const exportCSV = () => {
    const headers = ['Estado', 'Desde', 'Hasta', 'Notas'];
    const rows = sorted.map((r) => {
      const notesArr = notesOverrides[r.id_availability] ?? parseNotes(r.notes);
      const allNotes = notesArr.join(' | ');
      return [
        r.status || '',
        formatDate(r.start_date) || '',
        formatDate(r.end_date) || '',
        allNotes.replace(/\r?\n/g, ' '),
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement('a');
    aEl.href = url;
    const ts = new Date().toISOString().slice(0, 10);
    aEl.download = `indisponibilidad_${ts}.csv`;
    aEl.click();
    URL.revokeObjectURL(url);
  };

  // ------- Exponer acciones al padre -------
  useImperativeHandle(ref, () => ({
    openFilter: () => setShowFilter(true),
    exportCSV,
    clearFilters: () => setFilters({ status: '', from: '', to: '', text: '' }),
  }));
  useEffect(() => {
    if (externalRef) {
      externalRef.current = {
        openFilter: () => setShowFilter(true),
        exportCSV,
        clearFilters: () => setFilters({ status: '', from: '', to: '', text: '' }),
      };
    }
  }, [externalRef]);

  const showActionCol = selectedId !== null;

  const renderNotesPopover = (notesArr, key) => {
    const rest = notesArr.slice(1);
    return (
      <Popover id={`pop-unav-notes-${key}`}>
        <Popover.Header as="h6">Notas</Popover.Header>
        <Popover.Body style={{ maxHeight: 220, overflowY: 'auto', minWidth: 340 }}>
          {rest.length ? (
            <ul className="mb-0 ps-3">
              {rest.map((ln, i) => (
                <li key={i} className="small">{ln}</li>
              ))}
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
      {/* Toolbar local */}
      <div className="d-flex justify-content-end mb-2">
        <Button variant="primary" className="btn-custom" onClick={openCreate}>
          <i className="fas fa-plus me-1"></i> Nueva indisponibilidad
        </Button>
      </div>

      {/* Tabla */}
      <Table size="sm" bordered hover responsive="md">
        <thead style={{ backgroundColor: '#C0C9EE' }}>
          <tr>
            <th role="button" onClick={() => handleSort('status')} className="user-select-none">
              Estado {renderSortIcon('status')}
            </th>
            <th role="button" onClick={() => handleSort('start_date')} className="user-select-none">
              Desde {renderSortIcon('start_date')}
            </th>
            <th role="button" onClick={() => handleSort('end_date')} className="user-select-none">
              Hasta {renderSortIcon('end_date')}
            </th>
            <th>Notas</th>
            {showActionCol && <th style={{ width: 200 }}>Acción</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.length ? (
            sorted.map((row) => {
              const isSelected = selectedId === row.id_availability;
              const isEditing = editingId === row.id_availability;

              const baseArr = parseNotes(row.notes);
              const notesArr = notesOverrides[row.id_availability] ?? baseArr;
              const firstLine = notesArr[0] || '';

              return (
                <tr
                  key={`unav-${row.id_availability || `${row.status}-${row.start_date}`}`}
                  onClick={() => onRowClick(row)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="text-capitalize">
                    {!isEditing ? (
                      row.status || '-'
                    ) : (
                      <Form.Select
                        value={editDraft?.status || 'unavailable'}
                        onChange={(e) => setEditDraft((d) => ({ ...d, status: e.target.value }))}
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="vacation">vacation</option>
                        <option value="unavailable">unavailable</option>
                      </Form.Select>
                    )}
                  </td>

                  <td>
                    {!isEditing ? (
                      formatDate(row.start_date)
                    ) : (
                      <Form.Control
                        type="date"
                        size="sm"
                        value={editDraft?.start_date || ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, start_date: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </td>

                  <td>
                    {!isEditing ? (
                      formatDate(row.end_date)
                    ) : (
                      <Form.Control
                        type="date"
                        size="sm"
                        value={editDraft?.end_date || ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, end_date: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </td>

                  <td>
                    {!isEditing ? (
                      <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="auto"
                        overlay={renderNotesPopover(notesArr, row.id_availability)}
                      >
                        <span className="d-inline-block text-truncate" style={{ maxWidth: 340 }} title={firstLine}>
                          {firstLine || <span className="text-muted">—</span>}
                        </span>
                      </OverlayTrigger>
                    ) : (
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Nuevo comentario (opcional)…"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </td>

                  {showActionCol && (
                    <td>
                      {!isSelected ? (
                        <span className="text-muted">—</span>
                      ) : !isEditing ? (
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="btn-custom"
                            onClick={(e) => beginEdit(row, e)}
                          >
                            <i className="fas fa-pen me-1"></i> Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="btn-custom"
                            onClick={(e) => openDelete(row, e)}
                          >
                            <i className="fas fa-trash me-1"></i> Eliminar
                          </Button>
                        </div>
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
                            onClick={(e) => saveEdit(row, e)}
                          >
                            Guardar
                          </Button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={showActionCol ? 5 : 4} className="text-center text-muted">
                Sin registros.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal: Filtros */}
      <Modal show={showFilter} onHide={() => setShowFilter(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Filtrar indisponibilidad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">(todos)</option>
                  <option value="vacation">vacation</option>
                  <option value="unavailable">unavailable</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Desde (inicio ≥)</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Hasta (fin ≤)</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Texto en notas (contiene)</Form.Label>
                <Form.Control
                  value={filters.text}
                  onChange={(e) => setFilters({ ...filters, text: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setFilters({ status: '', from: '', to: '', text: '' })}
          >
            Limpiar
          </Button>
          <Button variant="primary" onClick={() => setShowFilter(false)}>
            Aplicar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Nueva indisponibilidad */}
      <Modal show={showCreate} onHide={closeCreate} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nueva indisponibilidad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={newItem.start_date}
                  onChange={(e) => setNewItem({ ...newItem, start_date: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={newItem.end_date}
                  onChange={(e) => setNewItem({ ...newItem, end_date: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                >
                  <option value="vacation">vacation</option>
                  <option value="unavailable">unavailable</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Comentario (opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Ej.: Vacaciones aprobadas"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeCreate} disabled={creating}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-custom" onClick={handleCreate} disabled={creating}>
            {creating ? 'Guardando…' : 'Crear'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Confirmar eliminación */}
      <Modal show={showDelete} onHide={closeDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Para confirmar, copia y pega exactamente el siguiente texto:
          </p>
          <pre className="bg-light p-2 rounded" style={{ whiteSpace: 'pre-wrap' }}>
            {expectedDeletePhrase}
          </pre>
          <Form.Group className="mt-3">
            <Form.Label>Escribe aquí para confirmar</Form.Label>
            <Form.Control
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="Pega el texto aquí"
            />
            <div className="form-text">
              Debe coincidir exactamente (mayúsculas, espacios y guiones).
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={doDelete} disabled={!canConfirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
});

export default UnavailabilityTab;