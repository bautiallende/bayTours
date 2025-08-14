import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { formatDate } from './utils';

/** Tarjeta: SOLO Foto (clic para abrir modal) */
export function TLPhotoCard({ form, imgError, setImgError, onPhotoClick }) {
  const initials = (form.name?.[0] || '') + (form.surname?.[0] || '');
  console.log('TLPhotoCard', form );
  return (
    <Card className="h-100">
      <Card.Body className="text-center">
        <div
          role="button"
          onClick={onPhotoClick}
          title="Ver/actualizar foto"
          className="mx-auto d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 120, height: 120, background:'#eef1f8', border:'1px solid #dee2e6', cursor:'pointer' }}
        >
          {form.photo_url && !imgError ? (
            <img
              src={form.photo_url}
              alt="foto"
              className="img-fluid rounded-circle"
              style={{ width: 118, height: 118, objectFit:'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <i className="fas fa-user fa-2x text-muted" title={initials.toUpperCase()}></i>
          )}
        </div>
        <div className="small text-muted mt-2">Click para ver/actualizar</div>
      </Card.Body>
    </Card>
  );
}

/** Tarjeta: KPIs + datos rápidos de lectura */
export function TLInfoCard({ form, kpis }) {
  const contractLabel = form.contract_type_label || (form.contract_type === 'employee'
    ? 'Empleado'
    : (form.contract_type === 'third_party' ? 'Tercerizado' : form.contract_type));
  const isActive = form.active ? 'Activo' : 'Inactivo';
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="row g-2">
          <div className="col-md-4">
            <Badge bg="light" text="dark" className="w-100 text-start">
              Grupos finalizados: <strong>{kpis?.groupsFinished ?? 0}</strong>
            </Badge>
          </div>
          <div className="col-md-4">
            <Badge bg="light" text="dark" className="w-100 text-start">
              Grupo actual: <strong>{kpis?.currentGroupId || '-'}</strong>
            </Badge>
          </div>
          <div className="col-md-4">
            <Badge bg="light" text="dark" className="w-100 text-start">
              Próximo grupo: <strong>{kpis?.nextGroupId || '-'}</strong>
            </Badge>
          </div>
        </div>
        <hr />
        <div className="row g-2 small">
          <div className="col-md-4"><strong>Nombre:</strong> {form.name || '-'}</div>
          <div className="col-md-4"><strong>Apellido:</strong> {form.surname || '-'}</div>
          <div className="col-md-4"><strong>Nacimiento:</strong> {formatDate(form.birth_date)}</div>
          <div className="col-md-4"><strong>Email:</strong> {form.mail || '-'}</div>
          <div className="col-md-4"><strong>Teléfono:</strong> {form.phone || '-'}</div>
          <div className="col-md-4"><strong>Ciudad:</strong> {form.city_name || '-'}</div>
          <div className="col-md-4"><strong>Pasaporte:</strong> {form.passport_number || '-'}</div>
          <div className="col-md-4"><strong>Vto Pasaporte:</strong> {formatDate(form.passport_expiry)}</div>
          <div className="col-md-4"><strong>Licencia:</strong> {form.license_number || '-'}</div>
          <div className="col-md-4"><strong>Contrato:</strong> {contractLabel || '-'}</div>
          <div className="col-md-4"><strong>Tarifa:</strong> {form.daily_rate} {form.currency}</div>
          <div className="col-md-4"><strong>Estado:</strong> {isActive}</div>
        </div>
      </Card.Body>
    </Card>
  );
}

/** Default (no lo usamos ahora, pero lo dejo por compatibilidad) */
export default function TLHeaderCard(props) {
  return (
    <>
      <TLPhotoCard {...props} />
      <div className="mt-3">
        <TLInfoCard {...props} />
      </div>
    </>
  );
}