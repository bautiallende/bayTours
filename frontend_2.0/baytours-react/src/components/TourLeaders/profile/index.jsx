import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Spinner, Modal, Form, Nav, Tab } from 'react-bootstrap';

import { TLPhotoCard, TLInfoCard } from './TLHeaderCard';
import { toISODate } from './utils';

import SummaryTab from './tabs/SummaryTab';
import AssignedTab from './tabs/AssignedTab';
import UnavailabilityTab from './tabs/UnavailabilityTab';
import CalendarTab from './tabs/CalendarTab';
import EvaluationsTab from './tabs/EvaluationsTab';
import StatsTab from './tabs/StatsTab';

const CONTRACT_LABEL = (value) =>
  value === 'employee' ? 'Empleado' : value === 'third_party' ? 'Tercerizado' : value;

export default function TourLeaderProfile() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { id } = useParams(); // id_guide o '0' para nuevo
  const navigate = useNavigate();

  const isNew = id === '0' || id === 0;

  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const [imgError, setImgError] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');

  const [form, setForm] = useState({
    name: '',
    surname: '',
    phone: '',
    mail: '',
    birth_date: '',
    id_city: '',
    city_name: '',
    nationality: '',
    languages: [],
    passport_number: '',
    passport_expiry: '',
    license_number: '',
    license_expiry: '',
    contract_type: 'third_party',
    daily_rate: 0,
    currency: 'EUR',
    commission_onsite: 0,
    commission_pretour: 0,
    comment: '',
    active: true,
    photo_url: '',
    id_guide: undefined,
    availability: [],
    evaluations: [],
    contract_type_label: '',
  });

  // Ordenamiento para Asignaciones (en memoria)
  const [assSortBy, setAssSortBy] = useState('start_date');
  const [assOrder, setAssOrder] = useState('desc');

  // --- Refs para acciones de tabs (filtro/export) ---
  const assignedRef = useRef(null);
  const unavailRef = useRef(null);
  const evalsRef = useRef(null);

  // Carga del guía
  useEffect(() => {
    let abort = false;
    if (isNew) return; // crear nuevo: se verá vacío hasta que implementemos creación desde aquí
    setLoading(true);
    fetch(`${API_URL}/guides/by_id/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('No se pudo cargar el guía'))))
      .then((data) => {
        if (abort) return;
        setForm((f) => ({
          ...f,
          ...data,
          languages: Array.isArray(data.languages) ? data.languages : [],
          daily_rate: data.daily_rate ?? 0,
          commission_onsite: data.commission_onsite ?? 0,
          commission_pretour: data.commission_pretour ?? 0,
          active: !!data.active,
          contract_type_label: CONTRACT_LABEL(data.contract_type),
        }));
        setImgError(false);
      })
      .catch((e) => !abort && setError(e.message))
      .finally(() => !abort && setLoading(false));
    return () => {
      abort = true;
    };
  }, [API_URL, id, isNew]);

  // Derivados
  const assignmentsRaw = useMemo(
    () => (form.availability || []).filter((a) => a.id_group),
    [form.availability]
  );
  const unavailability = useMemo(
    () => (form.availability || []).filter((a) => !a.id_group),
    [form.availability]
  );

  const sortedAssignments = useMemo(() => {
    const arr = [...assignmentsRaw];
    arr.sort((a, b) => {
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
      return assOrder === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
    return arr;
  }, [assignmentsRaw, assSortBy, assOrder]);

  // KPIs
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const groupsFinished = useMemo(
    () => assignmentsRaw.filter((a) => new Date(a.end_date) < today).length,
    [assignmentsRaw, today]
  );
  const currentGroup = useMemo(() => {
    return assignmentsRaw.find((a) => {
      const s = new Date(a.start_date);
      const e = new Date(a.end_date);
      s.setHours(0, 0, 0, 0);
      e.setHours(0, 0, 0, 0);
      return s <= today && e >= today;
    });
  }, [assignmentsRaw, today]);
  const nextGroup = useMemo(() => {
    const future = assignmentsRaw.filter((a) => new Date(a.start_date) > today);
    future.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    return future[0];
  }, [assignmentsRaw, today]);

  // Handlers comunes
  const onField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const onLanguages = (e) => {
    const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
    setForm((f) => ({ ...f, languages: arr }));
  };

  // Indisponibilidad CRUD
  const addUnavailability = () => {
    setForm((f) => ({
      ...f,
      availability: [
        ...(f.availability || []),
        {
          start_date: '',
          end_date: '',
          status: 'vacation',
          id_group: '',
          notes: '',
          id_availability: `tmp-${Date.now()}`,
        },
      ],
    }));
  };
  const updUnavailability = (idxInAll, field, value) => {
    setForm((f) => ({
      ...f,
      availability: f.availability.map((a, i) => (i === idxInAll ? { ...a, [field]: value } : a)),
    }));
  };
  const delUnavailability = (idxInAll) => {
    setForm((f) => ({
      ...f,
      availability: f.availability.filter((_, i) => i !== idxInAll),
    }));
  };
  const saveUnavailability = async (idxInAll) => {
    try {
      const a = form.availability[idxInAll];
      if (!a) return;
      const body = {
        start_date: toISODate(a.start_date),
        end_date: toISODate(a.end_date),
        status: a.status || 'unavailable',
        id_group: '',
        notes: a.notes || '',
        modified_by: 'UI',
      };
      let res;
      if (a.id_availability && !String(a.id_availability).startsWith('tmp-')) {
        // UPDATE
        res = await fetch(`${API_URL}/guides/availability/${a.id_availability}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, id_availability: a.id_availability }),
        });
      } else {
        // CREATE
        const guideId = form.id_guide || id;
        res = await fetch(`${API_URL}/guides/${guideId}/availability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error('No se pudo guardar la indisponibilidad');
      // Refrescar datos del guía
      const r2 = await fetch(`${API_URL}/guides/${form.id_guide || id}`);
      if (r2.ok) {
        const data = await r2.json();
        setForm((f) => ({
          ...f,
          ...data,
          languages: Array.isArray(data.languages) ? data.languages : [],
          contract_type_label: CONTRACT_LABEL(data.contract_type),
        }));
      }
    } catch (e) {
      setError(e.message);
    }
  };

  // Orden UI para la tabla de asignaciones
  const renderAssSortIcon = (col) =>
    assSortBy === col ? <i className={`fas fa-sort-${assOrder === 'asc' ? 'up' : 'down'} ms-1`} /> : null;
  const handleAssSort = (col) => {
    if (assSortBy === col) setAssOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setAssSortBy(col);
      setAssOrder('desc');
    }
  };

  // Foto: modal
  const openPhotoModal = () => {
    setPhotoPreviewUrl(form.photo_url || '');
    setShowPhotoModal(true);
  };
  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };
  const savePhotoFromModal = async () => {
    if (!photoPreviewUrl) {
      closePhotoModal();
      return;
    }
    // Actualiza local
    setForm((f) => ({ ...f, photo_url: photoPreviewUrl }));
    // Persiste silenciosamente
    try {
      const url = `${API_URL}/guides/${form.id_guide || id}`;
      const payload = { ...form, photo_url: photoPreviewUrl };
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      /* noop */
    }
    closePhotoModal();
  };

  // --- Acciones de pestañas (Filtro / Exportar) ---
  const showTabActions =
    activeTab === 'assigned' || activeTab === 'unavail' || activeTab === 'evaluations';

  const onClickFilter = () => {
    if (activeTab === 'assigned') assignedRef.current?.openFilter?.();
    else if (activeTab === 'unavail') unavailRef.current?.openFilter?.();
    else if (activeTab === 'evaluations') evalsRef.current?.openFilter?.();
  };
  const onClickExport = () => {
    if (activeTab === 'assigned') assignedRef.current?.exportCSV?.();
    else if (activeTab === 'unavail') unavailRef.current?.exportCSV?.();
    else if (activeTab === 'evaluations') evalsRef.current?.exportCSV?.();
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;

  return (
    <div className="container-fluid">
      {/* Header: título + volver */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          Perfil del Tour Leader: <u><b>{form.name || '-'} {form.surname || ''}</b></u>
        </h2>
        <div className="d-flex gap-2">
          <Button variant="secondary" className="btn-custom" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-1"></i> Volver
          </Button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Encabezado compacto: foto (md=2) + info (md=10) */}
      <Row className="mb-3 g-3">
        <Col md={2}>
          <TLPhotoCard
            form={form}
            imgError={imgError}
            setImgError={setImgError}
            onPhotoClick={openPhotoModal}
          />
        </Col>
        <Col md={10}>
          <TLInfoCard
            form={form}
            kpis={{
              groupsFinished,
              currentGroupId: currentGroup?.id_group,
              nextGroupId: nextGroup?.id_group,
            }}
          />
        </Col>
      </Row>

      {/* Contenedor de pestañas + acciones a la derecha */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'summary')}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Nav variant="tabs" className="flex-grow-1">
            <Nav.Item>
              <Nav.Link eventKey="summary">Resumen</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="assigned">Grupos asignados</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="unavail">Indisponibilidad</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="calendar">Calendario</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="evaluations">Evaluaciones</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="stats">Estadísticas</Nav.Link>
            </Nav.Item>
          </Nav>

          {/* Botones a la derecha de la fila de pestañas */}
          <div className="ms-3 d-flex">
            {showTabActions && (
              <>
                <Button
                  variant="outline-secondary"
                  className="btn-custom me-2"
                  onClick={onClickFilter}
                >
                  <i className="fas fa-filter me-1"></i> Filtro
                </Button>
                <Button
                  variant="outline-success"
                  className="btn btn-custom"
                  onClick={onClickExport}
                >
                  <i className="fas fa-file-export me-1"></i> Exportar
                </Button>
              </>
            )}
          </div>
        </div>

        <Tab.Content className="pt-3">
          <Tab.Pane eventKey="summary">
            <SummaryTab form={form} isEditing={false} onField={onField} onLanguages={onLanguages} />
          </Tab.Pane>

          <Tab.Pane eventKey="assigned">
            <AssignedTab
              ref={assignedRef} // expone openFilter/exportCSV/clearFilters (según versión más reciente)
              assignments={sortedAssignments}
              assSortBy={assSortBy}
              assOrder={assOrder}
              handleAssSort={handleAssSort}
              renderAssSortIcon={renderAssSortIcon}
            />
          </Tab.Pane>

          <Tab.Pane eventKey="unavail">
            <UnavailabilityTab
              /* Si dentro del tab asignás: externalRef?.current = { openFilter(){}, exportCSV(){} } */
              externalRef={unavailRef}
              unavailability={unavailability}
              form={form}
              isEditing={false}
              addUnavailability={addUnavailability}
              updUnavailability={updUnavailability}
              delUnavailability={delUnavailability}
              saveUnavailability={saveUnavailability}
            />
          </Tab.Pane>

          <Tab.Pane eventKey="calendar">
            <CalendarTab assignments={assignmentsRaw} unavailability={unavailability} />
          </Tab.Pane>

          <Tab.Pane eventKey="evaluations">
            <EvaluationsTab
              /* Igual: dentro del tab podés asignar externalRef?.current = { openFilter(){}, exportCSV(){} } */
              externalRef={evalsRef}
              evaluations={form.evaluations || []}
            />
          </Tab.Pane>

          <Tab.Pane eventKey="stats">
            <StatsTab />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Modal de foto */}
      <Modal show={showPhotoModal} onHide={closePhotoModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Foto del guía</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-md-6 d-flex align-items-center justify-content-center">
              <div className="border rounded p-2" style={{ width: '100%', textAlign: 'center' }}>
                {photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt="preview"
                    style={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain' }}
                  />
                ) : (
                  <div className="text-muted">Sin vista previa</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Pegar URL de imagen</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://..."
                  value={photoPreviewUrl}
                  onChange={(e) => setPhotoPreviewUrl(e.target.value)}
                />
                <div className="form-text">
                  Por ahora guardamos fotos vía URL. La subida de archivos la activamos cuando definas el endpoint.
                </div>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closePhotoModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={savePhotoFromModal} disabled={!photoPreviewUrl}>
            Guardar foto
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}