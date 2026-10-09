import {useEffect, useState} from "react";

//Vamos acrear un servidor en express

export default function MiniServidor() {
    const [saludo, setSaludo] = useState('');
    const [texto, setTexto] = useState('');
    const [eco, setEco] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fech('Hembiamos un saludo')
        .then((res) => res.json())
        .then((data) => setSaludo(data.saludo))
        .catch((err) => setError('El mini servidor no esta responiendo, favor de verificarlo'));
    }, []); 

    async function enviarEco(e){
        e.preventDefault();
        setError('');
        const res = await fetch('mini_servidor/eco', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({texto})
        });
        const data = await res.json();
        if(res.ok){
            setEco(data.eco);
            setTexto('');
        }else{
            setError(`Error: ${data.error}`);
        }
    }

    return (
        <main>
            <h1>Get Saludo</h1>
            <p>{saludo}</p>

            <h2>Post /eco</h2>
            <form onSubmit={enviarEco} value={texto} onChange={(e) => setTexto(e.target.value)}>

                <button type="submit">Enviar</button>

            </form>

            {eco && <p>El servidor respondio: {eco}</p>}
            {eco && <p className='error'>: {error}</p>}

        </main>

    );

}