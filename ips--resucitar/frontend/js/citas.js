requiereSesionPaciente();

const paciente = obtenerPacienteActual();
document.getElementById('nombrePaciente').textContent = `${paciente.nombre} ${paciente.apellido}`;

document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesionPaciente);

document.querySelectorAll('.pestana-btn').forEach(boton => {
    boton.addEventListener('click', function () {
        document.querySelectorAll('.pestana-btn').forEach(b => b.classList.remove('activa'));
        document.querySelectorAll('.seccion').forEach(s => s.classList.add('oculta'));

        this.classList.add('activa');
        const seccion = this.dataset.seccion;
        document.getElementById('seccion' + seccion.charAt(0).toUpperCase() + seccion.slice(1)).classList.remove('oculta');
    });
});

async function cargarCitas() {
    const contenedor = document.getElementById('listaCitas');

    try {
        const respuesta = await fetch(`${API.citas}/citas/paciente/${paciente.id_paciente}`);
        const citas = await respuesta.json();

        if (citas.length === 0) {
            contenedor.innerHTML = '<p>No tienes citas registradas.</p>';
            return;
        }

        const citasConPago = await Promise.all(
            citas.map(async (cita) => {
                let yaPagada = false;
                try {
                    const respPago = await fetch(`${API.pagos}/pagos/cita/${cita.id_cita}`);
                    const pagos = await respPago.json();
                    yaPagada = pagos.length > 0;
                } catch (error) {
                    yaPagada = false;
                }
                return { ...cita, yaPagada };
            })
        );

        contenedor.innerHTML = citasConPago.map(cita => `
            <div class="tarjeta-cita">
                <p><strong>Fecha:</strong> ${cita.fecha.split('T')[0]} - ${cita.hora}</p>
                <p><strong>Médico:</strong> ${cita.medico} (${cita.especialidad || 'N/A'})</p>
                <p><strong>Servicio:</strong> ${cita.servicio}</p>
                <p><strong>Estado:</strong> <span class="estado-${cita.estado}">${cita.estado}</span></p>
                ${(cita.estado === 'pendiente' || cita.estado === 'confirmada') ? `
                    <button class="btn-cancelar" data-id="${cita.id_cita}">Cancelar cita</button>
                    ${cita.yaPagada
                        ? '<span class="estado-confirmada">Ya pagada</span>'
                        : `<button class="btn-pagar" data-id="${cita.id_cita}">Pagar cita</button>`
                    }
                ` : ''}
            </div>
        `).join('');

        document.querySelectorAll('.btn-cancelar').forEach(boton => {
            boton.addEventListener('click', async function () {
                const idCita = this.dataset.id;
                if (!confirm('¿Seguro que quieres cancelar esta cita?')) return;

                try {
                    const respuesta = await fetch(`${API.citas}/citas/${idCita}/estado`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: 'cancelada', observaciones: 'Cancelada por el paciente' })
                    });

                    if (!respuesta.ok) {
                        alert('No se pudo cancelar la cita');
                        return;
                    }
                    cargarCitas();
                } catch (error) {
                    alert('Error al conectar con el servidor');
                    console.error(error);
                }
            });
        });

        document.querySelectorAll('.btn-pagar').forEach(boton => {
            boton.addEventListener('click', function () {
                document.getElementById('citaIdPago').value = this.dataset.id;
                document.getElementById('modalPago').classList.remove('oculta');
            });
        });

    } catch (error) {
        contenedor.innerHTML = '<p>Error al cargar las citas.</p>';
        console.error(error);
    }
}

async function cargarServicios() {
    const select = document.getElementById('servicio');
    try {
        const respuesta = await fetch(`${API.institucional}/servicios`);
        const servicios = await respuesta.json();

        servicios.forEach(servicio => {
            const opcion = document.createElement('option');
            opcion.value = servicio.id_servicio;
            opcion.textContent = `${servicio.nombre} - $${servicio.precio}`;
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error al cargar servicios:', error);
    }
}

async function cargarMedicos() {
    const select = document.getElementById('medico');
    try {
        const respuesta = await fetch(`${API.medicos}/medicos`);
        const medicos = await respuesta.json();

        medicos.forEach(medico => {
            const opcion = document.createElement('option');
            opcion.value = medico.id_medico;
            opcion.textContent = `${medico.nombre} ${medico.apellido} - ${medico.especialidad}`;
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error al cargar médicos:', error);
    }
}

document.getElementById('formAgendar').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const mensaje = document.getElementById('mensajeAgendar');
    mensaje.textContent = '';
    mensaje.className = '';

    const nuevaCita = {
        id_paciente: paciente.id_paciente,
        id_medico: document.getElementById('medico').value,
        id_servicio: document.getElementById('servicio').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        observaciones: document.getElementById('observaciones').value
    };

    try {
        const respuesta = await fetch(`${API.citas}/citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaCita)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || 'Error al agendar la cita';
            mensaje.className = 'mensaje-error';
            return;
        }

        mensaje.textContent = 'Cita agendada correctamente';
        mensaje.className = 'mensaje-exito';
        document.getElementById('formAgendar').reset();
        cargarCitas();

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor';
        mensaje.className = 'mensaje-error';
        console.error(error);
    }
});

document.getElementById('cerrarModalPago').addEventListener('click', function () {
    document.getElementById('modalPago').classList.add('oculta');
});

document.getElementById('formPago').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const mensaje = document.getElementById('mensajePago');
    mensaje.textContent = '';

    const nuevoPago = {
        id_cita: document.getElementById('citaIdPago').value,
        monto: document.getElementById('montoPago').value,
        metodo_pago: document.getElementById('metodoPago').value,
        referencia: document.getElementById('referenciaPago').value
    };

    try {
        const respuesta = await fetch(`${API.pagos}/pagos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPago)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje || 'Error al registrar el pago';
            mensaje.className = 'mensaje-error';
            return;
        }

        mensaje.textContent = 'Pago registrado correctamente';
        mensaje.className = 'mensaje-exito';
        cargarCitas();

        setTimeout(() => {
            document.getElementById('modalPago').classList.add('oculta');
            document.getElementById('formPago').reset();
            mensaje.textContent = '';
        }, 1500);

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor';
        mensaje.className = 'mensaje-error';
        console.error(error);
    }
});

cargarCitas();
cargarServicios();
cargarMedicos();