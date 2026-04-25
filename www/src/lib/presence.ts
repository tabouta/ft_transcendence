export function startPresence() {
  const ws = new WebSocket(`/ws/presence`);
  ws.onmessage = () => {
    ws.send("pong");
  };
  return ws;
}
