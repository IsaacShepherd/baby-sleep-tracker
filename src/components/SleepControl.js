import React from 'react';
import { formatTime, formatDuration } from '../utils/format';

export default function SleepControl({ selectedChild, sleepStartTime, onStartSleep, onEndSleep }) {
  return (
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
          <button className="btn btn-success" onClick={onEndSleep}>
            Завершить сон
          </button>
        </div>
      ) : (
        <button className="btn btn-primary btn-large" onClick={onStartSleep}>
          Начать сон
        </button>
      )}
    </section>
  );
}


