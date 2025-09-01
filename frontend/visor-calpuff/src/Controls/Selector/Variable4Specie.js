import './styleVariable4Specie.css';

function Variable4SpecieSelector(context, state) {
    const title = document.createElement('h5');
    title.classList.add('text-left', 'mt-2', 'mb-2');
    title.textContent = 'Especies';

    const group = document.createElement('div');
    Object.assign(group.style, {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '10px',
        paddingTop: '2px',
    });
    group.classList.add('btn-group','text-left', 'mt-2', 'mb-2');

    function updateVariableOptions() {
        group.innerHTML = ''; // limpiar
        const variables = state.variables || [];

        variables.forEach((variable, index) => {
            const input = document.createElement('input');
            input.type = 'radio';
            input.classList.add('btn-check');
            input.name = 'btnradio-variable';
            input.id = `btnradio-${variable}`;
            input.autocomplete = 'off';
            input.value = variable;

            if (state.variable === variable) {
                input.checked = true;
            }

            const label = document.createElement('label');
            label.style.borderRadius = '4px';
            label.classList.add('btn', 'btn-light', 'btn-sm');
            label.setAttribute('for', input.id);
            label.textContent = variable.split("_")[0].toUpperCase();

            input.addEventListener('change', (event) => {
                if (event.target.checked) {
                    state.variable = event.target.value;
                }
            });

            group.appendChild(input);
            group.appendChild(label);
        });

        // si no hay variable seleccionada, limpiar
        if (!variables.includes(state.variable)) {
            state.variable = null;
        }
    }

    // cuando cambia el estado desde afuera
    state.addEventListener('change:variable', () => {
        const inputs = group.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => {
            input.checked = (input.value === state.variable);
        });
    });

    // actualizar opciones si cambian
    state.addEventListener('options:variables', () => {
        updateVariableOptions();
    });

    updateVariableOptions();

    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        display: 'flex',
        flexDirection: 'row',
        gap: '15px',
        width: '100%',
        userSelect: 'none',
        backgroundColor: 'white',
        marginBottom: '5px',
    });
    wrapper.appendChild(title);
    wrapper.appendChild(group);

    return wrapper;
}

export { Variable4SpecieSelector };