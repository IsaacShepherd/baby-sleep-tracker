import React from 'react';
import { formatDuration } from '../utils/format';

export default function Recommendation({ recommendation }) {
  if (!recommendation) return null;

  return (
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
  );
}



