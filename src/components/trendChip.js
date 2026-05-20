/**
 * Creates a trend chip button.
 * @param {{ title: string, traffic: string }} trend
 * @param {function} onClick - Called with the trend object on click
 * @returns {HTMLButtonElement}
 */
export function createTrendChip(trend, onClick) {
  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.type = 'button';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'chip-title';
  titleSpan.textContent = trend.title;

  const trafficBadge = document.createElement('span');
  trafficBadge.className = 'chip-traffic';
  trafficBadge.textContent = trend.traffic || '';

  chip.appendChild(titleSpan);
  if (trend.traffic) {
    chip.appendChild(trafficBadge);
  }

  chip.addEventListener('click', () => onClick(trend));

  return chip;
}
