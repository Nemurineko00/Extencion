const express = require('express');

const app = express();

app.use(express.json());

const PORT = 4000;

//ejemplo de una pticion por una ruta get

app.get('/Saludo', (req, res) =>{
    res.json({mensaje:"Hola oesto es una prueva web"});
});

app.post('/eco', (req, res) => {
    const {texto} = req.body;
    if(!texto){
    return res.status(400).json({error: 'El texto es obligatorio'});
    }res.status(201).json({eco:texto})
});

app.listen(PORT, ()=> {
    console.log(`Escuchando en el puerto: ${PORT}`)
});