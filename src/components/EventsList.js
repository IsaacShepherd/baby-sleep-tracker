import React from 'react';
import { formatTime, formatDuration } from '../utils/format';

export default function EventsList({ todayEvents, onEditEvent, onDeleteEvent }) {
  return (
    <section className="events">
      <h3>События за сегодня</h3>
      {todayEvents.length === 0 ? (
        <p className="empty-message">Событий нет</p>
      ) : (
        <div className="events-list">
          {todayEvents.map(event => (
            <div key={event.id} className="event-item">
              <div
                className="event-content"
                onClick={() => onEditEvent(event)}
                style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}
              >
                <div className="event-time">
                  {formatTime(event.startTime)}
                  {event.endTime && ` — ${formatTime(event.endTime)}`}
                </div>
                <div className="event-info">
                  <span className="event-type">
                    {event.type === 'sleep' ? '😴 Сон' : '👁️ Бодрствование'}
                  </span>
                  {event.endTime && (
                    <span className="event-duration">
                      ({formatDuration(Math.round((event.endTime - event.startTime) / 60000))})
                    </span>
                  )}
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEvent(event.id);
                }}
                title="Удалить"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

