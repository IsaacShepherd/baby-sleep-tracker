import React, { useState, useEffect } from 'react';
import './App.css';

// Utils
import { loadFromStorage, saveChildrenToStorage, saveEventsToStorage, saveSelectedChildIdToStorage } from './utils/storage';
import { getTodayEvents, getRecommendation, getTotalSleepToday } from './utils/sleepAnalytics';
import { dateToLocalDateTime, createChild, removeChild, startSleep, endSleep, deleteEvent, saveEventEdit } from './utils/events';

// Components
import ChildrenSection from './components/ChildrenSection';
import SleepControl from './components/SleepControl';
import Recommendation from './components/Recommendation';
import Stats from './components/Stats';
import EventsList from './components/EventsList';
import EditEventModal from './components/EditEventModal';
import DayPlan from './components/DayPlan';

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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Загрузка данных из localStorage при загрузке компонента
  useEffect(() => {
    const data = loadFromStorage();
    setChildren(data.children);
    setEvents(data.events);
    if (data.selectedChildId) {
      setSelectedChildId(data.selectedChildId);
    }
    setIsDataLoaded(true);
  }, []);

  // Сохранение детей в localStorage
  useEffect(() => {
    if (isDataLoaded) {
      saveChildrenToStorage(children);
    }
  }, [children, isDataLoaded]);

  // Сохранение событий в localStorage
  useEffect(() => {
    if (isDataLoaded) {
      saveEventsToStorage(events);
    }
  }, [events, isDataLoaded]);

  // Сохранение выбранного ребенка в localStorage
  useEffect(() => {
    if (isDataLoaded && selectedChildId) {
      saveSelectedChildIdToStorage(selectedChildId);
    }
  }, [selectedChildId, isDataLoaded]);

  // Добавить нового ребенка
  const addChild = () => {
    const updatedChildren = createChild(newChildName, newChildBirthDate, children);
    if (updatedChildren) {
      setChildren(updatedChildren);
      setSelectedChildId(updatedChildren[updatedChildren.length - 1].id);
      setNewChildName('');
      setNewChildBirthDate('');
      setShowAddChild(false);
    }
  };

  // Удалить ребенка
  const handleDeleteChild = (childId) => {
    const result = removeChild(childId, children, selectedChildId, events);
    if (result) {
      setChildren(result.children);
      setSelectedChildId(result.selectedChildId);
      setEvents(result.events);
    }
  };

  // Начать сон
  const handleStartSleep = () => {
    setSleepStartTime(startSleep());
  };

  // Завершить сон
  const handleEndSleep = () => {
    const result = endSleep(sleepStartTime, selectedChildId, events);
    if (result) {
      setEvents(result.events);
      setSleepStartTime(result.sleepStartTime);
    }
  };

  // Удалить событие
  const handleDeleteEvent = (eventId) => {
    const updatedEvents = deleteEvent(eventId, events);
    setEvents(updatedEvents);
  };

  // Открыть форму редактирования
  const openEditForm = (event) => {
    setEditingEvent(event);
    setEditStartTime(dateToLocalDateTime(event.startTime));
    setEditEndTime(dateToLocalDateTime(event.endTime));
  };

  // Сохранить изменения
  const handleSaveEdit = () => {
    const result = saveEventEdit(editingEvent, editStartTime, editEndTime, events);
    setEvents(result.events);
    if (result.editingEvent === null) {
      setEditingEvent(null);
      setEditStartTime('');
      setEditEndTime('');
    }
  };

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingEvent(null);
    setEditStartTime('');
    setEditEndTime('');
  };

  // Вычисляемые значения
  const selectedChild = children.find(c => c.id === selectedChildId);
  const todayEvents = getTodayEvents(events, selectedChildId);
  const recommendation = getRecommendation(children, events, selectedChildId);
  const totalSleepToday = getTotalSleepToday(events, selectedChildId);
  const sleepEventsCount = todayEvents.filter(e => e.type === 'sleep').length;

  return (
    <div className="app">
      <header className="header">
        <h1>👶 Режим сна малыша</h1>
      </header>

      <main className="container">
        <ChildrenSection
          children={children}
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId}
          onDeleteChild={handleDeleteChild}
          showAddChild={showAddChild}
          onToggleAddChild={() => setShowAddChild(true)}
          newChildName={newChildName}
          onNewChildNameChange={setNewChildName}
          newChildBirthDate={newChildBirthDate}
          onNewChildBirthDateChange={setNewChildBirthDate}
          onAddChild={addChild}
          onCancelAddChild={() => {
            setShowAddChild(false);
            setNewChildName('');
            setNewChildBirthDate('');
          }}
        />

        {selectedChild && (
          <>
            <SleepControl
              selectedChild={selectedChild}
              sleepStartTime={sleepStartTime}
              onStartSleep={handleStartSleep}
              onEndSleep={handleEndSleep}
            />

            {recommendation && (
              <Recommendation recommendation={recommendation} />
            )}

            <DayPlan
              selectedChild={selectedChild}
              selectedChildId={selectedChildId}
            />

            <Stats
              totalSleepToday={totalSleepToday}
              sleepEventsCount={sleepEventsCount}
            />

            <EventsList
              todayEvents={todayEvents}
              onEditEvent={openEditForm}
              onDeleteEvent={handleDeleteEvent}
            />
          </>
        )}

        {children.length > 0 && !selectedChild && (
          <div className="empty-message" style={{ marginTop: '2rem' }}>
            Выбери ребенка из списка выше
          </div>
        )}
      </main>

      <EditEventModal
        editingEvent={editingEvent}
        editStartTime={editStartTime}
        editEndTime={editEndTime}
        onStartTimeChange={setEditStartTime}
        onEndTimeChange={setEditEndTime}
        onSave={handleSaveEdit}
        onCancel={cancelEdit}
      />
    </div>
  );
}
