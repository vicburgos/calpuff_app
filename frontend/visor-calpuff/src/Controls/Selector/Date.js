import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function builder(input, allowedDates) {
    flatpickr(input, {
        enable: allowedDates.map(d => {
            const [year, month, day] = d.split('_')[0].split('-').map(Number);
            return new Date(year, month - 1, day); // Date en zona horaria local
        }),
        defaultDate: allowedDates[allowedDates.length-1],
        allowInput: false,
    });
}

function dateSelector(context, state) {

    const icon = document.createElement('i');
    icon.classList.add('bi', 'bi-calendar');

    const input = document.createElement('input');
    input.type = 'date';
    input.id = 'date-selector';
    input.title = 'Selecciona una fecha';
    Object.assign(input.style, {
        width: '70px',
        userSelect: 'none',
    });
    
    // Set date
    let allowedDates = state.instances || [];
    builder(input, allowedDates);

    input.addEventListener('change', (event) => {
        const selectedDate = event.target.value;
        state.date = selectedDate;
    });

    icon.addEventListener('click', () => {
        input.click();
    });

    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        gap: '5px',
    });
    wrapper.appendChild(icon);
    wrapper.appendChild(input);

    return wrapper;
}

export { dateSelector };