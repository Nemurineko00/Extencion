

const talleres = [
  { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
  { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
  { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
  { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];


function pintarTabla(){
    //debe de obtener la tabla y rellenarla con los datos de talleres
    const cuerpoTabla = document.querySelector('#tabla-talleres tbody');
    cuerpoTabla.innerHTML = '';

    talleres.forEach((t) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${t.nombre}</td>
            <td>${t.instructor}</td>
            <td>${t.cupo}</td>
            <td>${t.inscritos}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

pintarTabla();

const formArreglos = document.getElementById('form-arreglos');
const resultadoArreglos = document.getElementById('resultado-arreglo');
const selectOperacionArreglo = document.getElementById('operacion-arreglo');

formArreglos.addEventListener('submit', (evento) =>{
    evento.preventDefault();
    const operacion = selectOperacionArreglo.value;

    let resultado;

    switch(operacion){
        case 'forEach':
            resultado = talleres.map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
            break;

        case 'map':
            resultado = talleres.map((t) => t.nombre).join('\n');
            break;

        case 'filter':
            resultado = talleres.filter((t) => t.inscritos >= t.cupo).map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
            break;

        case 'find': {
            const encontrado = talleres.find((t) => t.instructor === 'Ing. María López');
            resultado = encontrado? `- ${encontrado.nombre} (${encontrado.instructor})`: 'No se encontró ningún taller de ese instructor.';
            break;
        }

        case 'reduce': {
            const totalInscritos = talleres.reduce((acumulado, t) => acumulado + t.inscritos, 0);
            resultado = `Total de inscritos en todos los talleres: ${totalInscritos}`;
            break;
        }

        case 'filtermap':
            resultado = talleres.filter((t) => t.inscritos < t.cupo).map((t) => t.nombre).join('\n');
            break;

        default:
            resultado = '';
    }

    resultadoArreglos.textContent = resultado;
});

const formObjeto = document.getElementById(`form-objeto`);
const resultadoObejto = document.getElementById(`resultado-objeto`);

formObjeto.addEventListener(`submit`, (evento) =>{
    evento.preventDefault();

    const taller = {
        nombre : document.getElementById(`obj-nombre`).value, 
        instructor : document.getElementById(`obj-instructor`).value, 
        cupo : Number(document.getElementById(`obj-cupo`).value),
        inscritos : Number(document.getElementById(`obj-inscritos`).value)
    };

    const operacion = document.getElementById(`operacion-objeto`).value;

    let resultado;

    switch (operacion) {
        case `keys`:
            resultado = JSON.stringify(Object.keys(taller));
            break;
        case `values`:
            resultado = JSON.stringify(Object.values(taller))
            break;
        case `entries`:
            resultado = Object.entries(taller).map(([campo, valor]) => `${campo} : ${valor}`).join('\n') 
            break; 
        case `stringify`:
            resultado = JSON.stringify(taller, null, 2)
            break; 
        case `roundtrip`:
            const textoJson = JSON.stringify(taller, null, 2);
            const objetoDeVuelta = JSON.parse(textoJson);

            resultado = [
                '',
                textoJson, 
                '',
                `tipo: ${typeof objetoDeVuelta}`,
                objetoDeVuelta.nombre
            ].join('\n')
            break;                
        default:
            break;
    }

    resultadoObejto.textContent = resultado;
})