import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, InputGroup, Button, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { toISODate } from '../utils';

// Lista simple de monedas
const FAVORITE_CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP'];
const ALL_CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP', 'ARS', 'JPY', 'CNY', 'INR', 'BRL', 'CAD'];

/** Intenta obtener un array de comentarios desde form.comments o form.comment (string JSON) */
function parseCommentsFromForm(form) {
  if (Array.isArray(form?.comments)) return form.comments;
  const c = form?.comment;
  if (Array.isArray(c)) return c;
  if (typeof c === 'string') {
    // 1) Intento JSON.parse
    try {
      const arr = JSON.parse(c);
      if (Array.isArray(arr)) return arr;
    } catch (_) {}
    // 2) Fallback tosco: intentar desarmar algo tipo ["...", "..."]
    const stripped = c.trim();
    if (stripped.startsWith('[') && stripped.endsWith(']')) {
      const parts = stripped
        .slice(1, -1) // quita [ ]
        .split(/"\s*,\s*"/) // separa por ","
        .map(s => s.replace(/^"+|"+$/g, '').trim())
        .filter(Boolean);
      if (parts.length) return parts;
    }
    // 3) Último recurso: separar por saltos de línea
    const lines = stripped.split('\n').map(s => s.trim()).filter(Boolean);
    if (lines.length) return lines;
  }
  return [];
}

export default function SummaryTab({
  form,
  onField,
  onLanguages, // recibe e.target.value como string "ES, EN"
}) {
  const API_URL = process.env.REACT_APP_API_URL;
  const { id } = useParams(); // '0' si es creación
  const isNew = id === '0' || id === 0;

  // Edit flags por sección (nuevo: personales empiezan editables)
  const [editPersonal, setEditPersonal] = useState(isNew);
  const [editDocs, setEditDocs] = useState(false);
  const [editJob, setEditJob] = useState(false);
  const [editComments, setEditComments] = useState(false);

  // Guardado por sección
  const [saving, setSaving] = useState(null); // 'personal' | 'docs' | 'job' | 'comments' | null
  const [errorMsg, setErrorMsg] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  // Idiomas: texto crudo para permitir comas sin “limpieza”
  const [langText, setLangText] = useState((form.languages || []).join(', '));
  useEffect(() => {
    setLangText((form.languages || []).join(', '));
  }, [form.languages]);

  // Comentarios: lista y nuevo comentario (parseo robusto desde form)
  const [localComments, setLocalComments] = useState(parseCommentsFromForm(form));
  const [newComment, setNewComment] = useState('');
  useEffect(() => {
    setLocalComments(parseCommentsFromForm(form));
  }, [form.comment, form.comments]);

  // Ciudades (para selector con búsqueda)
  const [allCities, setAllCities] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  useEffect(() => {
    let abort = false;
    fetch(`${API_URL}/cities/`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('No se pudieron cargar las ciudades'))))
      .then(data => { if (!abort) setAllCities(Array.isArray(data) ? data : []); })
      .catch(() => { if (!abort) setAllCities([]); });
    return () => { abort = true; };
  }, [API_URL]);

  const filteredCities = useMemo(() => {
    const q = cityFilter.trim().toLowerCase();
    if (!q) return allCities;
    return allCities.filter(c =>
      String(c.name).toLowerCase().includes(q) ||
      String(c.country).toLowerCase().includes(q)
    );
  }, [allCities, cityFilter]);

  const handleSelectCity = (e) => {
    const selectedId = Number(e.target.value || 0);
    const c = allCities.find(x => x.id === selectedId);
    onField({ target: { name: 'id_city', value: selectedId } });
    onField({ target: { name: 'city_name', value: c ? c.name : '' } });
  };

  // Validación email
  const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());

  // Validación de personales (obligatorios)
  const personalInvalids = useMemo(() => {
    const invalid = {};
    const req = (v) => !v || String(v).trim() === '';
    if (req(form.name)) invalid.name = true;
    if (req(form.surname)) invalid.surname = true;
    if (req(form.birth_date)) invalid.birth_date = true;
    if (req(form.phone)) invalid.phone = true;
    if (req(form.mail) || !isValidEmail(form.mail)) invalid.mail = true;
    if (req(form.nationality)) invalid.nationality = true;
    return invalid;
  }, [form.name, form.surname, form.birth_date, form.phone, form.mail, form.nationality]);

  // Aplica el texto de idiomas al form del padre
  const commitLanguages = () => {
    const value = String(langText || '');
    onLanguages({ target: { value } });
  };

  const validateBeforeSave = (section) => {
    if (section === 'personal') {
      if (Object.keys(personalInvalids).length) {
        setErrorMsg('Por favor completa los campos obligatorios en “Datos personales” y revisa el formato del email.');
        return false;
      }
    }
    return true;
  };

  const saveSection = async (section) => {
    setErrorMsg(null);
    setOkMsg(null);

    if (!validateBeforeSave(section)) return;

    setSaving(section);

    // Idiomas a array desde el langText
    const languagesFromText = String(langText || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Si guardamos personales, sincronizamos idiomas al padre
    if (section === 'personal') commitLanguages();

    // Payload según especificación (sin 'comment' por defecto)
    const payload = {
      name: String(form.name || '').trim(),
      surname: String(form.surname || '').trim(),
      phone: String(form.phone || '').trim(),
      mail: String(form.mail || '').trim(),
      birth_date: toISODate(form.birth_date),
      id_city: form.id_city || 0,
      nationality: String(form.nationality || '').trim(),
      languages: languagesFromText,
      passport_number: String(form.passport_number || '').trim(),
      passport_expiry: toISODate(form.passport_expiry) || undefined,
      license_number: String(form.license_number || '').trim(),
      license_expiry: toISODate(form.license_expiry) || undefined,
      contract_type: form.contract_type || 'third_party',
      daily_rate: Number(form.daily_rate ?? 0),
      currency: form.currency || 'EUR',
      commission_onsite: Number(form.commission_onsite ?? 0),
      commission_pretour: Number(form.commission_pretour ?? 0),
      active: !!form.active,
      photo_url: String(form.photo_url || ''),
      updated_by: 'UI',
    };

    // Solo agregamos 'comment' si hay comentario nuevo y estamos guardando esa sección
    if (section === 'comments') {
      const nc = newComment.trim();
      if (nc) payload.comment = nc;
    }

    try {
      // POST /guides si es nuevo, sino PATCH /guides/{id}
      const url = isNew
        ? `${API_URL}/guides`
        : `${API_URL}/guides/${form.id_guide || id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('No se pudo guardar la información');

      setOkMsg('Cambios guardados correctamente.');

      // Si guardamos comentario, lo reflejamos localmente (como lo hace el back)
      if (section === 'comments' && newComment.trim()) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const stamp = `(${dd}/${mm}/${yy} ${hh}:${mi}) - ${newComment.trim()}`;
        setLocalComments((prev) => [stamp, ...prev]); // nuevo arriba
        setNewComment('');
      }

      if (section === 'personal') setEditPersonal(false);
      if (section === 'docs') setEditDocs(false);
      if (section === 'job') setEditJob(false);
      if (section === 'comments') setEditComments(false);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setSaving(null);
    }
  };

  const headerWithEdit = (title, sectionKey, isEditing) => (
    <div className="d-flex justify-content-between align-items-center">
      <strong>{title}</strong>
      <div className="d-flex gap-2">
        {!isEditing ? (
          <Button
            size="sm"
            variant="outline-primary"
            className="btn-custom"
            onClick={() => {
              if (sectionKey === 'personal') setEditPersonal(true);
              if (sectionKey === 'docs') setEditDocs(true);
              if (sectionKey === 'job') setEditJob(true);
              if (sectionKey === 'comments') setEditComments(true);
            }}
          >
            <i className="fas fa-pen"></i>
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline-secondary"
              className="btn-custom"
              onClick={() => {
                if (sectionKey === 'personal') setEditPersonal(false);
                if (sectionKey === 'docs') setEditDocs(false);
                if (sectionKey === 'job') setEditJob(false);
                if (sectionKey === 'comments') setEditComments(false);
              }}
              disabled={saving === sectionKey}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="btn-custom"
              onClick={() => saveSection(sectionKey)}
              disabled={saving === sectionKey}
            >
              {saving === sectionKey ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {errorMsg && <Alert variant="danger" className="mb-2">{errorMsg}</Alert>}
      {okMsg && <Alert variant="success" className="mb-2">{okMsg}</Alert>}

      {/* DATOS PERSONALES */}
      <Card className="mb-3">
        <Card.Header>{headerWithEdit('Datos personales', 'personal', editPersonal)}</Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name || ''}
                  onChange={onField}
                  disabled={!editPersonal}
                  isInvalid={editPersonal && !!personalInvalids.name}
                />
                <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  name="surname"
                  value={form.surname || ''}
                  onChange={onField}
                  disabled={!editPersonal}
                  isInvalid={editPersonal && !!personalInvalids.surname}
                />
                <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fecha Nacimiento *</Form.Label>
                <Form.Control
                  type="date"
                  name="birth_date"
                  value={form.birth_date || ''}
                  onChange={onField}
                  disabled={!editPersonal}
                  isInvalid={editPersonal && !!personalInvalids.birth_date}
                />
                <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control
                  name="phone"
                  value={form.phone || ''}
                  onChange={onField}
                  disabled={!editPersonal}
                  isInvalid={editPersonal && !!personalInvalids.phone}
                />
                <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="mail"
                  value={form.mail || ''}
                  onChange={onField}
                  disabled={!editPersonal}
                  isInvalid={editPersonal && (!!personalInvalids.mail || (form.mail && !isValidEmail(form.mail)))}
                  placeholder="nombre@dominio.com"
                />
                <Form.Control.Feedback type="invalid">
                  Ingresá un email válido (ej: nombre@dominio.com).
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nacionalidad *</Form.Label>
                <Form.Control
                  name="nationality"
                  value={form.nationality || ''}
                  onChange={onField}
                  disabled={!editPersonal}
                  isInvalid={editPersonal && !!personalInvalids.nationality}
                />
                <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Ciudad – Idiomas – Activo */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Ciudad</Form.Label>
                {!editPersonal ? (
                  <Form.Control
                    name="city_name"
                    value={form.city_name || ''}
                    onChange={onField}
                    disabled
                  />
                ) : (
                  <>
                    <Form.Control
                      placeholder="Buscar por nombre o país..."
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="mb-2"
                    />
                    <Form.Select
                      value={form.id_city || ''}
                      onChange={handleSelectCity}
                    >
                      <option value="">-- Seleccionar ciudad --</option>
                      {filteredCities.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.country})
                        </option>
                      ))}
                    </Form.Select>
                  </>
                )}
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Idiomas (separados por coma)</Form.Label>
                <Form.Control
                  type="text"
                  value={langText}
                  onChange={(e) => setLangText(e.target.value)}
                  onBlur={commitLanguages}
                  disabled={!editPersonal}
                  placeholder="Español, Inglés, Francés"
                />
              </Form.Group>
            </Col>

            <Col md={4} className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="activeSwitchPersonal"
                name="active"
                label="Activo"
                checked={!!form.active}
                onChange={onField}
                disabled={!editPersonal}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* DOCUMENTACIÓN */}
      <Card className="mb-3">
        <Card.Header>{headerWithEdit('Documentación', 'docs', editDocs)}</Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Pasaporte</Form.Label>
                <InputGroup>
                  <Form.Control
                    name="passport_number"
                    value={form.passport_number || ''}
                    onChange={onField}
                    disabled={!editDocs}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigator.clipboard.writeText(form.passport_number || '')}
                    title="Copiar"
                    disabled={!form.passport_number}
                  >
                    <i className="far fa-copy"></i>
                  </Button>
                  <Button variant="outline-primary" title="Adjuntar/Ver foto de pasaporte" disabled>
                    <i className="far fa-image me-1"></i> Pasaporte (foto)
                  </Button>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Label>Vencimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="passport_expiry"
                  value={form.passport_expiry || ''}
                  onChange={onField}
                  disabled={!editDocs}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Licencia</Form.Label>
                <InputGroup>
                  <Form.Control
                    name="license_number"
                    value={form.license_number || ''}
                    onChange={onField}
                    disabled={!editDocs}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigator.clipboard.writeText(form.license_number || '')}
                    title="Copiar"
                    disabled={!form.license_number}
                  >
                    <i className="far fa-copy"></i>
                  </Button>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Label>Vencimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="license_expiry"
                  value={form.license_expiry || ''}
                  onChange={onField}
                  disabled={!editDocs}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* LABORAL */}
      <Card className="mb-3">
        <Card.Header>{headerWithEdit('Laboral', 'job', editJob)}</Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tipo de Contrato</Form.Label>
                <Form.Select
                  name="contract_type"
                  value={form.contract_type || 'third_party'}
                  onChange={onField}
                  disabled={!editJob}
                >
                  <option value="employee">Empleado</option>
                  <option value="third_party">Tercerizado</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Tarifa base por día</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="daily_rate"
                    value={form.daily_rate ?? 0}
                    onChange={onField}
                    disabled={!editJob}
                  />
                  <Form.Select
                    name="currency"
                    value={form.currency || 'EUR'}
                    onChange={onField}
                    disabled={!editJob}
                    style={{ maxWidth: 120 }}
                  >
                    {FAVORITE_CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {ALL_CURRENCIES.filter((c) => !FAVORITE_CURRENCIES.includes(c)).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Comisión On-Site (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="commission_onsite"
                  value={form.commission_onsite ?? 0}
                  onChange={onField}
                  disabled={!editJob}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Comisión Pre-Tour (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="commission_pretour"
                  value={form.commission_pretour ?? 0}
                  onChange={onField}
                  disabled={!editJob}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* COMENTARIOS */}
      <Card className="mb-3">
        <Card.Header>{headerWithEdit('Comentarios', 'comments', editComments)}</Card.Header>
        <Card.Body>
          {/* Lista completa en contenedor alto ~5 ítems con scroll */}
          <div
            className="mb-3 pe-2"
            style={{ maxHeight: '7.5rem', overflowY: 'auto' }}
            tabIndex={0}
          >
            {localComments && localComments.length ? (
              <ul className="mb-0">
                {localComments.map((c, idx) => (
                  <li key={idx} className="small">{c}</li>
                ))}
              </ul>
            ) : (
              <div className="text-muted small">Sin comentarios.</div>
            )}
          </div>

          {/* Nuevo comentario */}
          <Form.Group>
            <Form.Label>Agregar comentario (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!editComments}
              placeholder="Escribe un nuevo comentario…"
            />
            <div className="form-text">
              Solo se enviará si escribís algo. El sistema lo guardará con fecha y lo ubicará primero.
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
    </>
  );
}