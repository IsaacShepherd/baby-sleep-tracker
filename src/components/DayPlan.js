import React, { useState, useEffect, useCallback } from 'react';
import { formatTime, formatDuration } from '../utils/format';
import { getDayPlanByWakeUp } from '../utils/dayPlan';
import { getAgeInMonths } from '../utils/sleepAnalytics';
import { saveWakeUpTimeToStorage, loadWakeUpTimeFromStorage } from '../utils/storage';

export default function DayPlan({ selectedChild, selectedChildId }) {
  const [wakeUpTime, setWakeUpTime] = useState('');
  const [dayPlan, setDayPlan] = useState([]);

  // Преобразовать время HH:MM в Date для сегодня
  const timeToDate = useCallback((timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    return today;
  }, []);

  // Построить план дня
  const buildPlan = useCallback((timeValue) => {
    if (!timeValue || !selectedChild) {
      setDayPlan([]);
      return;
    }

    const wakeUpDate = timeToDate(timeValue);
    const ageMonths = getAgeInMonths(selectedChild.birthDate);
    const plan = getDayPlanByWakeUp({ wakeUpDate, ageMonths });
    setDayPlan(plan);

    // Сохранить время пробуждения
    if (selectedChildId) {
      const today = new Date();
      saveWakeUpTimeToStorage(selectedChildId, today, timeValue);
    }
  }, [selectedChild, selectedChildId, timeToDate]);

  // Загрузка сохраненного времени пробуждения при монтировании или изменении ребенка
  useEffect(() => {
    if (selectedChildId && selectedChild) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const saved = loadWakeUpTimeFromStorage(selectedChildId, dateStr);
      if (saved) {
        setWakeUpTime(saved);
        // Автоматически строим план, если есть сохраненное время
        const wakeUpDate = timeToDate(saved);
        const ageMonths = getAgeInMonths(selectedChild.birthDate);
        const plan = getDayPlanByWakeUp({ wakeUpDate, ageMonths });
        setDayPlan(plan);
      } else {
        setWakeUpTime('');
        setDayPlan([]);
      }
    } else {
      setWakeUpTime('');
      setDayPlan([]);
    }
  }, [selectedChildId, selectedChild, timeToDate]);

  const handleBuildPlan = () => {
    buildPlan(wakeUpTime);
  };

  const handleTimeChange = (e) => {
    setWakeUpTime(e.target.value);
  };

  if (!selectedChild) {
    return null;
  }

  const ageMonths = getAgeInMonths(selectedChild.birthDate);

  return (
    <section className="day-plan">
      <h3>План дня по подъёму</h3>
      <div className="day-plan-form">
        <div className="form-group">
          <label className="form-label">Время пробуждения после ночного сна</label>
          <input
            type="time"
            className="form-control"
            value={wakeUpTime}
            onChange={handleTimeChange}
            placeholder="09:00"
          />
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleBuildPlan}
          disabled={!wakeUpTime}
        >
          Построить план
        </button>
        {!wakeUpTime && (
          <p className="form-hint" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            Введите время пробуждения для построения плана
          </p>
        )}
      </div>

      {dayPlan.length > 0 && (
        <div className="day-plan-result">
          <h4>Рекомендованный график (возраст: {ageMonths} месяцев)</h4>
          
          {/* Список интервалов */}
          <div className="day-plan-list">
            {dayPlan.map((block, index) => (
              <div key={index} className={`day-plan-item day-plan-item--${block.type}`}>
                <div className="day-plan-item-header">
                  <span className="day-plan-item-label">{block.label}</span>
                  {block.durationMinutes && (
                    <span className="day-plan-item-duration">
                      {formatDuration(block.durationMinutes)}
                    </span>
                  )}
                </div>
                <div className="day-plan-item-time">
                  {formatTime(block.start)}
                  {block.end ? ` — ${formatTime(block.end)}` : ' — ...'}
                </div>
              </div>
            ))}
          </div>

          {/* Таймлайн */}
          <div className="day-plan-timeline">
            <h4>Таймлайн дня</h4>
            <div className="timeline-container">
              {dayPlan.map((block, index) => {
                const dayStart = dayPlan[0].start;
                const dayEnd = dayPlan[dayPlan.length - 1].start;
                const dayDuration = dayEnd - dayStart;
                const blockStart = block.start - dayStart;
                const blockWidth = block.end 
                  ? ((block.end - block.start) / dayDuration) * 100
                  : 10; // Для ночного сна показываем небольшую полоску

                return (
                  <div
                    key={index}
                    className={`timeline-block timeline-block--${block.type}`}
                    style={{
                      left: `${(blockStart / dayDuration) * 100}%`,
                      width: `${blockWidth}%`,
                    }}
                    title={`${block.label}: ${formatTime(block.start)}${block.end ? ` - ${formatTime(block.end)}` : ''}`}
                  >
                    <span className="timeline-block-label">{block.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
