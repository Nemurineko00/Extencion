const mysql = require('mysql2/promise');

/**
 * La base de datos local la usaremos para verificar que pruevas internas, 
 * se buscara que deben de crear cada uno, una cuenta en supabase.com y generaremos 
 * una api para conectrnos a un servicio en la web
 */

const pool = mysql.createPool({
    host:'localhost',
    port:3306,
    user:'root',
    password:'Dede002',
    database:'cecyt9_local',
    dateStrings:true,
    
});