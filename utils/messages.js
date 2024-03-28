export function formatMessage(username, text) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    username,
    text,
    time
  };
}
