document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('persona').addEventListener('change', event => {
    const vp = event.target.value === 'vp';
    const restricted = document.getElementById('restricted-status');
    restricted.textContent = vp ? 'Allowed' : 'Excluded';
    restricted.classList.toggle('denied', !vp);
    document.getElementById('persona-result').textContent = vp
      ? "All three sources may enter Alex's evidence set under this illustrative policy."
      : "Only the published policy and support runbook enter Priya's evidence set.";
  });
});
