// Функция для преобразования Date в формат datetime-local
export function dateToLocalDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Добавить нового ребенка
export function createChild(newChildName, newChildBirthDate, children) {
  if (!newChildName.trim() || !newChildBirthDate) {
    alert('Заполни имя и дату рождения');
    return null;
  }
  const newChild = {
    id: Date.now().toString(),
    name: newChildName,
    birthDate: newChildBirthDate,
  };
  return [...children, newChild];
}

// Удалить ребенка
export function removeChild(childId, children, selectedChildId, events) {
  if (window.confirm('Удалить этого ребенка?')) {
    const updatedChildren = children.filter(c => c.id !== childId);
    let newSelectedId = selectedChildId;
    if (selectedChildId === childId) {
      newSelectedId = updatedChildren.length > 1 ? updatedChildren[0].id : null;
    }
    const updatedEvents = events.filter(e => e.childId !== childId);
    return {
      children: updatedChildren,
      selectedChildId: newSelectedId,
      events: updatedEvents,
    };
  }
  return null;
}

// Начать сон
export function startSleep() {
  return new Date();
}

// Завершить сон
export function endSleep(sleepStartTime, selectedChildId, events) {
  if (!sleepStartTime || !selectedChildId) {
    return null;
  }

  const endTime = new Date();
  const newEvent = {
    id: Date.now().toString(),
    childId: selectedChildId,
    type: 'sleep',
    startTime: sleepStartTime,
    endTime: endTime,
  };
  return {
    events: [...events, newEvent],
    sleepStartTime: null,
  };
}

// Удалить событие
export function deleteEvent(eventId, events) {
  if (window.confirm('Удалить это событие?')) {
    return events.filter(e => e.id !== eventId);
  }
  return events;
}

// Сохранить изменения события
export function saveEventEdit(editingEvent, editStartTime, editEndTime, events) {
  if (!editingEvent || !editStartTime) return { events, editingEvent: null };

  const newStartTime = new Date(editStartTime);
  const newEndTime = editEndTime ? new Date(editEndTime) : null;

  // Проверка: время окончания должно быть после времени начала
  if (newEndTime && newEndTime <= newStartTime) {
    alert('Время окончания должно быть позже времени начала');
    return { events, editingEvent };
  }

  const updatedEvents = events.map(e =>
    e.id === editingEvent.id
      ? { ...e, startTime: newStartTime, endTime: newEndTime }
      : e
  );
  return {
    events: updatedEvents,
    editingEvent: null,
  };
}

