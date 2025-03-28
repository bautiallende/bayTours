// Codigo para manejo de las filas en la tabla de opcionales 
document.addEventListener("DOMContentLoaded", function() {
    let assignedOptionalsGlobal = [];
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

            console.log('el idGroup en .add-optional :', idGroup);
            // Abrir el modal y cargar los opcionales
            openAddOptionalModal(clientId, idGroup, city, cityDays, clientName, []);
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
            const groupId = document.getElementById('modalGroupId').value; 
            
            console.log('el idGroup en .edit-optional :', idGroup);

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
            console.log('Apreto el boton de agregar del modal:', groupId);
            console.log('Apreto el boton de agregar del modal clientId:', clientId);
            let assignedOptionals = [];

            // Antes de abrir el addOptionalModal, obtenemos las opcionales asignadas
            fetch(`http://127.0.0.1:8000/optionals_purchase/clients_optionals?client_id=${encodeURIComponent(clientId)}&id_days=${encodeURIComponent(dayId)}&group_id=${encodeURIComponent(groupId)}`)
                .then(response => response.json())
                .then(data => {
                    
                    if (data.status === 'success' && data.optionals && data.optionals.length > 0) {
                        assignedOptionals = data.optionals.map(o => String(o.id_optionals));
                    } else {
                        assignedOptionals = [];
                    }
        
                    // Ahora tenemos assignedOptionals aunque no hayamos pasado por la edición detallada
                    console.log("optionAdd clicked in optionModal, assignedOptionals:", assignedOptionals);
                    openAddOptionalModal(clientId, groupId, city, cityDays, clientName, assignedOptionals);
                })
                .catch(error => {
                    console.error('Error al obtener las opcionales asignadas:', error);
                    // Si hay error, llamamos con assignedOptionals = [] igualmente
                    openAddOptionalModal(clientId, groupId, city, cityDays, clientName, []);
                });
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
            openDeleteOptionalModalFlow(clientId, dayId, clientName, groupId, city, cityDays);
        };
    }



    // Función para abrir el modal de "Agregar Opcionales"
    function openAddOptionalModal(clientId, groupId, city, cityDays, clientName, assignedOptionals = []) {
        // Establecer los valores en los campos ocultos
        const modalClientId = document.getElementById('modalClientId');
        const modalGroupId = document.getElementById('modalGroupId');
        if (modalClientId) modalClientId.value = clientId;
        if (modalGroupId) modalGroupId.value = groupId;
    
        // Actualizar el título del modal
        const addOptionalModalTitle = document.querySelector('#addOptionalModal .modal-title');
        if (addOptionalModalTitle) {
            addOptionalModalTitle.innerHTML = `
                Agregar opcionales para: <span style="text-decoration: underline;">${city}</span>, Cliente: <span style="text-decoration: underline;">${clientName}</span>
            `;
        }
    
        // Generar botones para cada día
        const dayButtonsContainer = document.getElementById('dayButtons');
        if (dayButtonsContainer) {
            dayButtonsContainer.innerHTML = '';
    
            cityDays.forEach(function(day, index) {
                const dayButton = document.createElement('button');
                dayButton.type = 'button';
                dayButton.classList.add('btn', 'btn-outline-primary');
                dayButton.innerText = day.date;
                dayButton.setAttribute('data-day-id', day.id);
                dayButton.addEventListener('click', function() {
                    document.querySelectorAll('#dayButtons .btn').forEach(btn => btn.classList.remove('active'));
                    dayButton.classList.add('active');
                    loadOptionalsForDay(clientId, groupId, day.id, assignedOptionals);
    
                    const modalDayId = document.getElementById('modalDayId');
                    if (modalDayId) modalDayId.value = day.id;
                });
    
                if (index === 0) {
                    dayButton.classList.add('active');
                    loadOptionalsForDay(clientId, groupId, day.id, assignedOptionals);
    
                    const modalDayId = document.getElementById('modalDayId');
                    if (modalDayId) modalDayId.value = day.id;
                }
                dayButtonsContainer.appendChild(dayButton);
            });
        }
    
        const addOptionalModal = new bootstrap.Modal(document.getElementById('addOptionalModal'));
        addOptionalModal.show();
    
      
    
        // Función para actualizar el total
        function updateTotal() {
            const priceInputEl = document.getElementById('priceInput');
            const discountInputEl = document.getElementById('discountInput');
            const totalDisplayEl = document.getElementById('totalDisplay');
    
            const price = priceInputEl ? parseFloat(priceInputEl.value) || 0 : 0;
            const discount = discountInputEl ? parseFloat(discountInputEl.value) || 0 : 0;
            if (totalDisplayEl) {
                const total = price - (price * (discount / 100));
                totalDisplayEl.value = total.toFixed(2) + ' €';
            }
        }
    
        // Verificar la existencia de los elementos antes de agregar listeners
        const priceInputEl = document.getElementById('priceInput');
        const discountInputEl = document.getElementById('discountInput');
        const discountValueEl = document.getElementById('discountValue');
    
        if (priceInputEl && discountInputEl && discountValueEl) {
            priceInputEl.addEventListener('input', updateTotal);
            discountInputEl.addEventListener('input', updateTotal);
            discountInputEl.addEventListener('input', function() {
                discountValueEl.innerText = discountInputEl.value + '%';
                updateTotal();
            });
        }
    }


  // Función para obtener la edad de un cliente
  function getClientAge(clientId) {
    return clientAges[clientId];
    }

    // **Añadir la función loadOptionalsForDay**

    function loadOptionalsForDay(clientId, groupId, dayId, assignedOptionals = []) {
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
                let validOptionals = data.optionals.filter(optional => optional.id_optional && optional.name);
                
                console.log('validOptionals antes de el if', validOptionals);
                console.log('assignedOptionals antes de el if', assignedOptionals);
                // Excluir opcionales ya asignadas
                if (assignedOptionals.length > 0) {
                    assignedOptionals = assignedOptionals.map(a => a.toString().trim());
                    validOptionals = validOptionals.filter(o => {
                        const optionalIdStr = o.id_optional.toString().trim();
                        return !assignedOptionals.includes(optionalIdStr);
                    });
                    console.log('validOptionals DESPUES del filtrado', validOptionals);
                }

                console.log('validOptionals después del if', validOptionals);


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
        const optionModal = bootstrap.Modal.getInstance(document.getElementById('optionModal'));
        optionModal.hide();
    
        const editOptionalModal = new bootstrap.Modal(document.getElementById('editOptionalModal'));
        editOptionalModal.show();
    
        document.getElementById('editClientId').value = clientId;
        document.getElementById('editGroupId').value = groupId;
    
        const editDayButtonsContainer = document.getElementById('editDayButtons');
        editDayButtonsContainer.innerHTML = '';
        const editOptionalList = document.getElementById('editOptionalList');
    
        let assignedOptionals = []; // Variable para almacenar opcionales ya asignadas
    
        function loadClientOptionalsForDay(clientId, groupId, dayId) {
            editOptionalList.innerHTML = '<p>Cargando opcionales del cliente...</p>';
    
            fetch(`http://127.0.0.1:8000/optionals_purchase/clients_optionals?client_id=${encodeURIComponent(clientId)}&id_days=${encodeURIComponent(dayId)}&group_id=${encodeURIComponent(groupId)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.optionals && data.optionals.length > 0) {
                        // Tenemos opcionales asignadas
                        assignedOptionals = data.optionals.map(o => o.id_optionals);
                        assignedOptionalsGlobal = assignedOptionals.slice();

                        console.log('entro en el loadClientOptionalsForDay y la varaiable assignedOptionalsGlobal es: ', assignedOptionalsGlobal)
                        console.log('entro en el loadClientOptionalsForDay y la varaiable assignedOptionals es: ', assignedOptionals) 

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
                        // No hay opcionales para este día
                        assignedOptionals = []; // Sin opcionales asignadas
                        assignedOptionalsGlobal = [];
    
                        editOptionalList.innerHTML = '<p>No hay opcionales para este día.</p>';
                        const addButton = document.createElement('button');
                        addButton.type = 'button';
                        addButton.classList.add('btn', 'btn-success', 'mt-3');
                        addButton.innerText = 'Agregar';
                        addButton.addEventListener('click', function() {
                            // Cerrar el editOptionalModal antes de abrir el addOptionalModal
                            const editOptionalModalInstance = bootstrap.Modal.getInstance(document.getElementById('editOptionalModal'));
                            editOptionalModalInstance.hide();
    
                            // Pasar assignedOptionals (que está vacío en este caso) a openAddOptionalModal
                            openAddOptionalModal(clientId, groupId, city, cityDays, clientName, assignedOptionals);
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
    
        // Guardar cambios
        document.getElementById('saveEditOptionalBtn').onclick = function() {

            const editOptionalModal = bootstrap.Modal.getInstance(document.getElementById('editOptionalModal'));
            const forms = document.querySelectorAll('.edit-optional-form');
            let requests = [];

            // Recolectar los datos de todos los formularios y enviar las solicitudes
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
    const saveOptionalBtn = document.getElementById('saveOptionalBtn');
    if (saveOptionalBtn) {
        saveOptionalBtn.addEventListener('click', function() {
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
    }

    // Nueva función para el flujo de borrado
    function openDeleteOptionalModalFlow(clientId, dayId, clientName, groupId, city, cityDays) {
        const deleteOptionalFlowModal = new bootstrap.Modal(document.getElementById('deleteOptionalFlowModal'));
        deleteOptionalFlowModal.show();

        document.getElementById('deleteClientId').value = clientId;
        document.getElementById('deleteGroupId').value = groupId;

        const deleteDayButtonsContainer = document.getElementById('deleteDayButtons');
        deleteDayButtonsContainer.innerHTML = '';
        const deleteOptionalList = document.getElementById('deleteOptionalList');

        let deleteAssignedOptionals = []; // Para almacenar opcionales asignadas

        function loadClientOptionalsForDeleteDay(clientId, groupId, dayId) {
            deleteOptionalList.innerHTML = '<p>Cargando opcionales del cliente...</p>';

            fetch(`http://127.0.0.1:8000/optionals_purchase/clients_optionals?client_id=${encodeURIComponent(clientId)}&id_days=${encodeURIComponent(dayId)}&group_id=${encodeURIComponent(groupId)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.optionals && data.optionals.length > 0) {
                        deleteAssignedOptionals = data.optionals; 

                        deleteOptionalList.innerHTML = '';
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
                            cardTitle.innerText = optional.optional_name;

                            const formCheck = document.createElement('div');
                            formCheck.classList.add('form-check', 'mt-auto');

                            const radio = document.createElement('input');
                            radio.classList.add('form-check-input');
                            radio.type = 'radio';
                            radio.name = 'delete_id_optionals';
                            radio.value = optional.id_optionals;
                            radio.setAttribute('data-optional-name', optional.optional_name);
                            radio.activity = optional.id_activity;
                            radio.style.marginRight = '10px';

                            const label = document.createElement('label');
                            label.classList.add('form-check-label');
                            label.innerText = 'Seleccionar';

                            radio.addEventListener('change', function() {
                                document.getElementById('proceedDeleteBtn').disabled = false;
                                document.getElementById('deleteSelectedOptionalId').value = radio.value;
                                document.getElementById('deleteSelectedOptionalName').value = radio.getAttribute('data-optional-name');
                                document.getElementById('deleteSelectedActivityId').value = radio.activity;
                            });

                            formCheck.appendChild(radio);
                            formCheck.appendChild(label);

                            cardBody.appendChild(cardTitle);
                            cardBody.appendChild(formCheck);
                            card.appendChild(cardBody);
                            col.appendChild(card);
                            row.appendChild(col);
                        });

                        deleteOptionalList.innerHTML = '';
                        deleteOptionalList.appendChild(row);
                        document.getElementById('proceedDeleteBtn').disabled = true;
                    } else {
                        deleteOptionalList.innerHTML = '<p>No hay opcionales para este día.</p>';
                        document.getElementById('proceedDeleteBtn').disabled = true;
                    }
                })
                .catch(error => {
                    console.error('Error al obtener los opcionales del cliente:', error);
                    deleteOptionalList.innerHTML = '<p>Error al cargar los datos para borrar.</p>';
                    document.getElementById('proceedDeleteBtn').disabled = true;
                });
        }

        cityDays.forEach(function(day, index) {
            const dayButton = document.createElement('button');
            dayButton.type = 'button';
            dayButton.classList.add('btn', 'btn-outline-primary');
            dayButton.innerText = day.date;
            dayButton.setAttribute('data-day-id', day.id);
            dayButton.addEventListener('click', function() {
                document.querySelectorAll('#deleteDayButtons .btn').forEach(btn => btn.classList.remove('active'));
                dayButton.classList.add('active');
                document.getElementById('deleteDayId').value = day.id;
                loadClientOptionalsForDeleteDay(clientId, groupId, day.id);
            });

            if (index === 0) {
                dayButton.classList.add('active');
                document.getElementById('deleteDayId').value = day.id;
                loadClientOptionalsForDeleteDay(clientId, groupId, day.id);
            }

            deleteDayButtonsContainer.appendChild(dayButton);
        });

        // Al hacer clic en "Borrar" en el modal de flujo de borrado
        document.getElementById('proceedDeleteBtn').onclick = function() {
            // Abrir el modal de confirmación
            const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            deleteConfirmModal.show();

            const optionalName = document.getElementById('deleteSelectedOptionalName').value;
            document.getElementById('toDeleteOptionalNameDisplay').innerText = optionalName;
            document.getElementById('toDeleteOptionalNameCode').innerText = optionalName;

            const deleteConfirmInput = document.getElementById('deleteConfirmInput');
            const confirmDeleteFinalBtn = document.getElementById('confirmDeleteFinalBtn');

            deleteConfirmInput.value = '';
            confirmDeleteFinalBtn.disabled = true;

            deleteConfirmInput.addEventListener('input', function() {
                const expected = `borrar ${optionalName}`;
                if (deleteConfirmInput.value.trim() === expected) {
                    confirmDeleteFinalBtn.disabled = false;
                } else {
                    confirmDeleteFinalBtn.disabled = true;
                }
            });

            confirmDeleteFinalBtn.onclick = function() {
                // Realizar la solicitud DELETE
                const activitylId = document.getElementById('deleteSelectedActivityId').value;
                const deleteClientId = document.getElementById('deleteClientId').value;
                const deleteGroupId = document.getElementById('deleteGroupId').value;
                const deleteDayId = document.getElementById('deleteDayId').value;

                fetch(`http://127.0.0.1:8000/optionals_purchase?id_group=${encodeURIComponent(deleteGroupId)}&client_id=${encodeURIComponent(deleteClientId)}&id_activity=${encodeURIComponent(activitylId)}`, {
                    method: 'DELETE'
                    
                })
                .then(response => {
                    if (response.ok) {
                        // Cerrar modales y recargar
                        const deleteOptionalFlowModalInstance = bootstrap.Modal.getInstance(document.getElementById('deleteOptionalFlowModal'));
                        deleteOptionalFlowModalInstance.hide();
                        deleteConfirmModal.hide();
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
    const startingDate = document.getElementById('fechaInicio').innerText;
    const endingDate = document.getElementById('fechaRegreso').innerText;

    console.log('startingDate es la siguiente: ', startingDate.toString())
    console.log('endingDate es la siguiente: ', endingDate)

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




document.getElementById('filterModal').addEventListener('show.bs.modal', function () {
    //const filterPassengers = document.getElementById('filterPassengers');
    //const filterCity = document.getElementById('filterCity');
    //const filterActivity = document.getElementById('filterActivity');

    // Limpiar selects
    ///filterPassengers.innerHTML = '';
    //filterCity.innerHTML = '<option value="">Todas</option>';
    //filterActivity.innerHTML = '<option value="">Todas</option>';

    // Cargar pasajeros
    fetch(`http://127.0.0.1:8000/clients/clents_group?id_group=${encodeURIComponent(idGroup)}`)
        .then(r => r.json())
        .then(data => {
            const passengerMenu = document.getElementById('passengerDropdownMenu');
            passengerMenu.innerHTML = '';
    
            data.forEach(p => {
                const fullName = [p.first_name, p.second_name, p.paternal_surname, p.mother_surname].filter(Boolean).join(' ');
    
                const checkboxId = `passenger_${p.id_clients}`;
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('form-check');
    
                const checkbox = document.createElement('input');
                checkbox.classList.add('form-check-input');
                checkbox.type = 'checkbox';
                checkbox.value = p.id_clients;
                checkbox.id = checkboxId;
    
                const label = document.createElement('label');
                label.classList.add('form-check-label');
                label.setAttribute('for', checkboxId);
                label.textContent = fullName;
    
                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
                passengerMenu.appendChild(itemDiv);
            });
        })
        .catch(e => console.error('Error al cargar pasajeros:', e));

    // Cargar ciudades (con checkboxes)
    fetch(`http://127.0.0.1:8000/days/get_days_for_filter?id_group=${encodeURIComponent(idGroup)}`)
        .then(r => r.json())
        .then(data => {
            const cityMenu = document.getElementById('cityDropdownMenu');
            cityMenu.innerHTML = '';
            data.forEach(cityName => {
                const cityCheckboxId = `city_${cityName}`;
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('form-check');

                const checkbox = document.createElement('input');
                checkbox.classList.add('form-check-input');
                checkbox.type = 'checkbox';
                checkbox.value = cityName;
                checkbox.id = cityCheckboxId;

                const label = document.createElement('label');
                label.classList.add('form-check-label');
                label.setAttribute('for', cityCheckboxId);
                label.textContent = cityName;

                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
                cityMenu.appendChild(itemDiv);
            });
        })
        .catch(e => console.error('Error al cargar ciudades:', e));

    // Cargar actividades (con checkboxes)
    fetch(`http://127.0.0.1:8000/activity/activity_by_id_group?id_group=${encodeURIComponent(idGroup)}`)
        .then(r => r.json())
        .then(data => {
            const activityMenu = document.getElementById('activityDropdownMenu');
            activityMenu.innerHTML = '';
            data.forEach(a => {
                if (a.name && a.name.trim() !== '') {
                    const actCheckboxId = `activity_${a.Activity.id_optional}`;
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('form-check');

                    const checkbox = document.createElement('input');
                    checkbox.classList.add('form-check-input');
                    checkbox.type = 'checkbox';
                    checkbox.value = a.Activity.id_optional;
                    checkbox.id = actCheckboxId;

                    const label = document.createElement('label');
                    label.classList.add('form-check-label');
                    label.setAttribute('for', actCheckboxId);
                    label.textContent = a.name;

                    itemDiv.appendChild(checkbox);
                    itemDiv.appendChild(label);
                    activityMenu.appendChild(itemDiv);
                }
            });
        })
        .catch(e => console.error('Error al cargar actividades:', e));
});

document.getElementById('applyFilterBtn').onclick = function() {
    const passengerMenu = document.getElementById('passengerDropdownMenu');
    const selectedPassengers = Array.from(passengerMenu.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);

    // Ciudades
    const cityMenu = document.getElementById('cityDropdownMenu');
    const selectedCities = Array.from(cityMenu.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);

    // Actividades
    const activityMenu = document.getElementById('activityDropdownMenu');
    const selectedActivities = Array.from(activityMenu.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);

    const filterMinAge = document.getElementById('filterMinAge').value;
    const filterMaxAge = document.getElementById('filterMaxAge').value;
    const filterSex = document.getElementById('filterSex').value;
    const filterPlaceOfPurchase = document.getElementById('filterPlaceOfPurchase').value;
    const filterPaymentMethod = document.getElementById('filterPaymentMethod').value;

    const filterModalInstance = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
    filterModalInstance.hide();

    let filters = {
        passengers: (selectedPassengers.length > 0) ? selectedPassengers : null,
        min_age: filterMinAge ? filterMinAge : null,
        max_age: filterMaxAge ? filterMaxAge : null,
        sex: filterSex ? filterSex : null,
        city: selectedCities ? selectedCities : null,
        activity_id: selectedActivities ? selectedActivities : null,
        place_of_purchase: filterPlaceOfPurchase || null,
        payment_method: filterPaymentMethod || null
    };

    // Eliminar claves con null
    Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === "" || (Array.isArray(filters[key]) && filters[key].length === 0)) {
            delete filters[key];
        }
    });

    const filtersParam = encodeURIComponent(JSON.stringify(filters));

    console.log("Filters to send:", filters, filtersParam);

    // Suponiendo que tienes id_group y current_table disponibles
    location.href = `/grupo/${idGroup}?table=${current_table}&filters=${filtersParam}`;
};


function exportarDatos() {
    const params = {
        passengers: currentFilters.passengers, 
        min_age: currentFilters.min_age,
        max_age: currentFilters.max_age,
        sex: currentFilters.sex,
        city_id: currentFilters.city_id,
        activity_id: currentFilters.activity_id
    };

    fetch('/export_opcionales_to_google_sheets', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(params)
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            window.open(data.sheet_url, '_blank');
        } else {
            alert('Error al exportar datos a Google Sheets.');
        }
    })
    .catch(e => console.error('Error al exportar datos:', e));
}