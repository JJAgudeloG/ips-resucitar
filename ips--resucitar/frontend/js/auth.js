function guardarSesionPaciente(token, paciente) {
    localStorage.setItem('token_paciente', token);
    localStorage.setItem('paciente', JSON.stringify(paciente));
}

function obtenerTokenPaciente() {
    return localStorage.getItem('token_paciente');
}

function obtenerPacienteActual() {
    const data = localStorage.getItem('paciente');
    return data ? JSON.parse(data) : null;
}

function cerrarSesionPaciente() {
    localStorage.removeItem('token_paciente');
    localStorage.removeItem('paciente');
    window.location.href = 'login.html';
}

function requiereSesionPaciente() {
    if (!obtenerTokenPaciente()) {
        window.location.href = 'login.html';
    }
}

function guardarSesionAdmin(token, usuario) {
    localStorage.setItem('token_admin', token);
    localStorage.setItem('admin', JSON.stringify(usuario));
}

function obtenerTokenAdmin() {
    return localStorage.getItem('token_admin');
}

function obtenerAdminActual() {
    const data = localStorage.getItem('admin');
    return data ? JSON.parse(data) : null;
}

function cerrarSesionAdmin() {
    localStorage.removeItem('token_admin');
    localStorage.removeItem('admin');
    window.location.href = 'login.html';
}

function requiereSesionAdmin() {
    if (!obtenerTokenAdmin()) {
        window.location.href = 'login.html';
    }
}