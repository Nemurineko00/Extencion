import {useRouter} from 'next/router';

export default function Practica() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <main>
            <h1>Ruta dinamica de practica</h1>
            <p>El id de la practica es: {id}</p>
        </main>
    );
}