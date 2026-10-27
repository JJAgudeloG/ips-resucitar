const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const correo = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;
        const mensajeError = document.getElementById('mensajeError');

        mensajeError.textContent = '';

        try {
            const respuesta = await fetch(`${API.pacientes}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                mensajeError.textContent = datos.mensaje || 'Error al iniciar sesión';
                return;
            }

            guardarSesionPaciente(datos.token, datos.paciente);
            window.location.href = 'dashboard.html';

        } catch (error) {
            mensajeError.textContent = 'No se pudo conectar con el servidor';
            console.error(error);
        }
    });
}

const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
    formRegistro.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const mensaje = document.getElementById('mensajeRegistro');
        mensaje.textContent = '';
        mensaje.className = '';

        const nuevoPaciente = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            documento: document.getElementById('documento').value,
            correo: document.getElementById('correo').value,
            telefono: document.getElementById('telefono').value,
            contrasena: document.getElementById('contrasena').value
        };

        try {
            const respuesta = await fetch(`${API.pacientes}/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoPaciente)
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                mensaje.textContent = datos.mensaje || 'Error al registrarse';
                mensaje.className = 'mensaje-error';
                return;
            }

            mensaje.textContent = 'Cuenta creada correctamente. Redirigiendo al login...';
            mensaje.className = 'mensaje-exito';

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            mensaje.textContent = 'No se pudo conectar con el servidor';
            mensaje.className = 'mensaje-error';
            console.error(error);
        }
    });
}