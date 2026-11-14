// Llama herramientas del MCP de Versio con el token personal de cada dev (VERSIO_MCP_TOKEN en .env,
// de Versio › MCP (Claude) › Nuevo token). Actúa con los permisos de esa persona; nunca imprime el token.
import { baseUrl, envValue } from './pipeline.mjs';

export async function versioTool(name, args = {}) {
  const token = envValue('VERSIO_MCP_TOKEN');
  if (!token) throw new Error('Falta VERSIO_MCP_TOKEN en el .env: créalo en Versio › MCP (Claude) › Nuevo token.');
  const res = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } })
  });
  const body = await res.text();
  if (res.status === 401) throw new Error('Versio rechazó VERSIO_MCP_TOKEN (vencido o revocado): crea otro en Versio › MCP (Claude).');
  if (!res.ok) throw new Error(`Versio ${res.status}: ${body.slice(0, 300)}`);
  let data;
  try { data = JSON.parse(body); } catch { throw new Error(`Respuesta no válida de Versio: ${body.slice(0, 200)}`); }
  if (data.error) throw new Error(`Versio: ${data.error.message}`);
  const text = data.result?.content?.[0]?.text ?? '';
  if (data.result?.isError) throw new Error(text || `Versio no pudo ejecutar ${name}`);
  try { return JSON.parse(text); } catch { return text; }
}
