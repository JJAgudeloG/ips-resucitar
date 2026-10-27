async function cargarResultados() {
    const contenedor = document.getElementById('listaResultados');
    const paciente = obtenerPacienteActual();

    try {
        const respuesta = await fetch(`${API.laboratorio}/resultados/paciente/${paciente.id_paciente}`, {
            headers: { 'Authorization': `Bearer ${obtenerTokenPaciente()}` }
        });

        if (!respuesta.ok) {
            contenedor.innerHTML = '<p>No se pudieron cargar los resultados.</p>';
            return;
        }

        const resultados = await respuesta.json();

        if (resultados.length === 0) {
            contenedor.innerHTML = '<p>No tienes resultados de laboratorio registrados.</p>';
            return;
        }

        contenedor.innerHTML = resultados.map(r => `
            <div class="tarjeta-cita">
                <p><strong>Fecha:</strong> ${r.fecha.split('T')[0]}</p>
                <p><strong>Examen:</strong> ${r.tipo_examen}</p>
                <p><strong>Resultado:</strong> ${r.resultado || 'Pendiente'}</p>
                ${r.observaciones ? `<p><strong>Observaciones:</strong> ${r.observaciones}</p>` : ''}
            </div>
        `).join('');

    } catch (error) {
        contenedor.innerHTML = '<p>Error al conectar con el servidor.</p>';
        console.error(error);
    }
}

cargarResultados();