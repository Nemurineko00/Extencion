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

async function CrearUsuario(req, res) {
    const{nombre, correo, contrasena, boleta, rol} = req.body;

    if(!nombre || !correo || !contrasena || !boleta){
        return res.status(400).json({error: 'Los campos son obligatorios'});
    }
    if(!validarCorreo(correo)) return res.status(400).json({error: 'El correo no tiene un formato valido'});
    if(!validarBoleta(boleta)) return res.status(400).json({error: 'La boleta no tiene un formato valido'});
    if(!validarContrasena(contrasena)) return res.status(400).json({error: 'La contrasena no tiene un formato valido'});

    try{
        const constrasenaHash = await bcrypt.hash(contrasena, 10);
        const usuario = await usuariosModelo.crear({ombre, correo, contrasena, boleta, rol});
        res.status(201).json(usuario);
    }catch{
        if(esDuplicado(error)) return res.status(409).json({error: 'Ya existe un usuario con ese correo o boleta registrado'});
        res.status(500).json({error: error.message});
    }
}

async function actualizarUsuario(req, res) {
    const{nombre, correo, contrasena, boleta, rol} = req.body;

    if(nombre === undefined && correo === undefined && rol === undefined){
        return res.status(400).json({error: 'Se deben de llenar todos los campos'});
    }
    if(correo !== undefined && !validarCorreo(correo)){
        return res.status(400).json({error: 'El correo no tiene un formato valido'});
    }
    try{
        const usuario = await usuariosModelo.actualizar(req.params.id, {nombre, correo, rol});
        if(!usuario) return res.status(400).json({error: 'Usuario no encontrado'})
            res.json(usuario)
    }catch(error){
        if(esDuplicado(error)) return res.status(400).json({error: 'Ya existe un usuario con ese correo o boleta registrado'});
        res.status(500).json({error: error.message});
    }
}

async function eliminarUsuario(req, res) {
    try{
        const eliminado = await usuariosModelo.eliminar(req.params.id);
        if(!eliminado) return res.status(400).json({error: 'No encontro al usuario'});
        res.status(204).send();
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

module.exports = {listarUsuarios, obtenerUsuario, CrearUsuario, actualizarUsuario, eliminarUsuario}