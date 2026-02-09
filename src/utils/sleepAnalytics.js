// Рекомендуемое время бодрствования по возрасту (в минутах)
export const AWAKE_TIME_RECOMMENDATIONS = {
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
export function getAwakeRecommendation(ageInMonths) {
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
export function getAgeInMonths(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  return Math.max(0, months);
}

// Получить события текущего ребенка за сегодня
export function getTodayEvents(events, selectedChildId) {
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
}

// Получить текущее состояние (сейчас сон или бодрствование?)
export function getCurrentState(events, selectedChildId) {
  if (!selectedChildId) return null;

  const todayEvents = getTodayEvents(events, selectedChildId);
  if (todayEvents.length === 0) return 'awake';

  const lastEvent = todayEvents[todayEvents.length - 1];
  if (lastEvent.type === 'sleep' && lastEvent.endTime) {
    return 'awake';
  }
  if (lastEvent.type === 'sleep' && !lastEvent.endTime) {
    return 'sleeping';
  }
  return 'awake';
}

// Получить длительность текущего бодрствования
export function getCurrentAwakeDuration(events, selectedChildId) {
  if (!selectedChildId) return 0;

  const todayEvents = getTodayEvents(events, selectedChildId);
  if (todayEvents.length === 0) {
    return Math.floor((new Date() - new Date().setHours(0, 0, 0, 0)) / 60000);
  }

  const lastEvent = todayEvents[todayEvents.length - 1];
  if (lastEvent.type === 'sleep' && lastEvent.endTime) {
    return Math.floor((new Date() - lastEvent.endTime) / 60000);
  }
  return 0;
}

// Получить рекомендацию по возрасту
export function getRecommendation(children, events, selectedChildId) {
  if (!selectedChildId) return null;
  const child = children.find(c => c.id === selectedChildId);
  if (!child) return null;

  const ageInMonths = getAgeInMonths(child.birthDate);
  const recommendation = getAwakeRecommendation(ageInMonths);
  const currentAwake = getCurrentAwakeDuration(events, selectedChildId);

  return {
    ageInMonths,
    recommendation,
    currentAwake,
  };
}

// Получить общее время сна за сегодня
export function getTotalSleepToday(events, selectedChildId) {
  const todayEvents = getTodayEvents(events, selectedChildId);
  return todayEvents
    .filter(e => e.type === 'sleep' && e.endTime)
    .reduce((sum, e) => sum + (e.endTime - e.startTime) / 60000, 0);
}

