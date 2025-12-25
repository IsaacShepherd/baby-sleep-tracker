import React, { useState, useEffect } from 'react';
import './App.css';

// Рекомендуемое время бодрствования по возрасту (в минутах)
const AWAKE_TIME_RECOMMENDATIONS = {
  0: { min: 30, max: 60 },      // 0-1 месяц
  1: { min: 45, max: 90 },      // 1-2 месяца
  2: { min: 45, max: 120 },     // 2-3 месяца
  3: { min: 60, max: 120 },     // 3-4 месяца
  4: { min: 75, max: 150 },     // 4-5 месяцев
  5: { min: 90, max: 150 },     // 5-6 месяцев
  6: { min: 120, max: 180 },    // 6-9 месяцев
  9: { min: 150, max: 240 },    // 9-12 месяцев
};

// Функция для получения рекомендации по возрасту в месяцах
function getAwakeRecommendation(ageInMonths) {
  if (ageInMonths < 1) return AWAKE_TIME_RECOMMENDATIONS[0];
  if (ageInMonths < 2) return AWAKE_TIME_RECOMMENDATIONS[1];
  if (ageInMonths < 3) return AWAKE_TIME_RECOMMENDATIONS[2];
  if (ageInMonths < 4) return AWAKE_TIME_RECOMMENDATIONS[3];
  if (ageInMonths < 5) return AWAKE_TIME_RECOMMENDATIONS[4];
  if (ageInMonths < 6) return AWAKE_TIME_RECOMMENDATIONS[5];
  if (ageInMonths < 9) return AWAKE_TIME_RECOMMENDATIONS[6];
  return AWAKE_TIME_RECOMMENDATIONS[9];
}

// Функция для расчета возраста в месяцах
function getAgeInMonths(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  return Math.max(0, months);
}

// Функция для форматирования времени
function formatTime(date) {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Функция для форматирования длительности
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}ч ${mins}м`;
  }
  return `${mins}м`;
}

export default function App() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');
  const [events, setEvents] = useState([]);
  const [sleepStartTime, setSleepStartTime] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  // Загрузка данных из localStorage при загрузке компонента
  useEffect(() => {
    const savedChildren = localStorage.getItem('babyChildren');
    const savedEvents = localStorage.getItem('babyEvents');
    const savedSelectedId = localStorage.getItem('selectedChildId');

    if (savedChildren) setChildren(JSON.parse(savedChildren));
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      // Конвертируем строки обратно в даты
      setEvents(
        parsed.map(e => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: e.endTime ? new Date(e.endTime) : null,
        }))
      );
    }
    if (savedSelectedId) setSelectedChildId(savedSelectedId);
  }, []);

  // Сохранение детей в localStorage
  useEffect(() => {
    localStorage.setItem('babyChildren', JSON.stringify(children));
  }, [children]);

  // Сохранение событий в localStorage
  useEffect(() => {
    localStorage.setItem(
      'babyEvents',
      JSON.stringify(
        events.map(e => ({
          ...e,
          startTime: e.startTime.toISOString(),
          endTime: e.endTime ? e.endTime.toISOString() : null,
        }))
      )
    );
  }, [events]);

  // Сохранение выбранного ребенка в localStorage
  useEffect(() => {
    if (selectedChildId) {
      localStorage.setItem('selectedChildId', selectedChildId);
    }
  }, [selectedChildId]);

  // Добавить нового ребенка
  const addChild = () => {
    if (!newChildName.trim() || !newChildBirthDate) {
      alert('Заполни имя и дату рождения');
      return;
    }
    const newChild = {
      id: Date.now().toString(),
      name: newChildName,
      birthDate: newChildBirthDate,
    };
    const updatedChildren = [...children, newChild];
    setChildren(updatedChildren);
    setSelectedChildId(newChild.id);
    setNewChildName('');
    setNewChildBirthDate('');
    setShowAddChild(false);
  };

  // Удалить ребенка
  const deleteChild = (childId) => {
    if (window.confirm('Удалить этого ребенка?')) {
      setChildren(children.filter(c => c.id !== childId));
      if (selectedChildId === childId) {
        setSelectedChildId(children.length > 1 ? children[0].id : null);
      }
      // Удалить события этого ребенка
      setEvents(events.filter(e => e.childId !== childId));
    }
  };

  // Начать сон
  const startSleep = () => {
    setSleepStartTime(new Date());
  };

  // Завершить сон
  const endSleep = () => {
    if (!sleepStartTime || !selectedChildId) return;

    const endTime = new Date();
    const newEvent = {
      id: Date.now().toString(),
      childId: selectedChildId,
      type: 'sleep',
      startTime: sleepStartTime,
      endTime: endTime,
    };
    setEvents([...events, newEvent]);
    setSleepStartTime(null);
  };

  // Удалить событие
  const deleteEvent = (eventId) => {
    if (window.confirm('Удалить это событие?')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  // Функция для преобразования Date в формат datetime-local
  const dateToLocalDateTime = (date) => {
    if (!date) return '';                    // Если даты нет, возвращаем пустую строку
    const d = new Date(date);                // Создаем объект Date из переданной даты
    const year = d.getFullYear();            // Получаем год (например, 2024)
    const month = String(d.getMonth() + 1).padStart(2, '0');  // Месяц (0-11 → 1-12, добавляем 0 если нужно)
    const day = String(d.getDate()).padStart(2, '0');          // День месяца (добавляем 0 если нужно)
    const hours = String(d.getHours()).padStart(2, '0');       // Часы (добавляем 0 если нужно)
    const minutes = String(d.getMinutes()).padStart(2, '0');   // Минуты (добавляем 0 если нужно)
    return `${year}-${month}-${day}T${hours}:${minutes}`;      // Возвращаем строку в формате "2024-12-25T14:30"
  };

  // Открыть форму редактирования
  const openEditForm = (event) => {
    setEditingEvent(event);
    setEditStartTime(dateToLocalDateTime(event.startTime));
    setEditEndTime(dateToLocalDateTime(event.endTime));
  };

  // Сохранить изменения
  const saveEdit = () => {
    if (!editingEvent || !editStartTime) return;

    const newStartTime = new Date(editStartTime);
    const newEndTime = editEndTime ? new Date(editEndTime) : null;

    // Проверка: время окончания должно быть после времени начала
    if (newEndTime && newEndTime <= newStartTime) {
      alert('Время окончания должно быть позже времени начала');
      return;
    }

    const updatedEvents = events.map(e =>
      e.id === editingEvent.id
        ? { ...e, startTime: newStartTime, endTime: newEndTime }
        : e
    );
    setEvents(updatedEvents);
    setEditingEvent(null);
    setEditStartTime('');
    setEditEndTime('');
  };

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingEvent(null);
    setEditStartTime('');
    setEditEndTime('');
  };

  // Получить события текущего ребенка за сегодня
  const getTodayEvents = () => {
    if (!selectedChildId) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter(e => {
        const eventDate = new Date(e.startTime);
        eventDate.setHours(0, 0, 0, 0);
        return e.childId === selectedChildId && eventDate.getTime() === today.getTime();
      })
      .sort((a, b) => a.startTime - b.startTime);
  };

  // Получить текущее состояние (сейчас сон или бодрствование?)
  const getCurrentState = () => {
    if (!selectedChildId) return null;

    const todayEvents = getTodayEvents();
    if (todayEvents.length === 0) return 'awake';

    const lastEvent = todayEvents[todayEvents.length - 1];
    if (lastEvent.type === 'sleep' && lastEvent.endTime) {
      return 'awake';
    }
    if (lastEvent.type === 'sleep' && !lastEvent.endTime) {
      return 'sleeping';
    }
    return 'awake';
  };

  // Получить длительность текущего бодрствования
  const getCurrentAwakeDuration = () => {
    if (!selectedChildId) return 0;

    const todayEvents = getTodayEvents();
    if (todayEvents.length === 0) {
      return Math.floor((new Date() - new Date().setHours(0, 0, 0, 0)) / 60000);
    }

    const lastEvent = todayEvents[todayEvents.length - 1];
    if (lastEvent.type === 'sleep' && lastEvent.endTime) {
      return Math.floor((new Date() - lastEvent.endTime) / 60000);
    }
    return 0;
  };

  // Получить рекомендацию по возрасту
  const getRecommendation = () => {
    if (!selectedChildId) return null;
    const child = children.find(c => c.id === selectedChildId);
    if (!child) return null;

    const ageInMonths = getAgeInMonths(child.birthDate);
    const recommendation = getAwakeRecommendation(ageInMonths);
    const currentAwake = getCurrentAwakeDuration();

    return {
      ageInMonths,
      recommendation,
      currentAwake,
    };
  };

  // Получить общее время сна за сегодня
  const getTotalSleepToday = () => {
    const todayEvents = getTodayEvents();
    return todayEvents
      .filter(e => e.type === 'sleep' && e.endTime)
      .reduce((sum, e) => sum + (e.endTime - e.startTime) / 60000, 0);
  };

  const selectedChild = children.find(c => c.id === selectedChildId);
  const recommendation = getRecommendation();
  const currentState = getCurrentState();
  const totalSleepToday = getTotalSleepToday();
  const todayEvents = getTodayEvents();

  return (
    <div className="app">
      <header className="header">
        <h1>👶 Режим сна малыша</h1>
      </header>

      <main className="container">
        {/* Выбор/Добавление ребенка */}
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
                    onClick={() => setSelectedChildId(child.id)}
                  >
                    <span className="child-name">{child.name}</span>
                    <span className="child-age">
                      {getAgeInMonths(child.birthDate)} месяцев
                    </span>
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteChild(child.id)}
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
                onChange={e => setNewChildName(e.target.value)}
              />
              <input
                type="date"
                value={newChildBirthDate}
                onChange={e => setNewChildBirthDate(e.target.value)}
              />
              <div className="form-buttons">
                <button className="btn btn-primary" onClick={addChild}>
                  Добавить
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddChild(false);
                    setNewChildName('');
                    setNewChildBirthDate('');
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setShowAddChild(true)}>
              + Добавить ребенка
            </button>
          )}
        </section>

        {selectedChild && (
          <>
            {/* Контрольная панель сна */}
            <section className="sleep-control">
              <h2>{selectedChild.name}</h2>

              {sleepStartTime ? (
                <div className="sleep-timer">
                  <p>Сон начался в {formatTime(sleepStartTime)}</p>
                  <p className="elapsed-time">
                    Прошло:{' '}
                    {formatDuration(
                      Math.floor((new Date() - sleepStartTime) / 60000)
                    )}
                  </p>
                  <button className="btn btn-success" onClick={endSleep}>
                    Завершить сон
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary btn-large" onClick={startSleep}>
                  Начать сон
                </button>
              )}
            </section>

            {/* Рекомендация по возрасту */}
            {recommendation && (
              <section className="recommendation">
                <h3>Рекомендация для возраста {recommendation.ageInMonths} месяцев</h3>
                <div className="rec-box">
                  <p>
                    Рекомендуемое бодрствование:{' '}
                    <strong>
                      {formatDuration(recommendation.recommendation.min)} —{' '}
                      {formatDuration(recommendation.recommendation.max)}
                    </strong>
                  </p>
                  <p>
                    Сейчас бодрствует:{' '}
                    <strong>{formatDuration(recommendation.currentAwake)}</strong>
                  </p>

                  {recommendation.currentAwake > recommendation.recommendation.max ? (
                    <div className="alert alert-warning">
                      ⚠️ Ребенок переутомлен! Пора укладывать спать.
                    </div>
                  ) : recommendation.currentAwake > recommendation.recommendation.min ? (
                    <div className="alert alert-info">
                      ℹ️ Хорошее время для укладывания. Ребенок готов ко сну.
                    </div>
                  ) : (
                    <div className="alert alert-success">
                      ✓ Ребенок ещё недостаточно устал. Подожди немного.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Статистика за день */}
            <section className="stats">
              <h3>Статистика за сегодня</h3>
              <div className="stats-box">
                <p>
                  Всего спал:{' '}
                  <strong>{formatDuration(Math.round(totalSleepToday))}</strong>
                </p>
                <p>
                  Количество снов: <strong>{todayEvents.filter(e => e.type === 'sleep').length}</strong>
                </p>
              </div>
            </section>

            {/* Лента событий */}
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
                        onClick={() => openEditForm(event)}
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
                          deleteEvent(event.id);
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
          </>
        )}

        {children.length > 0 && !selectedChild && (
          <div className="empty-message" style={{ marginTop: '2rem' }}>
            Выбери ребенка из списка выше
          </div>
        )}
      </main>

      {/* Модальное окно редактирования */}
      {editingEvent && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Редактировать сон</h3>
            <div className="edit-form">
              <div className="form-group">
                <label className="form-label">Время начала</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Время окончания</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                />
              </div>
              <div className="form-buttons">
                <button className="btn btn-primary" onClick={saveEdit}>
                  Сохранить
                </button>
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}