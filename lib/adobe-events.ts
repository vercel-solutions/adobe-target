export function sendEvent(body: Record<string, any>) {
  return fetch('/api/target/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
