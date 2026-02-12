import React from 'react';
import { getAgeInMonths } from '../utils/sleepAnalytics';

export default function ChildrenSection({
  children,
  selectedChildId,
  onSelectChild,
  onDeleteChild,
  showAddChild,
  onToggleAddChild,
  newChildName,
  onNewChildNameChange,
  newChildBirthDate,
  onNewChildBirthDateChange,
  onAddChild,
  onCancelAddChild,
}) {
  return (
    <section className="children-section">
      <h2>Выбери ребенка</h2>
      {children.length === 0 ? (
        <p className="empty-message">Ещё нет детей. Добавь первого!</p>
      ) : (
        <div className="children-list">
          {children.map(child => (
            <div key={child.id} className="child-card">
              <button
                className={`child-button ${selectedChildId === child.id ? 'active' : ''}`}
                onClick={() => onSelectChild(child.id)}
              >
                <span className="child-name">{child.name}</span>
                <span className="child-age">
                  {getAgeInMonths(child.birthDate)} месяцев
                </span>
              </button>
              <button
                className="delete-btn"
                onClick={() => onDeleteChild(child.id)}
                title="Удалить"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddChild ? (
        <div className="add-child-form">
          <input
            type="text"
            placeholder="Имя ребенка"
            value={newChildName}
            onChange={e => onNewChildNameChange(e.target.value)}
          />
          <input
            type="date"
            value={newChildBirthDate}
            onChange={e => onNewChildBirthDateChange(e.target.value)}
          />
          <div className="form-buttons">
            <button className="btn btn-primary" onClick={onAddChild}>
              Добавить
            </button>
            <button
              className="btn btn-secondary"
              onClick={onCancelAddChild}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn-secondary" onClick={onToggleAddChild}>
          + Добавить ребенка
        </button>
      )}
    </section>
  );
}



