async function cargarInformacionInstitucional() {
    const contenedor = document.getElementById('infoInstitucional');

    try {
        const respuesta = await fetch(`${API.institucional}/institucional`);
        const info = await respuesta.json();

        document.querySelector('.logo span:last-child').textContent = info.nombre;

        contenedor.innerHTML = `
            <div class="info-item"><span class="info-icono">📌</span><div><strong>Dirección</strong><p>${info.direccion}</p></div></div>
            <div class="info-item"><span class="info-icono">📞</span><div><strong>Teléfono</strong><p>${info.telefono}</p></div></div>
            <div class="info-item"><span class="info-icono">✉️</span><div><strong>Correo</strong><p>${info.correo}</p></div></div>
            <div class="info-item"><span class="info-icono">🕒</span><div><strong>Horario</strong><p>${info.horario_atencion}</p></div></div>
        `;
    } catch (error) {
        contenedor.innerHTML = '<p>No se pudo cargar la información institucional.</p>';
        console.error(error);
    }
}

async function cargarServiciosPublicos() {
    const contenedor = document.getElementById('listaServiciosPublica');

    try {
        const respuesta = await fetch(`${API.institucional}/servicios`);
        const servicios = await respuesta.json();

        if (servicios.length === 0) {
            contenedor.innerHTML = '<p>Próximamente más servicios.</p>';
            return;
        }

        contenedor.innerHTML = servicios.map(s => `
            <div class="tarjeta-cita">
                <p><strong>${s.nombre}</strong> - $${s.precio}</p>
                <p>${s.descripcion || ''}</p>
            </div>
        `).join('');
    } catch (error) {
        contenedor.innerHTML = '<p>No se pudieron cargar los servicios.</p>';
        console.error(error);
    }
}

async function cargarEspecialidadesPublicas() {
    const contenedor = document.getElementById('listaEspecialidadesPublica');

    try {
        const respuesta = await fetch(`${API.institucional}/especialidades`);
        const especialidades = await respuesta.json();

        if (especialidades.length === 0) {
            contenedor.innerHTML = '<p>Próximamente más especialidades.</p>';
            return;
        }

        contenedor.innerHTML = especialidades.map(e => `
            <div class="tarjeta-cita">
                <p><strong>${e.nombre}</strong></p>
                <p>${e.descripcion || ''}</p>
            </div>
        `).join('');
    } catch (error) {
        contenedor.innerHTML = '<p>No se pudieron cargar las especialidades.</p>';
        console.error(error);
    }
}

cargarInformacionInstitucional();
cargarServiciosPublicos();
cargarEspecialidadesPublicas(); 