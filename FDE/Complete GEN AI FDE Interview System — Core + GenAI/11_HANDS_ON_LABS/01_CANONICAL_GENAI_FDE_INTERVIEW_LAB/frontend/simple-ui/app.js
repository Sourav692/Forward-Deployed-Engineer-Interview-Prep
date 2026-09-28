async function ask() {
  const output = document.getElementById('output');
  output.textContent = 'Loading...';

  const response = await fetch('http://localhost:8000/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: document.getElementById('userId').value,
      question: document.getElementById('question').value,
      debug: true
    })
  });

  const body = await response.json();
  output.textContent = JSON.stringify(body, null, 2);
}
