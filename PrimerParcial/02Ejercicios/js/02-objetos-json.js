// 02-objetos-json.js
// Object.keys/values/entries y JSON.stringify/parse. Completa cada TODO.

const taller = {
  nombre: 'Introducción a Python',
  instructor: 'Ing. María López',
  cupo: 25,
  inscritos: 25,
};

console.log(`manejo de keys`);
console.log(Object.keys(taller));

console.log(`Manejo de los valores`);
console.log(Object.values(taller));

console.log(`Manejo de propiedades de un objeto`);
for(const [campo, valor] of Object.entries(taller)){
  console.log(`${campo} : ${valor}`)
}

console.log(`Transformacion de json a cadena`);
const textoJson = JSON.stringify(taller, null, 2);
console.log(`tipo :`, typeof textoJson);

console.log(`Regreso del objeto`);
const objetoDeVuelta = JSON.parse(textoJson);
console.log(`tipo :`, typeof objetoDeVuelta);
console.log(objetoDeVuelta.nombre);