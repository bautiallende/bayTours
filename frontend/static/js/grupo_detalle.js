// Codigo para manejo de las filas en la tabla de opcionales 
document.addEventListener("DOMContentLoaded", function() {
    const rows = document.querySelectorAll("tr.clickable");

    rows.forEach(function(row) {
        const targetId = row.getAttribute('data-bs-target');
        const collapseElement = document.querySelector(targetId);
        const collapseInstance = new bootstrap.Collapse(collapseElement, { toggle: false });

        row.addEventListener("click", function() {
            collapseInstance.toggle();

            // Actualizar el atributo aria-expanded
            const expanded = row.getAttribute('aria-expanded') === 'true';
            row.setAttribute('aria-expanded', (!expanded).toString());
        });

        // Escuchar el evento de mostrar el colapso
        collapseElement.addEventListener('show.bs.collapse', function () {
            row.querySelectorAll('.contracted-content').forEach(function(element) {
                element.style.display = 'none';
            });
        });

        // Escuchar el evento de ocultar el colapso
        collapseElement.addEventListener('hide.bs.collapse', function () {
            row.querySelectorAll('.contracted-content').forEach(function(element) {
                element.style.display = 'block';
            });
        });
    });

    // Evitar que el clic en los botones internos cierre la fila
    document.querySelectorAll('.edit-optional, .add-optional').forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });
});


// codigo para el manejo del mapa 
document.addEventListener("DOMContentLoaded", function() {
    // Inicializar el mapa cuando el modal se muestra
    var map; // Declaramos la variable map fuera de las funciones

    var mapModal = document.getElementById('mapModal');
    mapModal.addEventListener('shown.bs.modal', function () {
        if (!map) {
            // Solo inicializamos el mapa si no existe
            map = L.map('mapContainer').setView([51.505, -0.09], 13); // Coordenadas de ejemplo

            // Añadir capa de mapa (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Añadir marcador (opcional)
            L.marker([51.505, -0.09]).addTo(map)
                .bindPopup('Ubicación del grupo')
                .openPopup();
        } else {
            // Si el mapa ya existe, solo actualizamos su tamaño
            map.invalidateSize();
        }
    });

    // Eliminar el mapa cuando el modal se cierra
    mapModal.addEventListener('hidden.bs.modal', function () {
        if (map) {
            map.remove(); // Eliminar la instancia del mapa
            map = null;    // Reiniciar la variable map
        }
    });
});



// codigo para el manejo de los modeales de actualizacion del guia
document.addEventListener('DOMContentLoaded', function() {
    const editGuideForm = document.getElementById('editGuideForm');
    const guideSelect = document.getElementById('guideSelect');
    const guideNameSpan = document.getElementById('guideName');

    // Al abrir el modal, obtener la lista de guías disponibles
    const editGuideModal = document.getElementById('editGuideModal');
    editGuideModal.addEventListener('show.bs.modal', function() {
        // Verificar que las fechas no sean nulas o vacías
        if (startingDate && endingDate) {
            // Realizar la solicitud al backend para obtener la lista de guías disponibles
            fetch(`/grupo/${idGroup}/available_guides?starting_date=${startingDate}&ending_date=${endingDate}`)
                .then(response => response.json())
                .then(data => {
                    if (data.current_guide && data.available_guides) {
                        guideSelect.innerHTML = '';
                        // Poblar el select con los guías disponibles
                        data.available_guides.forEach(guide => {
                            const option = document.createElement('option');
                            option.value = guide.id;
                            option.textContent = guide.name;
                            // Marcar como seleccionado si es el guía actual
                            if (guide.id == data.current_guide.id) {
                                option.selected = true;
                            }
                            guideSelect.appendChild(option);
                        });
                    } else {
                        // Manejar el caso en que no haya guías disponibles
                        guideSelect.innerHTML = '<option value="">No hay guías disponibles</option>';
                    }
                })
                .catch(error => {
                    console.error('Error al obtener la lista de guías disponibles:', error);
                });
        } else {
            console.error('Las fechas de inicio y fin no están definidas.');
            guideSelect.innerHTML = '<option value="">Fechas de inicio y fin no disponibles</option>';
        }
    });

    editGuideForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitamos el envío real del formulario

        const selectedGuideId = guideSelect.value;
        if (selectedGuideId) {
            // Enviar la actualización al backend
            fetch(`/grupo/${idGroup}/update_guide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guide_id: parseInt(selectedGuideId, 10) })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del backend:', data);
                if (data.status === 'success') {
                    console.log('Entramos en el bloque success');
                    // Actualizar la interfaz con el nuevo nombre de guía
                    const updatedGuide = data.updated_guide;
                    guideNameSpan.textContent = updatedGuide.name;

                    // Cerrar el modal manualmente
                    const modalInstance = bootstrap.Modal.getInstance(editGuideModal);
                    modalInstance.hide();

                    // Mostrar una notificación o feedback al usuario
                    console.log(data.message);
                } else {
                    // Manejar el caso de error al actualizar el guía
                    console.error('Error al actualizar el guía:', data.message);
                }
            })
            .catch(error => {
                console.error('Error al actualizar el guía:', error);
                alert('Ocurrió un error al actualizar el guía. Por favor, inténtalo de nuevo.');
            });
        } else {
            // Manejar el caso de no haber seleccionado ningún guía
            console.log('Debe seleccionar un guía.');
        }
    });
});



// Modeal que maneja los datos del buus
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const busInfoSpan = document.getElementById('busInfo');
    const editBusForm = document.getElementById('editBusForm');
    const busCompanySelect = document.getElementById('busCompanySelect');
    const busCodeInput = document.getElementById('busCodeInput');

    // Al abrir el modal, obtener la lista de compañías de buses
    const editBusModal = document.getElementById('editBusModal');
    editBusModal.addEventListener('show.bs.modal', function() {
        // Realizar la solicitud al backend para obtener las compañías de buses
        fetch(`/grupo/${idGroup}/available_bus_companies`)
            .then(response => response.json())
            .then(data => {
                busCompanySelect.innerHTML = '';
                // Poblar el select con las compañías de buses
                data.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.company_id;
                    option.textContent = company.name;
                    busCompanySelect.appendChild(option);
                });
                // Seleccionar la compañía actual
                // Puedes obtener la compañía actual de group_data si está disponible
                const currentCompanyId = "{{ group_data.bus_company_id or '' }}";
                if (currentCompanyId) {
                    busCompanySelect.value = currentCompanyId;
                }
                // Establecer el código del bus actual
                const currentBusCode = "";
                busCodeInput.value = currentBusCode;
            })
            .catch(error => {
                console.error('Error al obtener las compañías de buses:', error);
            });
    });

    editBusForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitamos el envío real del formulario

        const selectedCompanyId = busCompanySelect.value;
        const busCode = busCodeInput.value.trim();

        if (selectedCompanyId && busCode) {
            // Enviar la actualización al backend
            fetch(`/grupo/${idGroup}/update_bus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_id: parseInt(selectedCompanyId, 10),
                    bus_code: busCode
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del backend:', data);

                if (data.status === 'success') {
                    // Actualizar la interfaz con la nueva información del bus
                    const updatedBus = data.updated_bus;
                    busInfoSpan.textContent = `${updatedBus.company_name} - ${updatedBus.bus_code}`;

                    // Cerrar el modal manualmente
                    const modalElement = document.getElementById('editBusModal');
                    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                    modalInstance.hide();

                    // Mostrar una notificación o feedback al usuario
                    console.log(data.message);
                } else {
                    // Manejar el caso de error al actualizar el bus
                    console.error('Error al actualizar el bus:', data.message);
                }
            })
            .catch(error => {
                console.error('Error al actualizar el bus:', error);
                alert('Ocurrió un error al actualizar el bus. Por favor, inténtalo de nuevo.');
            });
        } else {
            // Manejar el caso de campos vacíos
            console.log('Debe seleccionar una compañía y ingresar el código del bus.');
            alert('Debe seleccionar una compañía y ingresar el código del bus.');
        }
    });
});




// modal para actualizar el agente de operaciones 
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const operationsAgentInfoSpan = document.getElementById('operationsAgentInfo');
    const editOperationsAgentForm = document.getElementById('editOperationsAgentForm');
    const operationsAgentSelect = document.getElementById('operationsAgentSelect');

    // Al abrir el modal, obtener la lista de agentes de operaciones disponibles
    const editOperationsAgentModal = document.getElementById('editOperationsAgentModal');
    editOperationsAgentModal.addEventListener('show.bs.modal', function() {
        // Realizar la solicitud al backend para obtener los agentes de operaciones disponibles
        fetch(`/grupo/${idGroup}/available_operations_agents`)
            .then(response => response.json())
            .then(data => {
                operationsAgentSelect.innerHTML = '';
                // Poblar el select con los agentes de operaciones disponibles
                data.forEach(agent => {
                    const option = document.createElement('option');
                    option.value = agent.id_operation;
                    option.textContent = `${agent.name} ${agent.surname}`;
                    operationsAgentSelect.appendChild(option);
                });
                // Seleccionar el agente actual (si es necesario)
                // Puedes obtener el agente actual de group_data si está disponible
                const currentOperationsAgentId = "{{ group_data.id_operations or '' }}";
                if (currentOperationsAgentId) {
                    operationsAgentSelect.value = currentOperationsAgentId;
                }
            })
            .catch(error => {
                console.error('Error al obtener los agentes de operaciones:', error);
            });
    });

    editOperationsAgentForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitamos el envío real del formulario

        const selectedOperationsAgentId = operationsAgentSelect.value;

        if (selectedOperationsAgentId) {
            // Enviar la actualización al backend
            fetch(`/grupo/${idGroup}/update_operations_agent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_operations: parseInt(selectedOperationsAgentId, 10)
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del backend:', data);

                if (data.status === 'success') {
                    // Actualizar la interfaz con el nuevo agente de operaciones
                    const updatedAgent = data.updated_operations;
                    operationsAgentInfoSpan.textContent = updatedAgent.name;

                    // Cerrar el modal manualmente
                    const modalElement = document.getElementById('editOperationsAgentModal');
                    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                    modalInstance.hide();

                    // Mostrar una notificación o feedback al usuario
                    console.log(data.message);
                } else {
                    // Manejar el caso de error al actualizar el agente
                    console.error('Error al actualizar el agente de operaciones:', data.message);
                }
            })
            .catch(error => {
                console.error('Error al actualizar el agente de operaciones:', error);
                alert('Ocurrió un error al actualizar el agente de operaciones. Por favor, inténtalo de nuevo.');
            });
        } else {
            // Manejar el caso de no haber seleccionado ningún agente
            console.log('Debe seleccionar un agente de operaciones.');
            alert('Debe seleccionar un agente de operaciones.');
        }
    });
});



// modal para actualizar el asistente 
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const assistantInfoSpan = document.getElementById('assistantInfo');
    const editAssistantForm = document.getElementById('editAssistantForm');
    const assistantSelect = document.getElementById('assistantSelect');

    // Al abrir el modal, obtener la lista de asistentes disponibles
    const editAssistantModal = document.getElementById('editAssistantModal');
    editAssistantModal.addEventListener('show.bs.modal', function() {
        // Realizar la solicitud al backend para obtener los asistentes disponibles
        fetch(`/grupo/${idGroup}/available_assistants`)
            .then(response => response.json())
            .then(data => {
                assistantSelect.innerHTML = '';
                // Poblar el select con los asistentes disponibles
                data.forEach(assistant => {
                    const option = document.createElement('option');
                    option.value = assistant.id_assistant;
                    option.textContent = `${assistant.name} ${assistant.surname}`;
                    assistantSelect.appendChild(option);
                });
                // Seleccionar el asistente actual (si es necesario)
                const currentAssistantId = "{{ group_data.id_assistant or '' }}";
                if (currentAssistantId) {
                    assistantSelect.value = currentAssistantId;
                }
            })
            .catch(error => {
                console.error('Error al obtener los asistentes:', error);
            });
    });

    editAssistantForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitamos el envío real del formulario

        const selectedAssistantId = assistantSelect.value;

        if (selectedAssistantId) {
            // Enviar la actualización al backend
            fetch(`/grupo/${idGroup}/update_assistant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_assistant: parseInt(selectedAssistantId, 10)
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del backend:', data);

                if (data.status === 'success') {
                    // Actualizar la interfaz con el nuevo asistente
                    const updatedAssistant = data.updated_assistant;
                    assistantInfoSpan.textContent = updatedAssistant.name;

                    // Cerrar el modal manualmente
                    const modalElement = document.getElementById('editAssistantModal');
                    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                    modalInstance.hide();

                    // Mostrar una notificación o feedback al usuario
                    console.log(data.message);
                } else {
                    // Manejar el caso de error al actualizar el asistente
                    console.error('Error al actualizar el asistente:', data.message);
                }
            })
            .catch(error => {
                console.error('Error al actualizar el asistente:', error);
                alert('Ocurrió un error al actualizar el asistente. Por favor, inténtalo de nuevo.');
            });
        } else {
            // Manejar el caso de no haber seleccionado ningún asistente
            console.log('Debe seleccionar un asistente.');
            alert('Debe seleccionar un asistente.');
        }
    });
});


// Modal para actualizacion de responsable de los hoteles 
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const responsibleHotelsInfoSpan = document.getElementById('responsibleHotelsInfo');
    const editResponsibleHotelsForm = document.getElementById('editResponsibleHotelsForm');
    const responsibleHotelsSelect = document.getElementById('responsibleHotelsSelect');

    // Al abrir el modal, obtener la lista de responsables de hoteles disponibles
    const editResponsibleHotelsModal = document.getElementById('editResponsibleHotelsModal');
    editResponsibleHotelsModal.addEventListener('show.bs.modal', function() {
        // Realizar la solicitud al backend para obtener los responsables de hoteles disponibles
        fetch(`/grupo/${idGroup}/available_responsible_hotels`)
            .then(response => response.json())
            .then(data => {
                responsibleHotelsSelect.innerHTML = '';
                // Poblar el select con los responsables de hoteles disponibles
                data.forEach(responsible => {
                    const option = document.createElement('option');
                    option.value = responsible.id_responsible_hotels;
                    option.textContent = `${responsible.name} ${responsible.surname}`;
                    responsibleHotelsSelect.appendChild(option);
                });
                // Seleccionar el responsable actual (si es necesario)
                const currentResponsibleId = "{{ group_data.id_responsible_hotels or '' }}";
                if (currentResponsibleId) {
                    responsibleHotelsSelect.value = currentResponsibleId;
                }
            })
            .catch(error => {
                console.error('Error al obtener los responsables de hoteles:', error);
            });
    });

    editResponsibleHotelsForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitamos el envío real del formulario

        const selectedResponsibleId = responsibleHotelsSelect.value;

        if (selectedResponsibleId) {
            // Enviar la actualización al backend
            fetch(`/grupo/${idGroup}/update_responsible_hotels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_responsible_hotels: parseInt(selectedResponsibleId, 10)
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del backend:', data);

                if (data.status === 'success') {
                    // Actualizar la interfaz con el nuevo responsable de hoteles
                    const updatedResponsible = data.updated_responsable_hotels;
                    responsibleHotelsInfoSpan.textContent = updatedResponsible.name;

                    // Cerrar el modal manualmente
                    const modalElement = document.getElementById('editResponsibleHotelsModal');
                    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                    modalInstance.hide();

                    // Mostrar una notificación o feedback al usuario
                    console.log(data.message);
                } else {
                    // Manejar el caso de error al actualizar el responsable
                    console.error('Error al actualizar el responsable de hoteles:', data.message);
                }
            })
            .catch(error => {
                console.error('Error al actualizar el responsable de hoteles:', error);
                alert('Ocurrió un error al actualizar el responsable de hoteles. Por favor, inténtalo de nuevo.');
            });
        } else {
            // Manejar el caso de no haber seleccionado ningún responsable
            console.log('Debe seleccionar un responsable de hoteles.');
            alert('Debe seleccionar un responsable de hoteles.');
        }
    });
});