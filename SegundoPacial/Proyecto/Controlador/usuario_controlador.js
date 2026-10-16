const bcrypt = require('bcryptjs');

const usuariosModelo = require('../Modelo/usuario_modelo');

const{validarCorreo, validarBoleta, validarContrasena} = require('../validaciones');

function esDuplicado(error){
    return error.code === 'ER_DUP_ENTRY || error.code === `23505';
}

async function listarUsuarios(req, res){
    try{
        const usuarios = await usuariosModelo.listar();
        res.json(usuarios);
    }catch{
        res.status(500).json({error: error.message});   
    }
}

async function obtenerUsuario(req, res){
    try{
        const usuario = await usuariosModelo.obtenerUsuario(req.params.id);
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json(usuario);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

//controlador de asistencia y talleres