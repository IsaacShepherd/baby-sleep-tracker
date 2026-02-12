import React from 'react';
import { formatDuration } from '../utils/format';

export default function Stats({ totalSleepToday, sleepEventsCount }) {
  return (
    <section className="stats">
      <h3>Статистика за сегодня</h3>
      <div className="stats-box">
        <p>
          Всего спал:{' '}
          <strong>{formatDuration(Math.round(totalSleepToday))}</strong>
        </p>
        <p>
          Количество снов: <strong>{sleepEventsCount}</strong>
        </p>
      </div>
    </section>
  );
}



