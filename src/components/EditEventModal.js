import React from 'react';

export default function EditEventModal({ editingEvent, editStartTime, editEndTime, onStartTimeChange, onEndTimeChange, onSave, onCancel }) {
  if (!editingEvent) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Редактировать сон</h3>
        <div className="edit-form">
          <div className="form-group">
            <label className="form-label">Время начала</label>
            <input
              type="datetime-local"
              className="form-control"
              value={editStartTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Время окончания</label>
            <input
              type="datetime-local"
              className="form-control"
              value={editEndTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
            />
          </div>
          <div className="form-buttons">
            <button className="btn btn-primary" onClick={onSave}>
              Сохранить
            </button>
            <button className="btn btn-secondary" onClick={onCancel}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


