function crearModeloTokens(pool){
    //Funcion para insertar dentro de la base, los token que estaran revocados para que no se vuelvan a usar

    async function revocar(jti, usuario, exp) {
        await pool.query('INSERT IGNORE INTO tokens_revocados (jti, usuario, expira) VALUES (?, ?, FROM_UNIXTIME(?))', [jti, usuario, exp]);
    }

    async function estaRevocado(jti) {
        const [filas] = await pool.query('SELECT 1 FROM tokens_revocados WHERE jti = ?', [String(jti || '')]);
        return filas.length > 0;
    }
//Funcion para todos los token revocados
    async function listar() {
        const [filas] = await pool.query('SELECT jti, usuario, expira, revocado_en FROM tokens_revocados ORDER BY revocado_en DESC, jti');
        return filas;
    }

    async function limpiarVencidos() {
        await pool.query('DELETE FROM tokens_revocados WHERE expira < NOW()');
    }

    return {revocar, estaRevocado, listar, limpiarVencidos};
}
module.exports = {crearModeloTokens};
