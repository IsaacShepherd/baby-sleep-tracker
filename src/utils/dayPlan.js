// Рекомендации по плану дня в зависимости от возраста
// awakeWindowMinutes - окно бодрствования в минутах
// naps - массив длительностей дневных снов в минутах
export const DAY_PLAN_RECOMMENDATIONS = {
  0: { awakeWindowMinutes: 45, naps: [120, 90, 60] },      // 0-1 месяц: 3 дневных сна
  1: { awakeWindowMinutes: 60, naps: [120, 90, 60] },     // 1-2 месяца: 3 дневных сна
  2: { awakeWindowMinutes: 75, naps: [120, 90, 60] },     // 2-3 месяца: 3 дневных сна
  3: { awakeWindowMinutes: 90, naps: [120, 90] },         // 3-4 месяца: 2 дневных сна
  4: { awakeWindowMinutes: 105, naps: [120, 90] },        // 4-5 месяцев: 2 дневных сна
  5: { awakeWindowMinutes: 120, naps: [120, 90] },         // 5-6 месяцев: 2 дневных сна
  6: { awakeWindowMinutes: 150, naps: [90, 60] },          // 6-9 месяцев: 2 дневных сна
  9: { awakeWindowMinutes: 210, naps: [90, 50] },           // 9-12 месяцев: 2 дневных сна
};

// Получить рекомендацию плана дня по возрасту в месяцах
function getDayPlanRecommendation(ageInMonths) {
  if (ageInMonths < 1) return DAY_PLAN_RECOMMENDATIONS[0];
  if (ageInMonths < 2) return DAY_PLAN_RECOMMENDATIONS[1];
  if (ageInMonths < 3) return DAY_PLAN_RECOMMENDATIONS[2];
  if (ageInMonths < 4) return DAY_PLAN_RECOMMENDATIONS[3];
  if (ageInMonths < 5) return DAY_PLAN_RECOMMENDATIONS[4];
  if (ageInMonths < 6) return DAY_PLAN_RECOMMENDATIONS[5];
  if (ageInMonths < 9) return DAY_PLAN_RECOMMENDATIONS[6];
  return DAY_PLAN_RECOMMENDATIONS[9];
}

// Преобразовать время HH:MM в Date для сегодняшнего дня
function timeToDate(timeString, baseDate = new Date()) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Добавить минуты к дате
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Построить план дня на основе времени пробуждения и возраста
 * @param {Object} params
 * @param {Date} params.wakeUpDate - время пробуждения (Date объект)
 * @param {number} params.ageMonths - возраст в месяцах
 * @returns {Array} Массив блоков плана дня
 */
export function getDayPlanByWakeUp({ wakeUpDate, ageMonths }) {
  if (!wakeUpDate || !ageMonths) return [];

  const recommendation = getDayPlanRecommendation(ageMonths);
  const plan = [];
  let currentTime = new Date(wakeUpDate);

  // Первое окно бодрствования после пробуждения
  const firstAwakeEnd = addMinutes(currentTime, recommendation.awakeWindowMinutes);
  plan.push({
    type: 'awake',
    label: 'Бодрствование',
    start: new Date(currentTime),
    end: new Date(firstAwakeEnd),
    durationMinutes: recommendation.awakeWindowMinutes,
  });

  currentTime = firstAwakeEnd;

  // Дневные сны
  recommendation.naps.forEach((napDuration, index) => {
    const napStart = currentTime;
    const napEnd = addMinutes(napStart, napDuration);
    
    plan.push({
      type: 'nap',
      label: `Дневной сон ${index + 1}`,
      start: new Date(napStart),
      end: new Date(napEnd),
      durationMinutes: napDuration,
    });

    // Окно бодрствования после сна (кроме последнего)
    if (index < recommendation.naps.length - 1) {
      currentTime = napEnd;
      const awakeEnd = addMinutes(currentTime, recommendation.awakeWindowMinutes);
      plan.push({
        type: 'awake',
        label: 'Бодрствование',
        start: new Date(currentTime),
        end: new Date(awakeEnd),
        durationMinutes: recommendation.awakeWindowMinutes,
      });
      currentTime = awakeEnd;
    } else {
      currentTime = napEnd;
    }
  });

  // Последнее окно бодрствования перед ночным сном
  const bedtimeStart = addMinutes(currentTime, recommendation.awakeWindowMinutes);
  plan.push({
    type: 'awake',
    label: 'Бодрствование перед сном',
    start: new Date(currentTime),
    end: new Date(bedtimeStart),
    durationMinutes: recommendation.awakeWindowMinutes,
  });

  // Ночной сон
  plan.push({
    type: 'night',
    label: 'Ночной сон',
    start: new Date(bedtimeStart),
    end: null, // Ночной сон не имеет конца в рамках одного дня
    durationMinutes: null,
  });

  return plan;
}


