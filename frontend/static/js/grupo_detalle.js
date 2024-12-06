// Codigo para manejo de las filas en la tabla de opcionales 
document.addEventListener("DOMContentLoaded", function() {
    const rows = document.querySelectorAll("tr.clickable");
    rows.forEach(function(row) {
        const clientIndex = row.getAttribute('data-bs-target').replace('.details-', '');
        const collapseElements = document.querySelectorAll('.details-' + clientIndex);
        
        const collapseInstances = [];
        
        collapseElements.forEach(function(elem) {
            const collapseInstance = new bootstrap.Collapse(elem, { toggle: false });
            collapseInstances.push(collapseInstance);
        
            // Escuchar los eventos de mostrar y ocultar del colapso
            elem.addEventListener('show.bs.collapse', function () {
                // Al expandir, ocultar el contenido contraído en la celda correspondiente
                const parentTd = elem.parentElement;
                const contractedContent = parentTd.querySelector('.contracted-content');
                if (contractedContent) {
                    contractedContent.style.display = 'none';
                }
            });

            elem.addEventListener('hide.bs.collapse', function () {
                // Al contraer, mostrar el contenido contraído en la celda correspondiente
                const parentTd = elem.parentElement;
                const contractedContent = parentTd.querySelector('.contracted-content');
                if (contractedContent) {
                    contractedContent.style.display = 'block';
                }
            });
        });

        row.addEventListener("click", function(event) {
            // Verificar si se hizo clic en un botón interno
            if (event.target.closest('.btn')) {
                return; // No hacer nada si se hizo clic en un botón
            }

            // Alternar el estado de colapso de los elementos
            collapseInstances.forEach(function(collapseInstance) {
                collapseInstance.toggle();
            });
        });
    });

    // Evitar que el clic en los botones internos cierre la fila
    document.querySelectorAll('.edit-optional, .add-optional').forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    // Manejar clic en el botón "Agregar"
    document.querySelectorAll('.add-optional').forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();

            // Obtener datos del cliente, grupo, ciudad y días de la ciudad
            const clientId = this.getAttribute('data-client-id');
            const clientName = this.getAttribute('data-client-name');
            const groupId = this.getAttribute('data-group-id');
            const city = this.getAttribute('data-city');
            const cityDays = JSON.parse(this.getAttribute('data-city-days'));


            // Abrir el modal y cargar los opcionales
            openAddOptionalModal(clientId, groupId, city, cityDays, clientName);
        });
    });

    // Manejar clic en el botón "Editar" (similar al botón "Agregar")

    document.querySelectorAll('.edit-optional').forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
    
            // Obtener datos del cliente y el día
            const clientId = this.getAttribute('data-client-id');
            const dayId = this.getAttribute('data-day-id');
            const clientName = this.getAttribute('data-client-name');
            const city = this.getAttribute('data-city');
            const cityDays = JSON.parse(this.getAttribute('data-city-days'));
            

            // Abrir el modal de opciones
            openOptionModal(clientId, dayId, clientName, idGroup, city, cityDays);
        });
    });

    function openOptionModal(clientId, dayId, clientName, groupId, city, cityDays) {
        // Mostrar el modal de opciones
        const optionModal = new bootstrap.Modal(document.getElementById('optionModal'));
        optionModal.show();
    
        // Configurar los botones en el modal
        document.getElementById('optionAdd').onclick = function() {
            optionModal.hide();
            // Reutilizar la función para agregar opcionales
            openAddOptionalModal(clientId, groupId, city, cityDays, clientName);
        };
    
        document.getElementById('optionEdit').onclick = function() {
            optionModal.hide();
            // Llamar a la función para editar opcionales
            console.log('Datos del cliente en openOptionModal:', clientId);
            console.log('Datos del grupo en openOptionModal:', groupId);
            openEditOptionalModal(clientId, dayId, clientName, groupId, city, cityDays);
        };
    
        document.getElementById('optionDelete').onclick = function() {
            optionModal.hide();
            // Llamar a la función para eliminar opcionales
            openDeleteOptionalModal(clientId, dayId, clientName, groupId);
        };
    }



    // Función para abrir el modal de "Agregar Opcionales"
    function openAddOptionalModal(clientId, groupId, city, cityDays, clientName) {

        // Establecer los valores en los campos ocultos
        document.getElementById('modalClientId').value = clientId;
        document.getElementById('modalGroupId').value = groupId;

        
        // Actualizar el título del modal
        document.querySelector('#addOptionalModal .modal-title').innerHTML = `
            Agregar opcionales para: <span style= "text-decoration: underline;">${city}</span>, Cliente: <span style= "text-decoration: underline;">${clientName}</span>
        `;

        // Generar botones para cada día
        const dayButtonsContainer = document.getElementById('dayButtons');
        dayButtonsContainer.innerHTML = '';

        cityDays.forEach(function(day, index) {
            const dayButton = document.createElement('button');
            dayButton.type = 'button';
            dayButton.classList.add('btn', 'btn-outline-primary');
            dayButton.innerText = day.date;
            dayButton.setAttribute('data-day-id', day.id);
            dayButton.addEventListener('click', function() {

                // Marcar el botón como activo
                document.querySelectorAll('#dayButtons .btn').forEach(btn => btn.classList.remove('active'));
                dayButton.classList.add('active');

                // Cargar los opcionales para este día
                loadOptionalsForDay(clientId, groupId, day.id);
                document.getElementById('modalDayId').value = day.id;
            });

            // Seleccionar el primer día por defecto
            if (index === 0) {
                dayButton.classList.add('active');
                loadOptionalsForDay(clientId, groupId, day.id);
            }
            dayButtonsContainer.appendChild(dayButton);
            //document.getElementById('modalDayId').value = day.id;
        });

        // Mostrar el modal
        const addOptionalModal = new bootstrap.Modal(document.getElementById('addOptionalModal'));
        addOptionalModal.show();
    }


    function getClientAge(clientId) {
        return clientAges[clientId];
    }

    function updateTotal() {
        const price = parseFloat(document.getElementById('priceInput').value) || 0;
        const discount = parseFloat(document.getElementById('discountInput').value) || 0;
        const total = price - (price * (discount / 100));
        document.getElementById('totalDisplay').value = total.toFixed(2) + ' €';
    }

    document.getElementById('priceInput').addEventListener('input', updateTotal);
    document.getElementById('discountInput').addEventListener('input', updateTotal);
    const discountInput = document.getElementById('discountInput');
    const discountValue = document.getElementById('discountValue');
    discountInput.addEventListener('input', function() {
        discountValue.innerText = discountInput.value + '%';
        updateTotal();
    });




    // **Añadir la función loadOptionalsForDay**

    function loadOptionalsForDay(clientId, groupId, dayId) {
        // Limpiar el contenedor de opcionales
        const optionalList = document.getElementById('optionalList');
        optionalList.innerHTML = '<p>Cargando opcionales...</p>';
    
        // Limpiar los campos adicionales
        document.getElementById('optionalDetails').style.display = 'none';
    
        // Obtener la edad del cliente
        const clientAge = getClientAge(clientId);
    
        // Realizar una solicitud al backend para obtener los opcionales disponibles
        fetch(`http://127.0.0.1:8000/optionals_purchase?id_group=${encodeURIComponent(groupId)}&id_days=${encodeURIComponent(dayId)}`)
            .then(response => response.json())
            .then(data => {
                const validOptionals = data.optionals.filter(optional => optional.id_optional && optional.name);

                if (validOptionals.length > 0) {
                    optionalList.innerHTML = '';
                    const row = document.createElement('div');
                    row.classList.add('row', 'gy-3', 'justify-content-center');

                    validOptionals.forEach(function(optional) {
                        const col = document.createElement('div');
                        col.classList.add('col-md-6', 'col-lg-4', 'd-flex', 'align-items-stretch');

                        const card = document.createElement('div');
                        card.classList.add('card', 'h-100');

                        const cardBody = document.createElement('div');
                        cardBody.classList.add('card-body', 'd-flex', 'flex-column');

                        const cardTitle = document.createElement('h5');
                        cardTitle.classList.add('card-title');
                        cardTitle.innerText = optional.name;

                        const prices = document.createElement('p');
                        prices.classList.add('card-text');
                        prices.innerHTML = `Precio adulto: ${optional.adult_price}€<br>Precio menor: ${optional.minor_price}€`;

                        // Espaciador flexible
                        const spacer = document.createElement('div');
                        spacer.classList.add('flex-grow-1');

                        // Form check (botón "Seleccionar")
                        const formCheck = document.createElement('div');
                        formCheck.classList.add('form-check', 'mt-auto');

                        const radio = document.createElement('input');
                        radio.classList.add('form-check-input');
                        radio.type = 'radio';
                        radio.name = 'id_activity';
                        radio.value = optional.id_activity;
                        radio.setAttribute('data-id-optional', optional.id_optional);
                        radio.id = `optional-${optional.id_activity}`;
                        radio.style.marginRight = '10px';

                        const label = document.createElement('label');
                        label.classList.add('form-check-label');
                        label.setAttribute('for', `optional-${optional.id_activity}`);
                        label.innerText = 'Seleccionar';

                        // Evento al seleccionar un opcional
                        radio.addEventListener('change', function() {
                            // Mostrar los campos adicionales
                            document.getElementById('optionalDetails').style.display = 'block';
                            // Predefinir el precio según la edad
                            const priceInput = document.getElementById('priceInput');
                            // Obtener la edad del cliente
                            
                           
                            if (clientAge < 12) {
                                priceInput.value = optional.minor_price;
                            } else {
                                priceInput.value = optional.adult_price;
                            }
                            // Reiniciar el descuento y total
                            document.getElementById('discountInput').value = 0;
                            document.getElementById('discountValue').innerText = '0%';
                            updateTotal();
                        });

                        formCheck.appendChild(radio);
                        formCheck.appendChild(label);

                        cardBody.appendChild(cardTitle);
                        cardBody.appendChild(prices);
                        cardBody.appendChild(spacer);
                        cardBody.appendChild(formCheck);

                        card.appendChild(cardBody);
                        col.appendChild(card);
                        row.appendChild(col);
                    });

                    optionalList.appendChild(row);

                    // Seleccionar el primer opcional por defecto
                    const firstRadio = optionalList.querySelector('input[name="id_activity"]');
                    if (firstRadio) {
                        firstRadio.checked = true;
                        firstRadio.dispatchEvent(new Event('change'));
                    }
                } else {
                    optionalList.innerHTML = '<p>No hay opcionales disponibles para este día.</p>';
                    // Ocultar los campos adicionales
                    document.getElementById('optionalDetails').style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error al obtener los opcionales:', error);
                optionalList.innerHTML = '<p>Error al cargar los opcionales.</p>';
                // Ocultar los campos adicionales
                document.getElementById('optionalDetails').style.display = 'none';
            });
    }


    function openEditOptionalModal(clientId, dayId, clientName, groupId, city, cityDays) {
        // Mostrar el modal de opciones (optionModal) ya esta funcionando, ahora en editar necesitamos similar a agregar
        // Cargamos un modal similar a addOptionalModal pero para edición.
        const optionModal = new bootstrap.Modal(document.getElementById('optionModal'));
        optionModal.hide();

        // En edición, necesitamos mostrar las fechas y luego cargar los opcionales existentes
        const editOptionalModal = new bootstrap.Modal(document.getElementById('editOptionalModal'));
        editOptionalModal.show();

        // Llenar campos ocultos
        document.getElementById('editClientId').value = clientId;
        document.getElementById('editGroupId').value = groupId;

        const editDayButtonsContainer = document.getElementById('editDayButtons');
        editDayButtonsContainer.innerHTML = '';

        const editOptionalList = document.getElementById('editOptionalList');

        // Función para cargar opcionales existentes del cliente para un día
        function loadClientOptionalsForDay(clientId, groupId, dayId) {
            editOptionalList.innerHTML = '<p>Cargando opcionales del cliente...</p>';

            fetch(`http://127.0.0.1:8000/optionals_purchase/clients_optionals?client_id=${encodeURIComponent(clientId)}&id_days=${encodeURIComponent(dayId)}&group_id=${encodeURIComponent(groupId)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.optionals && data.optionals.length > 0) {
                        editOptionalList.innerHTML = '';
                        const row = document.createElement('div');
                        row.classList.add('row', 'gy-3', 'justify-content-center');

                        data.optionals.forEach(function(optional) {
                            const col = document.createElement('div');
                            col.classList.add('col-md-6', 'col-lg-4', 'd-flex', 'align-items-stretch');

                            const card = document.createElement('div');
                            card.classList.add('card', 'h-100');

                            const cardBody = document.createElement('div');
                            cardBody.classList.add('card-body', 'd-flex', 'flex-column');

                            const cardTitle = document.createElement('h5');
                            cardTitle.classList.add('card-title');
                            // Usar optional.optional_name en lugar de 'Actividad'
                            cardTitle.innerText = optional.optional_name || 'Actividad';

                            // Crear formulario para este opcional
                            const form = document.createElement('form');
                            form.classList.add('edit-optional-form');
                            form.dataset.optionalId = optional.id_optionals;
                            form.dataset.activityId = optional.id_activity;

                            // Campos: price, discount, place_of_purchase, payment_method, total
                            // price
                            const priceGroup = document.createElement('div');
                            priceGroup.classList.add('mb-3');
                            const priceLabel = document.createElement('label');
                            priceLabel.classList.add('form-label');
                            priceLabel.innerText = 'Precio';
                            const priceInput = document.createElement('input');
                            priceInput.type = 'number';
                            priceInput.classList.add('form-control');
                            priceInput.name = 'price';
                            priceInput.step = '1';
                            priceInput.min = '0';
                            priceInput.value = optional.price || 0;
                            priceGroup.appendChild(priceLabel);
                            priceGroup.appendChild(priceInput);

                            // discount
                            const discountGroup = document.createElement('div');
                            discountGroup.classList.add('mb-3');
                            const discountLabel = document.createElement('label');
                            discountLabel.classList.add('form-label');
                            discountLabel.innerText = 'Descuento (%)';
                            const discountWrapper = document.createElement('div');
                            discountWrapper.classList.add('d-flex', 'align-items-center');

                            const discountInput = document.createElement('input');
                            discountInput.type = 'range';
                            discountInput.classList.add('form-range');
                            discountInput.name = 'discount';
                            discountInput.min = '0';
                            discountInput.max = '100';
                            discountInput.value = optional.discount || 0;
                            discountInput.style.backgroundColor = 'lightgray';

                            const discountValue = document.createElement('span');
                            discountValue.style.marginLeft = '10px';
                            discountValue.innerText = (optional.discount || 0) + '%';

                            discountInput.addEventListener('input', function() {
                                discountValue.innerText = discountInput.value + '%';
                                updateEditTotal(priceInput, discountInput, totalDisplay);
                            });

                            discountWrapper.appendChild(discountInput);
                            discountWrapper.appendChild(discountValue);
                            discountGroup.appendChild(discountLabel);
                            discountGroup.appendChild(discountWrapper);

                            // place_of_purchase
                            const placeGroup = document.createElement('div');
                            placeGroup.classList.add('mb-3');
                            const placeLabel = document.createElement('label');
                            placeLabel.classList.add('form-label');
                            placeLabel.innerText = 'Lugar de compra';
                            const placeSelect = document.createElement('select');
                            placeSelect.classList.add('form-select');
                            //placeSelect.id = 'editPlaceOfPurchase';
                            placeSelect.name = 'place_of_purchase';

                            // Opciones place_of_purchase (ejemplo: 'MEX', 'EU', 'trip')
                            const places = [
                                {value: 'before_trip', text: 'Antes del viaje'},
                                {value: 'during_trip', text: 'Durante el viaje'},
                                // Ajusta estos valores a los que tengas en el backend
                            ];
                            places.forEach(p => {
                                const opt = document.createElement('option');
                                opt.value = p.value;
                                opt.textContent = p.text;
                                placeSelect.appendChild(opt);
                            });

                            // Seleccionar el valor actual
                            // Ajustar la lógica si tus valores difieren
                            // Si en backend se guarda 'MEX' y aquí usas 'before_trip', mapealo
                            if (optional.place_of_purchase === 'MEX') {
                                placeSelect.value = 'before_trip';
                            } else {
                                placeSelect.value = 'during_trip';
                            }

                            placeGroup.appendChild(placeLabel);
                            placeGroup.appendChild(placeSelect);

                            // payment_method
                            const paymentGroup = document.createElement('div');
                            paymentGroup.classList.add('mb-3');
                            const paymentLabel = document.createElement('label');
                            paymentLabel.classList.add('form-label');
                            paymentLabel.innerText = 'Método de pago';
                            const paymentSelect = document.createElement('select');
                            paymentSelect.classList.add('form-select');
                            //paymentSelect.id = 'editPaymentMethod';
                            paymentSelect.name = 'payment_method';

                            const methods = [
                                {value: 'credit_card', text: 'Tarjeta de crédito'},
                                {value: 'debit_card', text: 'Tarjeta de débito'},
                                {value: 'cash', text: 'Efectivo'}
                            ];
                            methods.forEach(m => {
                                const opt = document.createElement('option');
                                opt.value = m.value;
                                opt.textContent = m.text;
                                paymentSelect.appendChild(opt);
                            });

                            // Ajustar el valor actual
                            // Si optional.payment_method = "Cash", asume 'cash'
                            if (optional.payment_method.toLowerCase() === 'cash') {
                                paymentSelect.value = 'cash';
                            } else {
                                // Ajustar según corresponda a los valores originales
                                paymentSelect.value = 'credit_card';
                            }

                            paymentGroup.appendChild(paymentLabel);
                            paymentGroup.appendChild(paymentSelect);

                            // total (solo lectura)
                            const totalGroup = document.createElement('div');
                            totalGroup.classList.add('mb-3');
                            const totalLabel = document.createElement('label');
                            totalLabel.classList.add('form-label');
                            totalLabel.innerText = 'Total';
                            const totalDisplay = document.createElement('input');
                            totalDisplay.type = 'text';
                            totalDisplay.classList.add('form-control');
                            totalDisplay.name = 'total';
                            totalDisplay.readOnly = true;

                            form.appendChild(priceGroup);
                            form.appendChild(discountGroup);
                            form.appendChild(placeGroup);
                            form.appendChild(paymentGroup);
                            totalGroup.appendChild(totalLabel);
                            totalGroup.appendChild(totalDisplay);
                            //form.appendChild(totalGroup);

                            // Actualizar total según price/discount
                            function updateEditTotal(priceInput, discountInput, totalDisplay) {
                                const p = parseFloat(priceInput.value) || 0;
                                const d = parseFloat(discountInput.value) || 0;
                                const t = p - (p * (d / 100));
                                totalDisplay.value = t.toFixed(2) + ' €';
                            }

                            priceInput.addEventListener('input', function() {
                                updateEditTotal(priceInput, discountInput, totalDisplay);
                            });

                            // Llamar una vez para actualizar total inicial
                            updateEditTotal(priceInput, discountInput, totalDisplay);

                            cardBody.appendChild(cardTitle);
                            cardBody.appendChild(form);
                            card.appendChild(cardBody);
                            col.appendChild(card);
                            row.appendChild(col);
                        });

                        editOptionalList.innerHTML = '';
                        editOptionalList.appendChild(row);
                    } else {
                        editOptionalList.innerHTML = '<p>No hay opcionales para este día.</p>';
                        // Agregar un botón "Agregar" aquí, por ejemplo:
                        const addButton = document.createElement('button');
                        addButton.type = 'button';
                        addButton.classList.add('btn', 'btn-success', 'mt-3');
                        addButton.innerText = 'Agregar';
                        addButton.addEventListener('click', function() {
                            // Abrir el modal de agregar opcionales
                            // Para ello necesitamos groupId, city y cityDays
                            // Podemos guardarlos al llamar openEditOptionalModal
                            openAddOptionalModal(clientId, groupId, city, cityDays, clientName);
                        });
                        editOptionalList.appendChild(addButton);
                    }
                })
                .catch(error => {
                    console.error('Error al obtener los opcionales del cliente:', error);
                    editOptionalList.innerHTML = '<p>Error al cargar los datos para editar.</p>';
                });
        }


        cityDays.forEach(function(day, index) {
            const dayButton = document.createElement('button');
            dayButton.type = 'button';
            dayButton.classList.add('btn', 'btn-outline-primary');
            dayButton.innerText = day.date;
            dayButton.setAttribute('data-day-id', day.id);
            dayButton.addEventListener('click', function() {
                document.querySelectorAll('#editDayButtons .btn').forEach(btn => btn.classList.remove('active'));
                dayButton.classList.add('active');
                document.getElementById('editDayId').value = day.id;
                loadClientOptionalsForDay(clientId, groupId, day.id);
            });

            if (index === 0) {
                dayButton.classList.add('active');
                document.getElementById('editDayId').value = day.id;
                loadClientOptionalsForDay(clientId, groupId, day.id);
            }

            editDayButtonsContainer.appendChild(dayButton);
        });

        
    
        // Configurar el botón de guardar cambios
        document.getElementById('saveEditOptionalBtn').onclick = function() {
            // Recolectar los datos de todos los formularios y enviar las solicitudes
            const forms = document.querySelectorAll('.edit-optional-form');
            forms.forEach(function(form) {
                const formData = new FormData(form);
                formData.append('client_id', clientId);
                formData.append('id_group', groupId);
                formData.append('id_optionals', form.dataset.optionalId);
                formData.append('id_activity', form.dataset.activityId);
                formData.append('source', 'admin');
            
                const data = {};
                formData.forEach((value, key) => {
                    if (key === 'price') {
                        data[key] = parseFloat(value); // Convertir a número
                    } else if (key === 'discount') {
                        data[key] = value.toString(); // Asegurar que sea una cadena
                    } else {
                        data[key] = value; // Mantener otros valores como están
                    }
                });
    
                // Realizar la solicitud PUT para actualizar el opcional
                fetch('http://127.0.0.1:8000/optionals_purchase', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                .then(response => {
                    if (response.ok) {
                        // Opcionalmente, manejar la respuesta
                    } else {
                        return response.json().then(data => {
                            alert('Error al editar el opcional: ' + (data.message || 'Error desconocido'));
                        });
                    }
                })
                .catch(error => {
                    console.error('Error al editar el opcional:', error);
                    alert('Error al editar el opcional.');
                });
            });
    
            // Cerrar el modal y recargar la página
            editOptionalModal.hide();
            location.reload();
        };
    }




    // Manejar clic en el botón "Guardar" del modal
    document.getElementById('saveOptionalBtn').addEventListener('click', function() {
        // Obtener los datos del formulario
        const form = document.getElementById('addOptionalForm');
        const formData = new FormData(form);
    
        // Obtener 'id_activity' y 'id_optionals' del radio button seleccionado
        const selectedRadio = document.querySelector('input[name="id_activity"]:checked');
        if (!selectedRadio) {
            alert('Por favor, seleccione una actividad opcional.');
            return;
        }
        const id_activity = selectedRadio.value;
        const id_optionals = selectedRadio.getAttribute('data-id-optional');
    
        // Añadir 'id_activity' y 'id_optionals' a formData
        formData.append('id_activity', id_activity);
        formData.append('id_optionals', id_optionals);
    
        // Añadir 'source'
        formData.append('source', 'admin');

        const data = {};
        formData.forEach((value, key) => {
            if (key === 'price') {
                data[key] = parseFloat(value); // Convertir a número
            } else if (key === 'discount') {
                data[key] = value.toString(); // Asegurar que sea una cadena
            } else {
                data[key] = value; // Mantener otros valores como están
            }
        });
        
        console.log('Datos enviados:', JSON.stringify(data));
        // Realizar la solicitud para agregar los opcionales al cliente
        fetch('http://127.0.0.1:8000/optionals_purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.ok) {
                // Cerrar el modal y actualizar la tabla
                const addOptionalModal = bootstrap.Modal.getInstance(document.getElementById('addOptionalModal'));
                addOptionalModal.hide();
    
                // Opcionalmente, actualizar la tabla en la página
                location.reload();
            } else {
                return response.json().then(data => {
                    // Manejar errores
                    alert('Error al guardar los opcionales: ' + (data.message || 'Error desconocido'));
                });
            }
        })
        .catch(error => {
            console.error('Error al guardar los opcionales:', error);
            alert('Error al guardar los opcionales.');
        });
    });

    function openDeleteOptionalModal(clientId, activityId, clientName, groupId) {
        // Mostrar el nombre del cliente en el modal
        document.getElementById('deleteClientName').innerText = clientName;
        
    
        // Mostrar el modal de confirmación
        const deleteOptionalModal = new bootstrap.Modal(document.getElementById('deleteOptionalModal'));
        deleteOptionalModal.show();
    
        // Configurar el evento para confirmar la eliminación
        document.getElementById('confirmDeleteOptionalBtn').onclick = function() {
            // Realizar la solicitud para eliminar los opcionales
            fetch('http://127.0.0.1:8000/optionals_purchase', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: clientId,
                    id_group: groupId,
                    id_activity: activityId,
                })
            })
            .then(response => {
                if (response.ok) {
                    // Cerrar el modal y actualizar la tabla
                    deleteOptionalModal.hide();
                    location.reload();
                } else {
                    return response.json().then(data => {
                        alert('Error al eliminar el opcional: ' + (data.message || 'Error desconocido'));
                    });
                }
            })
            .catch(error => {
                console.error('Error al eliminar el opcional:', error);
                alert('Error al eliminar el opcional.');
            });
        };
    }
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


// modal para el qr
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const qrStatusSpan = document.getElementById('qrStatus');
    const editQrForm = document.getElementById('editQrForm');
    const qrSwitch = document.getElementById('qrSwitch');

    editQrForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitamos el envío real del formulario

        const hasQr = qrSwitch.checked;

        // Enviar la actualización al backend
        fetch(`/grupo/${idGroup}/update_qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                has_qr: hasQr
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del backend:', data);

            if (data.status === 'success') {
                // Actualizar la interfaz con el nuevo estado del QR
                qrStatusSpan.textContent = hasQr ? 'Sí' : 'No';

                // Cerrar el modal manualmente
                const modalElement = document.getElementById('editQrModal');
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                modalInstance.hide();

                // Mostrar una notificación o feedback al usuario
                console.log(data.message);
            } else {
                // Manejar el caso de error al actualizar el estado del QR
                console.error('Error al actualizar el estado del QR:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al actualizar el estado del QR:', error);
            alert('Ocurrió un error al actualizar el estado del QR. Por favor, inténtalo de nuevo.');
        });
    });
});
