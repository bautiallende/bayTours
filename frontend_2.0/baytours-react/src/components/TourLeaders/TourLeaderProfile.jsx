import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Spinner, Table, Badge, InputGroup, Tabs, Tab } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

/**
 * TourLeaderProfile.jsx — v2.1
 * - Pestañas: Resumen, Grupos asignados, Indisponibilidad, Calendario, Evaluaciones, Estadísticas
 * - Lectura por defecto; "Editar" habilita edición (roles a futuro)
 * - Calendario mensual sin dependencias externas (visualiza grupos y vacaciones)
 */

const CONTRACT_TYPES = [
  { value: 'employee', label: 'Empleado' },
  { value: 'third_party', label: 'Tercerizado' },
];

const FAVORITE_CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP'];
const ALL_CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP', 'ARS', 'JPY', 'CNY', 'INR', 'BRL', 'CAD'];

const HEADER_BG = { backgroundColor: '#C0C9EE' };

const formatDate = (s) => {
  if (!s) return '-';
  const str = String(s);
  if (str.length >= 10 && str[4] === '-' && str[7] === '-') {
    return str.slice(8, 10) + '-' + str.slice(5, 7) + '-' + str.slice(0, 4);
  }
  const dt = new Date(str);
  if (isNaN(dt)) return str;
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const toISODate = (s) => {
  if (!s) return '';
  const str = String(s);
  if (str.length >= 10 && str[2] === '-' && str[5] === '-') {
    return `${str.slice(6, 10)}-${str.slice(3, 5)}-${str.slice(0, 2)}`;
  }
  return str.slice(0, 10);
};

// --- Helpers para calendario mensual sin librerías externas ---
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const startOfGrid = (d) => { // lunes como primer día
  const first = startOfMonth(d);
  const day = (first.getDay() + 6) % 7; // 0..6 (lunes=0)
  const grid = new Date(first);
  grid.setDate(first.getDate() - day);
  grid.setHours(0,0,0,0);
  return grid;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isSameDay = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const fmtYYYYMMDD = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const colorForCircuit = (name) => {
  const s = String(name || 'NA');
  let hash = 0; for (let i=0;i<s.length;i++) hash = s.charCodeAt(i) + ((hash<<5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 85%)`;
};

function MonthlyCalendar({ assignments, unavailability }) {
  const [month, setMonth] = useState(() => { const t=new Date(); t.setDate(1); t.setHours(0,0,0,0); return t; });
  const [showAssign, setShowAssign] = useState(true);
  const [showUnavail, setShowUnavail] = useState(true);

  // Expandimos eventos por día para pintarlos dentro de cada celda
  const days = useMemo(() => {
    const start = startOfGrid(month);
    const grid = [];
    for (let i=0;i<42;i++) grid.push(addDays(start, i)); // 6 semanas
    return grid;
  }, [month]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    const put = (dateStr, evt) => {
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr).push(evt);
    };

    const expand = (arr, kind) => {
      arr.forEach(a => {
        if (!a) return;
        const s = new Date(a.start_date);
        const e = new Date(a.end_date || a.start_date);
        s.setHours(0,0,0,0); e.setHours(0,0,0,0);
        for (let d = new Date(s); d <= e; d = addDays(d, 1)) {
          put(fmtYYYYMMDD(d), { kind, a });
        }
      });
    };

    if (showAssign) expand(assignments, 'assign');
    if (showUnavail) expand(unavailability, 'unavail');
    return map;
  }, [assignments, unavailability, showAssign, showUnavail]);

  const inCurrentMonth = (d) => d.getMonth() === month.getMonth();

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))}>
            <i className="fas fa-chevron-left"></i>
          </Button>
          <strong>{month.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</strong>
          <Button variant="outline-secondary" size="sm" className="ms-2" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))}>
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
        <div className="d-flex align-items-center gap-3 small">
          <Form.Check type="checkbox" id="cal-assign" label="Asignaciones" checked={showAssign} onChange={(e)=>setShowAssign(e.target.checked)} />
          <Form.Check type="checkbox" id="cal-unavail" label="Indisponibilidad" checked={showUnavail} onChange={(e)=>setShowUnavail(e.target.checked)} />
          <div className="d-flex align-items-center gap-2">
            <span className="badge" style={{ background: '#9ec5fe' }}>&nbsp;&nbsp;</span><span className="text-muted">Circuitos</span>
            <span className="badge" style={{ background: '#f8d7da' }}>&nbsp;&nbsp;</span><span className="text-muted">Indisp.</span>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <Table bordered className="calendar-table">
          <thead>
            <tr>
              {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => <th key={d} style={HEADER_BG}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, row) => (
              <tr key={row} style={{ height: 120 }}>
                {Array.from({ length: 7 }).map((__, col) => {
                  const idx = row*7 + col;
                  const day = days[idx];
                  const key = fmtYYYYMMDD(day);
                  const list = eventsByDay.get(key) || [];
                  return (
                    <td key={col} className={inCurrentMonth(day) ? '' : 'bg-light'} style={{ verticalAlign: 'top' }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <small className="text-muted">{day.getDate()}</small>
                      </div>
                      <div className="mt-1 d-flex flex-column gap-1">
                        {list.slice(0,6).map((evt, i) => {
                          if (evt.kind === 'assign') {
                            const c = colorForCircuit(evt.a.circuit_name);
                            const title = `${evt.a.id_group}${evt.a.circuit_name ? ' · '+evt.a.circuit_name : ''}`;
                            return <div key={i} className="px-1 rounded" style={{ background: c, border: '1px solid #dee2e6' }} title={title}>
                              <small className="text-truncate d-block" style={{ maxWidth: '100%' }}>{title}</small>
                            </div>;
                          } else {
                            // indisponibilidad
                            const bg = '#f8d7da';
                            const title = evt.a.status || 'indisponible';
                            return <div key={i} className="px-1 rounded" style={{ background: bg, border: '1px solid #f5c2c7' }} title={title}>
                              <small className="text-truncate d-block" style={{ maxWidth: '100%' }}>{title}</small>
                            </div>;
                          }
                        })}
                        {list.length > 6 && <small className="text-muted">+{list.length-6} más…</small>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

// Calendario estilo "Grupos" (FullCalendar) adaptado a Tour Leader
function TLCalendar({ assignments = [], unavailability = [], initialDate }) {
  const calendarRef = useRef(null);
  const [showAssign, setShowAssign] = useState(true);
  const [showUnavail, setShowUnavail] = useState(true);

  const addOneDay = (iso) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const events = useMemo(() => {
    const evts = [];
    if (showAssign) {
      assignments.forEach(a => {
        const bg = colorForCircuit(a.circuit_name);
        evts.push({
          title: `${a.id_group}${a.circuit_name ? ' · ' + a.circuit_name : ''}`,
          start: a.start_date,
          end: addOneDay(a.end_date || a.start_date), // end exclusivo para abarcar el último día
          allDay: true,
          backgroundColor: bg,
          borderColor: '#dee2e6',
          extendedProps: { type: 'assignment', ...a }
        });
      });
    }
    if (showUnavail) {
      unavailability.forEach(u => {
        evts.push({
          title: u.status || 'Indisponible',
          start: u.start_date,
          end: addOneDay(u.end_date || u.start_date),
          allDay: true,
          backgroundColor: '#f8d7da',
          borderColor: '#f5c2c7',
          extendedProps: { type: 'unavailability', ...u }
        });
      });
    }
    return evts;
  }, [assignments, unavailability, showAssign, showUnavail]);

  const fcProps = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
    events,
    editable: false,
    selectable: false,
    height: 'auto',
    dayMaxEvents: true,
    displayEventEnd: true,
  };
  if (initialDate) {
    const d = new Date(initialDate);
    if (!isNaN(d)) fcProps.initialDate = d.toISOString().split('T')[0];
  }

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3 small">
          <Form.Check type="checkbox" id="cal-assign" label="Asignaciones" checked={showAssign} onChange={(e)=>setShowAssign(e.target.checked)} />
          <Form.Check type="checkbox" id="cal-unavail" label="Indisponibilidad" checked={showUnavail} onChange={(e)=>setShowUnavail(e.target.checked)} />
          <div className="d-flex align-items-center gap-2">
            <span className="badge" style={{ background: '#9ec5fe' }}>&nbsp;&nbsp;</span><span className="text-muted">Circuitos</span>
            <span className="badge" style={{ background: '#f8d7da' }}>&nbsp;&nbsp;</span><span className="text-muted">Indisp.</span>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <FullCalendar ref={calendarRef} {...fcProps} />
      </Card.Body>
    </Card>
  );
}

export default function TourLeaderProfile() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { id } = useParams(); // id_guide o '0' para nuevo
  const navigate = useNavigate();

  const isNew = id === '0' || id === 0;
  const canEdit = true; // futuro: controlar por roles

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(isNew); // nuevo entra en edición
  const backupRef = useRef(null); // snapshot para cancelar
  const [imgError, setImgError] = useState(false);

  const [form, setForm] = useState({
    name: '', surname: '', phone: '', mail: '',
    birth_date: '', id_city: '', city_name: '', nationality: '', languages: [],
    passport_number: '', passport_expiry: '',
    license_number: '', license_expiry: '',
    contract_type: 'third_party', daily_rate: 0, currency: 'EUR',
    commission_onsite: 0, commission_pretour: 0,
    comment: '', active: true, photo_url: '',
    id_guide: undefined,
    availability: [], evaluations: [],
  });

  // sort state para Grupos asignados
  const [assSortBy, setAssSortBy] = useState('start_date');
  const [assOrder, setAssOrder] = useState('desc');

  // Carga del guía
  useEffect(() => {
    let abort = false;
    if (isNew) return;
    setLoading(true);
    fetch(`${API_URL}/guides/${id}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('No se pudo cargar el guía'))))
      .then(data => { if (abort) return;
        setForm(f => ({
          ...f, ...data,
          languages: Array.isArray(data.languages) ? data.languages : [],
          daily_rate: data.daily_rate ?? 0,
          commission_onsite: data.commission_onsite ?? 0,
          commission_pretour: data.commission_pretour ?? 0,
          active: !!data.active,
        }));
        setImgError(false);
      })
      .catch(e => !abort && setError(e.message))
      .finally(() => !abort && setLoading(false));
    return () => { abort = true; };
  }, [API_URL, id, isNew]);

  // Derivados
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const assignmentsRaw = useMemo(() => (form.availability || []).filter(a => a.id_group), [form.availability]);
  const unavailability = useMemo(() => (form.availability || []).filter(a => !a.id_group), [form.availability]);

  const sortedAssignments = useMemo(() => {
    const arr = [...assignmentsRaw];
    arr.sort((a,b) => {
      let av = a[assSortBy];
      let bv = b[assSortBy];
      if (assSortBy.includes('date')) {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      } else if (typeof av === 'string' && typeof bv === 'string') {
        const cmp = av.localeCompare(bv);
        return assOrder === 'asc' ? cmp : -cmp;
      }
      if (av === bv) return 0;
      return assOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return arr;
  }, [assignmentsRaw, assSortBy, assOrder]);

  const groupsFinished = useMemo(() => assignmentsRaw.filter(a => new Date(a.end_date) < today).length, [assignmentsRaw, today]);
  const currentGroup = useMemo(() => assignmentsRaw.find(a => {
    const s = new Date(a.start_date); const e = new Date(a.end_date);
    s.setHours(0,0,0,0); e.setHours(0,0,0,0); return s <= today && e >= today;
  }), [assignmentsRaw, today]);
  const nextGroup = useMemo(() => {
    const future = assignmentsRaw.filter(a => new Date(a.start_date) > today);
    future.sort((a,b) => new Date(a.start_date) - new Date(b.start_date));
    return future[0];
  }, [assignmentsRaw, today]);

  // Helpers
  const onField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const onLanguages = (e) => {
    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setForm(f => ({ ...f, languages: arr }));
  };

  // Indisponibilidad CRUD (sólo en edición)
  const addUnavailability = () => {
    if (!isEditing) return;
    setForm(f => ({
      ...f,
      availability: [...(f.availability || []), {
        start_date: '', end_date: '', status: 'vacation', id_group: '', notes: '',
        id_availability: `tmp-${Date.now()}`
      }]
    }));
  };
  const updUnavailability = (idxInAll, field, value) => {
    if (!isEditing) return;
    setForm(f => ({ ...f, availability: f.availability.map((a,i)=> i===idxInAll? { ...a, [field]: value } : a) }));
  };
  const delUnavailability = (idxInAll) => {
    if (!isEditing) return;
    setForm(f => ({ ...f, availability: f.availability.filter((_,i)=> i!==idxInAll) }));
  };

  // Edit mode controls
  const startEdit = () => {
    if (!canEdit) return;
    backupRef.current = JSON.parse(JSON.stringify(form));
    setIsEditing(true);
  };
  const cancelEdit = () => {
    if (backupRef.current) setForm(backupRef.current);
    setIsEditing(false);
  };

  const save = async () => {
    setSaving(true); setError(null);
    const payload = {
      ...form,
      birth_date: toISODate(form.birth_date),
      passport_expiry: toISODate(form.passport_expiry),
      license_expiry: toISODate(form.license_expiry),
      availability: (form.availability || []).map(a => ({
        ...a,
        start_date: toISODate(a.start_date),
        end_date: toISODate(a.end_date),
      }))
    };
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? `${API_URL}/guides` : `${API_URL}/guides/${form.id_guide || id}`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('No se pudo guardar el guía');
      const saved = await res.json();
      setIsEditing(false);
      if (isNew) navigate(`/tour-leaders/${saved.id_guide}`);
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  // Guarda/actualiza un periodo de indisponibilidad vía API específica
  const saveUnavailability = async (idxInAll) => {
    try {
      const a = form.availability[idxInAll];
      if (!a) return;
      const body = {
        start_date: toISODate(a.start_date),
        end_date: toISODate(a.end_date),
        status: a.status || 'unavailable',
        id_group: '', // siempre sin grupo en esta pestaña
        notes: a.notes || '',
        modified_by: 'UI'
      };
      let res;
      if (a.id_availability && !String(a.id_availability).startsWith('tmp-')) {
        // UPDATE
        res = await fetch(`${API_URL}/guides/availability/${a.id_availability}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...body, id_availability: a.id_availability }) });
      } else {
        // CREATE
        const guideId = form.id_guide || id;
        res = await fetch(`${API_URL}/guides/${guideId}/availability`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      }
      if (!res.ok) throw new Error('No se pudo guardar la indisponibilidad');
      // Recargar datos del guía para reflejar IDs/estado real
      const r2 = await fetch(`${API_URL}/guides/${form.id_guide || id}`);
      if (r2.ok) {
        const data = await r2.json();
        setForm(f => ({ ...f, ...data, languages: Array.isArray(data.languages)? data.languages : [] }));
      }
    } catch (e) {
      setError(e.message);
    }
  };

  // helpers UI
  const renderAssSortIcon = (col) => assSortBy === col ? (
    <i className={`fas fa-sort-${assOrder === 'asc' ? 'up' : 'down'} ms-1`} />
  ) : null;
  const handleAssSort = (col) => {
    if (assSortBy === col) setAssOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setAssSortBy(col); setAssOrder('desc'); } // por defecto descendente
  };

  // Fallback avatar: iniciales
  const initials = (form.name?.[0] || '') + (form.surname?.[0] || '');

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;

  return (
    <div className="container-fluid">
      {/* Header acciones */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Perfil del Tour Leader</h2>
        <div className="d-flex gap-2">
          <Button variant="secondary" className="btn-custom" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-1"></i> Volver
          </Button>
          {!isEditing ? (
            <Button variant="outline-primary" className="btn-custom" onClick={startEdit} disabled={!canEdit}>
              <i className="fas fa-pen me-1"></i> Editar
            </Button>
          ) : (
            <>
              <Button variant="outline-secondary" className="btn-custom" onClick={cancelEdit} disabled={saving}>Cancelar</Button>
              <Button variant="primary" className="btn-custom" onClick={save} disabled={saving}>{saving? 'Guardando…':'Guardar'}</Button>
            </>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Cabecera con foto y KPIs + datos rápidos */}
      <Row className="mb-3 g-3">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3 d-flex align-items-center justify-content-center" style={{height: 180}}>
                {form.photo_url && !imgError ? (
                  <img src={form.photo_url} alt="foto" className="img-fluid rounded" onError={() => setImgError(true)} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 140, height: 140, background:'#eef1f8', border:'1px solid #dee2e6' }}>
                    <i className="fas fa-user fa-3x text-muted" title={initials.toUpperCase()}></i>
                  </div>
                )}
              </div>
              <Form.Group>
                <Form.Label>URL de foto (opcional)</Form.Label>
                <Form.Control name="photo_url" value={form.photo_url || ''} onChange={onField} disabled={!isEditing} placeholder="https://..." />
              </Form.Group>
              <Form.Check className="mt-3" type="switch" id="activeSwitch" name="active" label="Activo" checked={!!form.active} onChange={onField} disabled={!isEditing} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          <Card className="h-100">
            <Card.Body>
              <Row className="g-2">
                <Col md={4}><Badge bg="light" text="dark" className="w-100 text-start">Grupos finalizados: <strong>{groupsFinished}</strong></Badge></Col>
                <Col md={4}><Badge bg="light" text="dark" className="w-100 text-start">Grupo actual: <strong>{currentGroup?.id_group || '-'}</strong></Badge></Col>
                <Col md={4}><Badge bg="light" text="dark" className="w-100 text-start">Próximo grupo: <strong>{nextGroup?.id_group || '-'} </strong></Badge></Col>
              </Row>
              <hr />
              <Row className="g-2 small">
                <Col md={4}><div><strong>Nombre:</strong> {form.name || '-'}</div></Col>
                <Col md={4}><div><strong>Apellido:</strong> {form.surname || '-'}</div></Col>
                <Col md={4}><div><strong>Teléfono:</strong> {form.phone || '-'}</div></Col>
                <Col md={4}><div><strong>Email:</strong> {form.mail || '-'}</div></Col>
                <Col md={4}><div><strong>Pasaporte:</strong> {form.passport_number || '-'}</div></Col>
                <Col md={4}><div><strong>Licencia:</strong> {form.license_number || '-'}</div></Col>
                <Col md={4}><div><strong>Ciudad:</strong> {form.city_name || '-'}</div></Col>
                <Col md={4}><div><strong>Nacimiento:</strong> {formatDate(form.birth_date)}</div></Col>
                <Col md={4}><div><strong>Contrato:</strong> {CONTRACT_TYPES.find(ct=>ct.value===form.contract_type)?.label || form.contract_type || '-'}</div></Col>
                <Col md={4}><div><strong>Tarifa:</strong> {form.daily_rate} {form.currency}</div></Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pestañas principales */}
      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k || 'summary')} className="mb-3">
        {/* RESUMEN */}
        <Tab eventKey="summary" title="Resumen">
          <Card className="mb-3">
            <Card.Header><strong>Datos personales</strong></Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control name="name" value={form.name} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control name="surname" value={form.surname} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Fecha Nacimiento</Form.Label>
                    <Form.Control type="date" name="birth_date" value={form.birth_date || ''} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control name="phone" value={form.phone} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="mail" value={form.mail} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Nacionalidad</Form.Label>
                    <Form.Control name="nationality" value={form.nationality || ''} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ciudad</Form.Label>
                    <Form.Control name="city_name" value={form.city_name || ''} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Idiomas (separados por coma)</Form.Label>
                    <Form.Control value={(form.languages || []).join(', ')} onChange={onLanguages} disabled={!isEditing} placeholder="Español, Inglés, Francés" />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Documentación */}
          <Card className="mb-3">
            <Card.Header><strong>Documentación</strong></Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Pasaporte</Form.Label>
                    <InputGroup>
                      <Form.Control name="passport_number" value={form.passport_number || ''} onChange={onField} disabled={!isEditing} />
                      <Button variant="outline-secondary" onClick={() => navigator.clipboard.writeText(form.passport_number || '')} title="Copiar"><i className="far fa-copy"></i></Button>
                      <Button variant="outline-primary" title="Adjuntar/Ver foto de pasaporte" disabled>
                        <i className="far fa-image me-1"></i> Pasaporte (foto)
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Vencimiento</Form.Label>
                    <Form.Control type="date" name="passport_expiry" value={form.passport_expiry || ''} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Licencia</Form.Label>
                    <InputGroup>
                      <Form.Control name="license_number" value={form.license_number || ''} onChange={onField} disabled={!isEditing} />
                      <Button variant="outline-secondary" onClick={() => navigator.clipboard.writeText(form.license_number || '')} title="Copiar"><i className="far fa-copy"></i></Button>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Vencimiento</Form.Label>
                    <Form.Control type="date" name="license_expiry" value={form.license_expiry || ''} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Laboral */}
          <Card className="mb-3">
            <Card.Header><strong>Laboral</strong></Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tipo de Contrato</Form.Label>
                    <Form.Select name="contract_type" value={form.contract_type} onChange={onField} disabled={!isEditing}>
                      {CONTRACT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tarifa base por día</Form.Label>
                    <InputGroup>
                      <Form.Control type="number" step="0.01" name="daily_rate" value={form.daily_rate} onChange={onField} disabled={!isEditing} />
                      <Form.Select name="currency" value={form.currency} onChange={onField} disabled={!isEditing} style={{ maxWidth: 120 }}>
                        {FAVORITE_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        {ALL_CURRENCIES.filter(c => !FAVORITE_CURRENCIES.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Comisión On-Site (%)</Form.Label>
                    <Form.Control type="number" step="0.01" name="commission_onsite" value={form.commission_onsite} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Comisión Pre-Tour (%)</Form.Label>
                    <Form.Control type="number" step="0.01" name="commission_pretour" value={form.commission_pretour} onChange={onField} disabled={!isEditing} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header><strong>Comentarios</strong></Card.Header>
            <Card.Body>
              <Form.Control as="textarea" rows={3} name="comment" value={form.comment || ''} onChange={onField} disabled={!isEditing} />
            </Card.Body>
          </Card>
        </Tab>

        {/* GRUPOS ASIGNADOS */}
        <Tab eventKey="assigned" title="Grupos asignados">
          <Card className="mb-3">
            <Card.Body>
              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th style={HEADER_BG} onClick={() => handleAssSort('id_group')}>Grupo {renderAssSortIcon('id_group')}</th>
                    <th style={HEADER_BG} onClick={() => handleAssSort('circuit_name')}>Circuito {renderAssSortIcon('circuit_name')}</th>
                    <th style={HEADER_BG} onClick={() => handleAssSort('status')}>Estado {renderAssSortIcon('status')}</th>
                    <th style={HEADER_BG} onClick={() => handleAssSort('start_date')}>Inicio {renderAssSortIcon('start_date')}</th>
                    <th style={HEADER_BG} onClick={() => handleAssSort('end_date')}>Fin {renderAssSortIcon('end_date')}</th>
                    <th style={HEADER_BG} onClick={() => handleAssSort('notes')}>Notas {renderAssSortIcon('notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAssignments.length ? sortedAssignments.map(a => (
                    <tr key={a.id_availability}>
                      <td>{a.id_group}</td>
                      <td>{a.circuit_name || '-'}</td>
                      <td>{a.status || '-'}</td>
                      <td>{formatDate(a.start_date)}</td>
                      <td>{formatDate(a.end_date)}</td>
                      <td>{a.notes || '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="text-center text-muted">Sin asignaciones.</td></tr>
                  )}
                </tbody>
              </Table>
              <div className="text-muted small">* El circuito y las fechas provienen del grupo y no son editables.</div>
            </Card.Body>
          </Card>
        </Tab>

        {/* INDISPONIBILIDAD / VACACIONES */}
        <Tab eventKey="unavail" title="Indisponibilidad">
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Vacaciones / Indisponibilidad (sin grupo)</strong>
              <div>
                <Button variant="outline-primary" size="sm" onClick={addUnavailability} disabled={!isEditing}><i className="fas fa-plus me-1"></i> Añadir periodo</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th style={HEADER_BG}>Estado</th>
                    <th style={HEADER_BG}>Desde</th>
                    <th style={HEADER_BG}>Hasta</th>
                    <th style={HEADER_BG}>Notas</th>
                    <th style={HEADER_BG}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(unavailability || []).map((a, idx) => {
                    // necesitamos el índice real en availability para editar/borrar
                    const realIndex = form.availability.findIndex(x => x === a);
                    return (
                      <tr key={a.id_availability || `u-${idx}`}>
                        <td>{isEditing ? (
                          <Form.Select value={a.status || ''} onChange={e => updUnavailability(realIndex, 'status', e.target.value)}>
                            <option value="vacation">vacation</option>
                            <option value="unavailable">unavailable</option>
                            <option value="holiday">holiday</option>
                          </Form.Select>
                        ) : (a.status || '-')}</td>
                        <td>{isEditing ? (
                          <Form.Control type="date" value={toISODate(a.start_date) || ''} onChange={e => updUnavailability(realIndex, 'start_date', toISODate(e.target.value))} />
                        ) : (formatDate(a.start_date))}</td>
                        <td>{isEditing ? (
                          <Form.Control type="date" value={toISODate(a.end_date) || ''} onChange={e => updUnavailability(realIndex, 'end_date', toISODate(e.target.value))} />
                        ) : (formatDate(a.end_date))}</td>
                        <td>{isEditing ? (
                          <Form.Control value={a.notes || ''} onChange={e => updUnavailability(realIndex, 'notes', e.target.value)} />
                        ) : (a.notes || '-')}</td>
                        <td className="text-nowrap">
                          <Button variant="outline-success" size="sm" className="me-2" onClick={() => saveUnavailability(realIndex)} disabled={!isEditing}>
                            <i className="fas fa-save"></i>
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => delUnavailability(realIndex)} disabled={!isEditing}>
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!unavailability || unavailability.length === 0) && (
                    <tr><td colSpan={5} className="text-center text-muted">Sin periodos de indisponibilidad.</td></tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* CALENDARIO (mensual) */}
        <Tab eventKey="calendar" title="Calendario">
          <TLCalendar assignments={assignmentsRaw} unavailability={unavailability} />
        </Tab>

        {/* EVALUACIONES */}
        <Tab eventKey="evaluations" title="Evaluaciones">
          <Card className="mb-3">
            <Card.Body>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th style={HEADER_BG}>Fecha</th>
                    <th style={HEADER_BG}>Puntaje</th>
                    <th style={HEADER_BG}>Fuente</th>
                    <th style={HEADER_BG}>Grupo</th>
                    <th style={HEADER_BG}>Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {(form.evaluations || []).map(ev => (
                    <tr key={ev.id_eval}>
                      <td>{formatDate(ev.created_at)}</td>
                      <td>{ev.rating}</td>
                      <td>{ev.source}</td>
                      <td>{ev.id_group}</td>
                      <td>{ev.comment}</td>
                    </tr>
                  ))}
                  {(!form.evaluations || form.evaluations.length === 0) && (
                    <tr><td colSpan={5} className="text-center text-muted">Sin evaluaciones.</td></tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* ESTADÍSTICAS (placeholder) */}
        <Tab eventKey="stats" title="Estadísticas">
          <Card className="mb-5">
            <Card.Body>
              <p className="text-muted">Próximamente: métricas (promedio de ventas, tasa de conversión, antigüedad, etc.).</p>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
