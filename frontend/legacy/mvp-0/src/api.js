async function fail(res) {
  let detail = `${res.status} ${res.statusText}`;
  try {
    const body = await res.json();
    if (body.detail) detail = body.detail;
  } catch {
    /* không có JSON */
  }
  throw new Error(detail);
}

/** @returns {Promise<{reply: string, emotion: string}>} */
export async function chat(messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) await fail(res);
  return res.json();
}

/** @returns {Promise<ArrayBuffer>} audio mp3 */
export async function speak(text) {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) await fail(res);
  return res.arrayBuffer();
}
