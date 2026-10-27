const formLoginAdmin = document.getElementById('formLoginAdmin');
if (formLoginAdmin) {
    formLoginAdmin.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const correo = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;
        const mensajeError = document.getElementById('mensajeError');

        mensajeError.textContent = '';

        try {
            const respuesta = await fetch(`${API.admin}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                mensajeError.textContent = datos.mensaje || 'Error al iniciar sesión';
                return;
            }

            guardarSesionAdmin(datos.token, datos.usuario);
            window.location.href = 'dashboard.html';

        } catch (error) {
            mensajeError.textContent = 'No se pudo conectar con el servidor';
            console.error(error);
        }
    });
}