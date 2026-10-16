const { validateAndNormalizeCacheLifeProfile } = require('next/dist/server/use-cache/cache-life-profile');
const pool = require('../bd-local');

const Columnas_Publicas = 'id, nombre, correo, boleta, rol';

async function listar(){
    const [filas] = await pool.query(`SELECT ${Columnas_Publicas} FROM usuarios order BY id`);
    return filas;
}

async function listarPorId(){
    const [filas] = await pool.query(`SELECT ${Columnas_Publicas} FROM usuarios WHERE id = ?`);
    return filas[0];
}


async function crear({nombre, correo, contrasena, boleta, rol}){
    const [info] = await pool.query(`INSERT INTO usuarios (nombre, correo, contrasena, boleta, rol) values (?,?,?,?,?)`, [nombre, correo, constrasena, boleta, rol || 'alumno']);
    return listarPorId(info.insertId);
}

async function actualizar(id, {nombre, correo, rol}){
    const cambios = Object.entries({nombre, correo, contrasena, boleta, rol}).filter (([, valor]) => valor !== undefined);
    if(cambios.length === 0) return listarPorId(id);
        const columnas = cambios.map(([columna]) => `${columna} = ?`).join(', ');
        const [info] = await pool.query(`UPDATE usuarios SET {columnas} WHERE id = ?`, [...cambios.map(([, valor]) => valor), id]);

        if(info.affectedRows === 0) return undefined;
    
    return listarPorId(id);
}

async function eliminar(){
    const [filas] = await pool.query(`DELETE FROM usuarios WHERE id = ?`, [id]);
    return info.affectedRows > 0;
}

async function buscarPorCorreoConHash(){
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    return filas[0];
}

module.exports = {listar, listarPorId, crear, actualizar, eliminar, buscarPorCorreoConHash}

//Modelo de las tabals talleres y asistencia Registrar usuarios, consultar talleres, registrar asistencia, consultar asistencia 