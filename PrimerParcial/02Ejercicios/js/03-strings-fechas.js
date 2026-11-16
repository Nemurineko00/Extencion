// 03-strings-fechas.js
// Métodos de string más usados + el objeto Date — conecta con la validación
// de fecha (DD/MM/AAAA) de la semana 4. Completa cada TODO.

const entrada = '  María López  ';

// TODO: trim — imprime `entrada` sin espacios sobrantes

console.log(`Ejemplo de .trim()`);
console.log(entrada.trim());

// TODO: split — parte el resultado del trim en un arreglo `partes`, separado por espacio

console.log(`Ejemplo de .split()`);
const partes = entrada.trim().split(' ');
console.log(partes);

// TODO: includes — imprime si 'correo@cecyt9.ipn.mx' contiene '@'

console.log('Ejemplo de .includes()');
console.log('correo@cecyt9.ipn.mx'.includes('@'));

// TODO: replace y replaceAll — con '05/09/2026', reemplaza '/' por '-'
//       primero con replace (una sola vez) y luego con replaceAll (todas)

console.log('Ejemplo de .replace() y .replaceAll()');
console.log('05/09/2026'.replace('/', '-'));
console.log('05/09/2026'.replaceAll('/', '-'));

// TODO: template literals — usando `nombre = 'María'` y `cupo = 25`, imprime
//       "María se inscribió en un taller con cupo para 25 personas."

console.log('Ejemplo de template');
const nombre = 'María';
const cupo = 25;
console.log(`${nombre} se inscribió en un taller con cupo para ${cupo} personas.`);

// TODO: Date — completa esta función para construir un objeto Date a partir
// de un texto 'DD/MM/AAAA' (recuerda: los meses en Date empiezan en 0)
function fechaDesdeTexto(textoFecha) {
  // TODO

  const [dia, mes, ano] = textoFecha.split('/').map(Number);
  return new Date(ano, mes - 1, dia);

}

const fecha = fechaDesdeTexto('05/09/2026');
console.log('Fecha construida', fecha.toISOString());
console.log('Día de la semana', fecha.getDay());

const hoy = new Date();
const diferenciaDias = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));
console.log(`Faltan ${diferenciaDias} dias de asistencia para el evento (puede ser negativo)` );


// TODO: usa fechaDesdeTexto('05/09/2026'), imprime su toISOString() y su
// getDay(); luego calcula cuántos días de diferencia hay contra `new Date()`
