const $ = (id) => document.getElementById(id);

async function llamar(metodo, url, cuerpo, token) {
  const opciones = { method: metodo, headers: {} };
  if (token) opciones.headers.Authorization = `Bearer ${token}`;
  if (cuerpo) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }
  const respuesta = await fetch(url, opciones);
  let datos = null;
  try { datos = await respuesta.json(); } catch { datos = null; }
  return { status: respuesta.status, datos };
}

function anotar(metodo, url, status, datos) {
  const li = document.createElement('li');
  const clase = status < 300 ? 'ok' : status === 401 ? 'e401' : status === 403 ? 'e403' : 'error';
  li.innerHTML = `<span class="codigo ${clase}">${status}</span> <code>${metodo} ${url}</code>`;
  const cuerpo = document.createElement('pre');
  cuerpo.textContent = JSON.stringify(datos, null, 2);
  li.appendChild(cuerpo);
  $('bitacora').prepend(li);
}

async function refrescarEstado() {
  const { status, datos } = await llamar('GET', '/api/sesion');
  const estado = $('estado');
  if (status === 200) {
    estado.textContent = `${datos.usuario.nombre} · rol ${datos.usuario.rol} · sesión ${datos.sesion} · vence en ${datos.expiraEnSegundos} s`;
    estado.className = 'estado con-sesion';
  } else {
    estado.textContent = 'Sin sesión (el servidor responde 401)';
    estado.className = 'estado sin-sesion';
  }
  $('cookie-js').textContent = document.cookie || '(vacío)';
}

async function refrescarSesiones() {
  const { datos: respuesta } = await llamar('GET', '/api/diagnostico/sesiones');
  const datos = respuesta ? respuesta.sesiones : [];
  if (respuesta) {
    $('donde').textContent = respuesta.almacen === 'memoria'
      ? 'En la MEMORIA del servidor: se borra al reiniciarlo.'
      : 'En MySQL, tabla sessions. En Workbench: SELECT * FROM demo_sesiones.sessions;';
  }
  const cuerpo = $('tabla-sesiones');
  cuerpo.innerHTML = '';
  if (!datos || datos.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="4">(sin sesiones)</td></tr>';
    return;
  }
  for (const s of datos) {
    const fila = document.createElement('tr');
    if (s.esLaTuya) fila.className = 'tuya';
    const vence = s.expira ? new Date(s.expira).toLocaleTimeString() : '—';
    for (const valor of [s.sesion + (s.esLaTuya ? ' (la tuya)' : ''), s.usuario, s.visitas, vence]) {
      const celda = document.createElement('td');
      celda.textContent = valor;
      fila.appendChild(celda);
    }
    cuerpo.appendChild(fila);
  }
}

async function refrescarTodo() {
  await refrescarEstado();
  await refrescarSesiones();
}

$('usuario').addEventListener('change', () => {
  $('contrasena').value = `${$('usuario').value}12345`;
});

$('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const cuerpo = { usuario: $('usuario').value, contrasena: $('contrasena').value };
  const { status, datos } = await llamar('POST', '/api/login', cuerpo);
  anotar('POST', '/api/login', status, datos);
  await refrescarTodo();
});

for (const boton of document.querySelectorAll('[data-url]')) {
  boton.addEventListener('click', async () => {
    const { metodo, url } = boton.dataset;
    const { status, datos } = await llamar(metodo, url);
    anotar(metodo, url, status, datos);
    await refrescarTodo();
  });
}

let tokenJWT = null;

function mostrarToken() {
  $('jwt-token').textContent = tokenJWT || '(sin token)';
  if (!tokenJWT) {
    $('jwt-payload').textContent = '—';
    return;
  }
  const payload = JSON.parse(atob(tokenJWT.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  payload.exp_legible = new Date(payload.exp * 1000).toLocaleTimeString();
  $('jwt-payload').textContent = JSON.stringify(payload, null, 2);
}

$('btn-jwt-login').addEventListener('click', async () => {
  const cuerpo = { usuario: $('usuario').value, contrasena: $('contrasena').value };
  const { status, datos } = await llamar('POST', '/api/jwt/login', cuerpo);
  anotar('POST', '/api/jwt/login', status, datos);
  if (status === 200) tokenJWT = datos.token;
  mostrarToken();
});

for (const boton of document.querySelectorAll('[data-jwt]')) {
  boton.addEventListener('click', async () => {
    const metodo = boton.dataset.jwt;
    const { url } = boton.dataset;
    const { status, datos } = await llamar(metodo, url, null, tokenJWT);
    anotar(metodo, url, status, datos);
    if (url === '/api/jwt/refresh' && status === 200) tokenJWT = datos.token;
    mostrarToken();
  });
}

$('btn-jwt-olvidar').addEventListener('click', () => {
  tokenJWT = null;
  mostrarToken();
});

$('btn-refrescar').addEventListener('click', refrescarTodo);
$('btn-sesiones').addEventListener('click', refrescarSesiones);

llamar('GET', '/api/config').then(({ datos }) => {
  $('config').textContent = JSON.stringify(datos, null, 2);
});
refrescarTodo();
