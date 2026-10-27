requiereSesionAdmin();

const admin = obtenerAdminActual();
document.getElementById('nombreAdmin').textContent = `${admin.nombre} ${admin.apellido} (${admin.rol})`;

document.getElementById('btnCerrarSesionAdmin').addEventListener('click', cerrarSesionAdmin);

document.querySelectorAll('.pestana-btn').forEach(boton => {
    boton.addEventListener('click', function () {
        document.querySelectorAll('.pestana-btn').forEach(b => b.classList.remove('activa'));
        document.querySelectorAll('.seccion').forEach(s => s.classList.add('oculta'));

        this.classList.add('activa');
        const seccion = this.dataset.seccion;
        document.getElementById('seccion' + seccion.charAt(0).toUpperCase() + seccion.slice(1)).classList.remove('oculta');
    });
});

async function cargarEspecialidadesSelect() {
    const select = document.getElementById('especialidadMedico');
    select.innerHTML = '<option value="">Selecciona una especialidad</option>';

    try {
        const respuesta = await fetch(`${API.institucional}/especialidades`);
        const especialidades = await respuesta.json();

        especialidades.forEach(esp => {
            const opcion = document.createElement('option');
            opcion.value = esp.id_especialidad;
            opcion.textContent = esp.nombre;
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
    }
}

async function cargarMedicos() {
    const contenedor = document.getElementById('listaMedicos');

    try {
        const respuesta = await fetch(`${API.medicos}/medicos`);
        const medicos = await respuesta.json();

        if (medicos.length === 0) {
            contenedor.innerHTML = '<p>No hay médicos registrados.</p>';
            return;
        }

        contenedor.innerHTML = medicos.map(m => `
            <div class="tarjeta-cita">
                <p><strong>${m.nombre} ${m.apellido}</strong> - ${m.especialidad}</p>
                <p>Documento: ${m.documento} | Correo: ${m.correo} | Tel: ${m.telefono || 'N/A'}</p>
                <button class="btn-eliminar-medico" data-id="${m.id_medico}">Desactivar</button>
            </div>
        `).join('');

        document.querySelectorAll('.btn-eliminar-medico').forEach(boton => {
            boton.addEventListener('click', async function () {
                const id = this.dataset.id;
                if (!confirm('¿Desactivar este médico?')) return;

                try {
                    const respuesta = await fetch(`${API.medicos}/medicos/${id}`, { method: 'DELETE' });
                    if (!respuesta.ok) {
                        alert('No se pudo desactivar el médico');
                        return;
                    }
                    cargarMedicos();
                } catch (error) {
                    alert('Error al conectar con el servidor');
                    console.error(error);
                }
            });
        });

    } catch (error) {
        contenedor.innerHTML = '<p>Error al cargar los médicos.</p>';
        console.error(error);
    }
}

document.getElementById('formMedico').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const mensaje = document.getElementById('mensajeMedico');
    mensaje.textContent = '';
    mensaje.className = '';

    const nuevoMedico = {
        nombre: document.getElementById('nombreMedico').value,
        apellido: document.getElementById('apellidoMedico').value,
        documento: document.getElementById('documentoMedico').value,
        correo: document.getElementById('correoMedico').value,
        telefono: document.getElementById('telefonoMedico').value,
        id_especialidad: document.getElementById('especialidadMedico').value
    };

    try {
        const respuesta = await fetch(`${API.medicos}/medicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoMedico)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || 'Error al crear el médico';
            mensaje.className = 'mensaje-error';
            return;
        }

        mensaje.textContent = 'Médico creado correctamente';
        mensaje.className = 'mensaje-exito';
        document.getElementById('formMedico').reset();
        cargarMedicos();

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor';
        mensaje.className = 'mensaje-error';
        console.error(error);
    }
});

async function cargarServiciosAdmin() {
    const contenedor = document.getElementById('listaServicios');

    try {
        const respuesta = await fetch(`${API.institucional}/servicios`);
        const servicios = await respuesta.json();

        if (servicios.length === 0) {
            contenedor.innerHTML = '<p>No hay servicios registrados.</p>';
            return;
        }

        contenedor.innerHTML = servicios.map(s => `
            <div class="tarjeta-cita">
                <p><strong>${s.nombre}</strong> - $${s.precio} (${s.duracion_minutos} min)</p>
                <p>${s.descripcion || ''}</p>
                <button class="btn-eliminar-servicio" data-id="${s.id_servicio}">Desactivar</button>
            </div>
        `).join('');

        document.querySelectorAll('.btn-eliminar-servicio').forEach(boton => {
            boton.addEventListener('click', async function () {
                const id = this.dataset.id;
                if (!confirm('¿Desactivar este servicio?')) return;

                try {
                    const respuesta = await fetch(`${API.institucional}/servicios/${id}`, { method: 'DELETE' });
                    if (!respuesta.ok) {
                        alert('No se pudo desactivar el servicio');
                        return;
                    }
                    cargarServiciosAdmin();
                } catch (error) {
                    alert('Error al conectar con el servidor');
                    console.error(error);
                }
            });
        });

    } catch (error) {
        contenedor.innerHTML = '<p>Error al cargar los servicios.</p>';
        console.error(error);
    }
}

document.getElementById('formServicio').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const mensaje = document.getElementById('mensajeServicio');
    mensaje.textContent = '';
    mensaje.className = '';

    const nuevoServicio = {
        nombre: document.getElementById('nombreServicio').value,
        descripcion: document.getElementById('descripcionServicio').value,
        precio: document.getElementById('precioServicio').value,
        duracion_minutos: document.getElementById('duracionServicio').value,
        id_informacion: 1
    };

    try {
        const respuesta = await fetch(`${API.institucional}/servicios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoServicio)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || 'Error al crear el servicio';
            mensaje.className = 'mensaje-error';
            return;
        }

        mensaje.textContent = 'Servicio creado correctamente';
        mensaje.className = 'mensaje-exito';
        document.getElementById('formServicio').reset();
        cargarServiciosAdmin();

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor';
        mensaje.className = 'mensaje-error';
        console.error(error);
    }
});

async function cargarEspecialidadesAdmin() {
    const contenedor = document.getElementById('listaEspecialidades');

    try {
        const respuesta = await fetch(`${API.institucional}/especialidades`);
        const especialidades = await respuesta.json();

        if (especialidades.length === 0) {
            contenedor.innerHTML = '<p>No hay especialidades registradas.</p>';
            return;
        }

        contenedor.innerHTML = especialidades.map(e => `
            <div class="tarjeta-cita">
                <p><strong>${e.nombre}</strong></p>
                <p>${e.descripcion || ''}</p>
                <button class="btn-eliminar-especialidad" data-id="${e.id_especialidad}">Desactivar</button>
            </div>
        `).join('');

        document.querySelectorAll('.btn-eliminar-especialidad').forEach(boton => {
            boton.addEventListener('click', async function () {
                const id = this.dataset.id;
                if (!confirm('¿Desactivar esta especialidad?')) return;

                try {
                    const respuesta = await fetch(`${API.institucional}/especialidades/${id}`, { method: 'DELETE' });
                    if (!respuesta.ok) {
                        alert('No se pudo desactivar la especialidad');
                        return;
                    }
                    cargarEspecialidadesAdmin();
                    cargarEspecialidadesSelect();
                } catch (error) {
                    alert('Error al conectar con el servidor');
                    console.error(error);
                }
            });
        });

    } catch (error) {
        contenedor.innerHTML = '<p>Error al cargar las especialidades.</p>';
        console.error(error);
    }
}

document.getElementById('formEspecialidad').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const mensaje = document.getElementById('mensajeEspecialidad');
    mensaje.textContent = '';
    mensaje.className = '';

    const nuevaEspecialidad = {
        nombre: document.getElementById('nombreEspecialidad').value,
        descripcion: document.getElementById('descripcionEspecialidad').value
    };

    try {
        const respuesta = await fetch(`${API.institucional}/especialidades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaEspecialidad)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || 'Error al crear la especialidad';
            mensaje.className = 'mensaje-error';
            return;
        }

        mensaje.textContent = 'Especialidad creada correctamente';
        mensaje.className = 'mensaje-exito';
        document.getElementById('formEspecialidad').reset();
        cargarEspecialidadesAdmin();
        cargarEspecialidadesSelect();

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor';
        mensaje.className = 'mensaje-error';
        console.error(error);
    }
});

async function cargarCitasAdmin() {
    const contenedor = document.getElementById('listaCitasAdmin');

    try {
        const respuesta = await fetch(`${API.citas}/citas/todas`);
        const citas = await respuesta.json();

        if (citas.length === 0) {
            contenedor.innerHTML = '<p>No hay citas registradas.</p>';
            return;
        }

        contenedor.innerHTML = citas.map(c => `
            <div class="tarjeta-cita">
                <p><strong>Fecha:</strong> ${c.fecha.split('T')[0]} - ${c.hora}</p>
                <p><strong>Paciente:</strong> ${c.paciente}</p>
                <p><strong>Médico:</strong> ${c.medico}</p>
                <p><strong>Servicio:</strong> ${c.servicio}</p>
                <p><strong>Estado:</strong> <span class="estado-${c.estado}">${c.estado}</span></p>
                ${c.estado === 'pendiente' ? `
                    <button class="btn-confirmar-cita" data-id="${c.id_cita}">Confirmar</button>
                ` : ''}
            </div>
        `).join('');

        document.querySelectorAll('.btn-confirmar-cita').forEach(boton => {
            boton.addEventListener('click', async function () {
                const id = this.dataset.id;

                try {
                    const respuesta = await fetch(`${API.citas}/citas/${id}/estado`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: 'confirmada', observaciones: 'Confirmada por el administrador' })
                    });

                    if (!respuesta.ok) {
                        alert('No se pudo confirmar la cita');
                        return;
                    }
                    cargarCitasAdmin();
                } catch (error) {
                    alert('Error al conectar con el servidor');
                    console.error(error);
                }
            });
        });

    } catch (error) {
        contenedor.innerHTML = '<p>Error al cargar las citas.</p>';
        console.error(error);
    }
}

document.getElementById('formBuscarPaciente').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const documento = document.getElementById('documentoBusqueda').value;
    const mensaje = document.getElementById('mensajeResultado');
    const bloquePaciente = document.getElementById('pacienteEncontrado');

    mensaje.textContent = '';
    bloquePaciente.classList.add('oculta');

    try {
        const respuesta = await fetch(`${API.pacientes}/pacientes/buscar/${documento}`);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || 'Paciente no encontrado';
            mensaje.className = 'mensaje-error';
            return;
        }

        document.getElementById('infoPacienteEncontrado').textContent =
            `Paciente encontrado: ${datos.nombre} ${datos.apellido} (${datos.correo})`;
        document.getElementById('idPacienteResultado').value = datos.id_paciente;
        bloquePaciente.classList.remove('oculta');

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor';
        mensaje.className = 'mensaje-error';
        console.error(error);
    }
});

document.getElementById('formResultado').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const mensaje = document.getElementById('mensajeResultado');
    mensaje.textContent = '';

    const nuevoResultado = {
        id_paciente: document.getElementById('idPacienteResultado').value,
        fecha: document.getElementById('fechaResultado').value,
        tipo_examen: document.getElementById('tipoExamenResultado').value,
        resultado: document.getElementById('resultadoTexto').value,
        observaciones: document.getElementById('observacionesResultado').value
    };

    try {
        const respuesta = await fetch(`${API.laboratorio}/resultados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoResultado)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || 'Error al registrar el resultado';
            mensaje.className = 'mensaje-error';
            return;
        }

        mensaje.textContent = 'Resultado registrado correctamente';
        mensaje.className = 'mensaje-exito';
        document.getElementById('formResultado').reset();
        document.getElementById('formBuscarPaciente').reset();
        document.getElementById('pacienteEncontrado').classList.add('oculta');

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor';
        mensaje.className = 'mensaje-error';
        console.error(error);
    }
});

cargarCitasAdmin();
cargarEspecialidadesAdmin();
cargarServiciosAdmin();
cargarEspecialidadesSelect();
cargarMedicos();