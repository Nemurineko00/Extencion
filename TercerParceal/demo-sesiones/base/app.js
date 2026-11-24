// La aplicación de la demo. server.js la arranca; las pruebas la arrancan con otras configuraciones.
// Lo que dice "(en clase)" lo programamos juntos, paso por paso. Mientras no esté, esa ruta responde 501.
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const jwt = require('jsonwebtoken');
const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');
const { crearModeloTokens } = require('./modelos/tokens.modelos');

const NOMBRE_COOKIE = 'connect.sid';

// Regresa todas las sesiones del almacén (MemoryStore usa callback; MySQLStore regresa una promesa).
function todasLasSesiones(almacen) {
  return new Promise((resolve, reject) => {
    const promesa = almacen.all((error, sesiones) => (error ? reject(error) : resolve(sesiones)));
    if (promesa && typeof promesa.then === 'function') promesa.then(resolve, reject);
  });
}

// pool: la conexión a MySQL (db.js). Los usuarios SIEMPRE se leen de MySQL.
function crearApp(config, pool) {
  const app = express();
  app.use(express.json());
  const usuarios = crearModeloUsuarios(pool);
  const tokens = crearModeloTokens(pool);

  // Aquí vive lo que el servidor recuerda de cada sesión:
  //  - 'mysql':   en la tabla sessions. Sobrevive a un reinicio y la puedes ver en Workbench.
  //  - 'memoria': en la memoria del proceso. Si el servidor se reinicia, se pierde todo.
  const almacen =
    config.almacen === 'memoria'
      ? new session.MemoryStore()
      : new MySQLStore({ createDatabaseTable: false, clearExpired: false }, pool);
  app.locals.almacen = almacen;

  // Paso 1 (en clase): configurar express-session aquí, ANTES de las rutas.
  app.use(
    session({
      name: NOMBRE_COOKIE,
      secret: process.env.SESSION_SECRET || 'cambia-este-secreto',
      store: almacen,
      resave: false,
      //No se crea ni la secion ni la cookie
      saveUninitialized: false,
      rolling: Boolean(config.rolling),
      cookie: {
        maxAge: config.maxAgeMs || 1000 * 60 * 60 * 24, //dura un dia
        httpOnly: config.httpOnly !== false,
        sameSite: config.sameSite || 'lax',
        secure: Boolean(config.secure),
      },
    })
  );

  // Los primeros 8 caracteres del id de sesión, para poder compararlos en pantalla.
  //Nesecitamos visualizar el id de la sesion para comparla con la pantalla
  const idCorto = (id) => (id ? `${id.slice(0, 8)}…` : null);

  // ---------- Middlewares de protección ----------

  // Paso 5 (en clase): función vencida(sesion).
  //Nosotros estaremos ocupando un middleware de proteccion para las rutas que necesiten sesion y rol a partir de express
  //pero cada peticion debe de devolver una sesion, para ello el atributo rolling de la cookie debe de estar en true,
  //para que cada peticion se actualice el tiempo de vida de la sesion y no se venza mientras el usuario este activo
  //anuque para esto hay que dale seguridad
  function vencida(sesion) {
    const desde = config.rolling ? sesion.ultimoUso : sesion.creada;
    return !desde || Date.now() - desde >= config.maxAgeMs;
  }

  // 401: "no sé quién eres" (no hay sesión o ya venció).
  //Mandar un 401, no se quien eres
  function requiereSesion(req, res, next) {
    // Paso 1 (en clase)
    if (req.session.usuario && vencida(req.session)) {
      return req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie(NOMBRE_COOKIE);
        res.status(401).json({ error: 'Sesión vencida' });
      });
    }
    if (!req.session.usuario) {
      return res.status(401).json({ error: 'No hay sesión' });
    }
    req.session.ultimoUso = Date.now();
    return next();
  }

  // 403: "sé quién eres, pero no tienes permiso".
  function requiereRol(rol) {
    // Paso 3 (en clase)  
    return (req, res, next) => {
      if (req.session.usuario.rol !== rol) {
        return res.status(403).json({ error: `Eres ${req.session.usuario.usuario}, pero esta ruta es solo para ${rol}` });
      }
      return next();
    };
  }

  // ---------- Rutas ----------

  app.get('/api/config', (req, res) => res.json(config));

  // Guarda un contador en la sesión. Sirve para ver que la sesión existe antes de entrar
  // (y para la demostración de fijación de sesión).
  app.post('/api/visita', (req, res) => {
    req.session.visitas = (req.session.visitas || 0) + 1;
    res.json({ visitas: req.session.visitas, sesion: idCorto(req.sessionID) });
  });

  // Paso 2 (en clase): iniciar sesión. Paso 7 (en clase): regenerar el id al entrar.
  app.post('/api/login', async (req, res, next) => {
    try {
      const { usuario, contrasena } = req.body || {};
      const datos = await usuarios.verificar(usuario, contrasena);
      if (!datos) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }

      const antes = req.session.visitas !== undefined ? idCorto(req.sessionID) : null;
      const guardar = () => {
        req.session.usuario = datos;
        req.session.creada = Date.now();
        req.session.ultimoUso = Date.now();
        req.session.save((error) => {
          if (error) return next(error);
          res.json({ usuario: datos, sesionAntes: antes, sesionDespues: idCorto(req.sessionID) });
        });
      };

      if (config.regenerarAlEntrar) {
        req.session.regenerate((error) => (error ? next(error) : guardar()));
      } else {
        guardar();
      }
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/logout', requiereSesion, (req, res, next) => {
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie(NOMBRE_COOKIE);
      res.json({ mensaje: 'Sesión cerrada' });
    });
  });

  app.get('/api/perfil', requiereSesion, (req, res) => {
    req.session.visitas = (req.session.visitas || 0) + 1;
    res.json({ mensaje: `Hola, ${req.session.usuario.nombre}`, rol: req.session.usuario.rol, visitas: req.session.visitas });
  });

  app.get('/api/sesion', requiereSesion, (req, res) => {
    const desde = config.rolling ? req.session.ultimoUso : req.session.creada;
    res.json({
      usuario: req.session.usuario,
      sesion: idCorto(req.sessionID),
      expiraEnSegundos: Math.max(0, Math.round((desde + config.maxAgeMs - Date.now()) / 1000)),
    });
  });

  app.get('/api/admin/reporte', requiereSesion, requiereRol('admin'), (req, res) => {
    res.json({ reporte: 'Talleres: 3 · Inscritos: 57 · Cupo libre: 18' });
  });

  // SOLO PARA LA CLASE: muestra lo que el servidor guarda de cada sesión.
  // Un servidor real NUNCA expone esto.
  app.get('/api/diagnostico/sesiones', async (req, res, next) => {
    try {
      const sesiones = await todasLasSesiones(almacen);
      const lista = Object.entries(sesiones || {}).map(([id, s]) => ({
        sesion: idCorto(id),
        esLaTuya: id === req.sessionID,
        usuario: s.usuario ? s.usuario.usuario : '(sin iniciar sesión)',
        visitas: s.visitas || 0,
        expira: s.cookie && s.cookie.expires,
      }));
      res.json({ almacen: config.almacen, sesiones: lista });
    } catch (error) {
      next(error);
    }
  });

  const SECRETO_JWT = config.jwtSecreto || process.env.JWT_SECRET || 'secreto-jwt-solo-para-este-demo';

  //Funcion para ver que el token sea auentico

  function firmar(usuario) {
    return jwt.sign(
      { sub: String(usuario.id), usuario: usuario.usuario, nombre: usuario.nombre, rol: usuario.rol },
      SECRETO_JWT,
      { algorithm: 'HS256', expiresIn: config.jwtExpiraSeg, jwtid: crypto.randomUUID() }
    );
  }

  //funciona para ver quien nesesita token al estar en la aplicacion

  async function requiereJWT(req, res, next) {
    const encabezado = req.headers.authorization || '';
    if (!encabezado.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Falta el token (Authorization: Bearer ...)' });
    }
    const token = encabezado.slice('Bearer '.length);

    let datos;
    try {
      datos = jwt.verify(token, SECRETO_JWT, { algorithms: ['HS256'] });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado, inicia sesión o renuévalo' });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }

    try {
      if (config.jwtRevocar && (await tokens.estaRevocado(datos.jti))) {
        return res.status(401).json({ error: 'Token revocado' });
      }
    } catch (error) {
      return next(error);
    }
    req.jwt = datos;
    return next();
  }

  //El token es valido pero no el rol

  function requiereRolJWT(rol) {
    return (req, res, next) => {
      if (req.jwt.rol !== rol) {
        return res.status(403).json({ error: `Eres ${req.jwt.usuario}, pero esta ruta es solo para ${rol}` });
      }
      return next();
    };
  }

  const segundosRestantes = (payload) => Math.max(0, payload.exp - Math.floor(Date.now() / 1000));

  app.post('/api/jwt/login', async (req, res, next) => {
    try {
      const { usuario, contrasena } = req.body || {};
      const datos = await usuarios.verificar(usuario, contrasena);
      if (!datos) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      const token = firmar(datos);
      res.json({ token, usuario: datos, expiraEnSegundos: config.jwtExpiraSeg });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/jwt/perfil', requiereJWT, (req, res) => {
    res.json({
      mensaje: `Hola, ${req.jwt.nombre}`,
      rol: req.jwt.rol,
      expiraEnSegundos: segundosRestantes(req.jwt),
    });
  });

  app.get('/api/jwt/sesion', requiereJWT, (req, res) => {
    res.json({ payload: req.jwt, expiraEnSegundos: segundosRestantes(req.jwt) });
  });

  app.get('/api/jwt/admin/reporte', requiereJWT, requiereRolJWT('admin'), (req, res) => {
    res.json({ reporte: 'Talleres: 3 · Inscritos: 57 · Cupo libre: 18' });
  });

  app.post('/api/jwt/refresh', requiereJWT, async (req, res, next) => {
    try {
      const { sub, usuario, nombre, rol, jti, exp } = req.jwt;
      if (config.jwtRevocar) await tokens.revocar(jti, usuario, exp);
      const token = firmar({ id: sub, usuario, nombre, rol });
      res.json({ token, expiraEnSegundos: config.jwtExpiraSeg });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/jwt/logout', requiereJWT, async (req, res, next) => {
    try {
      if (config.jwtRevocar) {
        await tokens.revocar(req.jwt.jti, req.jwt.usuario, req.jwt.exp);
        return res.json({ mensaje: 'Token revocado (está en la lista negra)' });
      }
      res.json({ mensaje: 'El servidor no guarda nada: el token sigue sirviendo hasta que expire' });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/diagnostico/tokens', async (req, res, next) => {
    try {
      res.json({ revocados: await tokens.listar() });
    } catch (error) {
      next(error);
    }
  });

  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  });

  return app;
}

module.exports = { crearApp, NOMBRE_COOKIE };

//infografia sobre la autentificacion sobre el uso de jwt y como se usa
//con el uso del archivo que se les va aproveer deberan de completar y realizar las pruevas al
//ejercicio de sesiones en el archivo llmado xxx para implementarlo en el archivo demo
