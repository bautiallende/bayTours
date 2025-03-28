// Archivo: static/js/grupos.js

document.addEventListener("DOMContentLoaded", function() {
    var rows = document.querySelectorAll("tr[data-href]");
    rows.forEach(function(row) {
        row.addEventListener("click", function() {
            window.location.href = this.dataset.href;
        });
    });
});

function exportarDatos() {
    // Obtener los parámetros actuales de la URL (filtros y ordenamiento)
    const params = new URLSearchParams(window.location.search);
    
    // Convertir los parámetros a un objeto
    const paramsObj = {};
    params.forEach((value, key) => {
        paramsObj[key] = value;
    });

    // Abrir una nueva ventana o pestaña en blanco
    const newWindow = window.open('', '_blank');

    // Realizar una solicitud POST al servidor
    fetch('/exportar_datos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paramsObj)
    })
    .then(response => {
        if (response.status === 401) {
            // Se requiere autenticación
            return response.json().then(data => {
                if (data.auth_url) {
                    newWindow.location.href = data.auth_url;
                } else {
                    alert('Se requiere autenticación. Por favor, inténtalo de nuevo.');
                    newWindow.close();
                }
            });
        } else if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        if (data.sheet_url) {
            // Redirigir la nueva ventana a la URL de la hoja de cálculo
            newWindow.location.href = data.sheet_url;
        } else if (data.error) {
            // Manejar errores si es necesario
            alert(data.error);
            newWindow.close();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al exportar los datos.');
        newWindow.close();
    });
}
