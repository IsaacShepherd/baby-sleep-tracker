// Загрузка данных из localStorage
export function loadFromStorage() {
  const savedChildren = localStorage.getItem('babyChildren');
  const savedEvents = localStorage.getItem('babyEvents');
  const savedSelectedId = localStorage.getItem('selectedChildId');

  const result = {
    children: [],
    events: [],
    selectedChildId: null,
  };

  if (savedChildren) {
    result.children = JSON.parse(savedChildren);
  }

  if (savedEvents) {
    const parsed = JSON.parse(savedEvents);
    // Конвертируем строки обратно в даты
    result.events = parsed.map(e => ({
      ...e,
      startTime: new Date(e.startTime),
      endTime: e.endTime ? new Date(e.endTime) : null,
    }));
  }

  if (savedSelectedId) {
    result.selectedChildId = savedSelectedId;
  }

  return result;
}

// Сохранение детей в localStorage
export function saveChildrenToStorage(children) {
  localStorage.setItem('babyChildren', JSON.stringify(children));
}

// Сохранение событий в localStorage
export function saveEventsToStorage(events) {
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
}

// Сохранение выбранного ребенка в localStorage
export function saveSelectedChildIdToStorage(selectedChildId) {
  if (selectedChildId) {
    localStorage.setItem('selectedChildId', selectedChildId);
  }
}

// Получить ключ для сохранения времени пробуждения
function getWakeUpTimeKey(childId, date) {
  const dateStr = date instanceof Date 
    ? date.toISOString().split('T')[0] 
    : date;
  return `dayPlanWakeUp_${childId}_${dateStr}`;
}

// Сохранение времени пробуждения
export function saveWakeUpTimeToStorage(childId, date, wakeUpTime) {
  if (childId && date && wakeUpTime) {
    const key = getWakeUpTimeKey(childId, date);
    localStorage.setItem(key, wakeUpTime);
  }
}

// Загрузка времени пробуждения
export function loadWakeUpTimeFromStorage(childId, date) {
  if (!childId || !date) return null;
  const key = getWakeUpTimeKey(childId, date);
  return localStorage.getItem(key);
}

