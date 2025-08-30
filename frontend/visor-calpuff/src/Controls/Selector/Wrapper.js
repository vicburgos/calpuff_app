import { dateSelector } from './Date.js';
import { variableSelector } from './Variable.js';
import { domainSelector } from './Domain.js';

function selectorGenerator(context, state){

    const dateSelectorInstance     = dateSelector(context, state);
    // const domainSelectorInstance = domainSelector(context, state);
    const variableSelectorInstance = variableSelector(context, state);

    const wrapper = document.createElement('div');
    wrapper.id = 'selector-container';
    Object.assign(wrapper.style, {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '5px',
        userSelect: 'none',
        fontSize: '12px',
        height: '30px',
        borderRadius: '5px',
        paddingLeft: '5px',
        paddingRight: '5px',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        border: '1px solid rgba(0, 0, 0, 1)',
    });

    wrapper.appendChild(dateSelectorInstance);
    // wrapper.appendChild(domainSelectorInstance);
    // wrapper.appendChild(variableSelectorInstance);
    return wrapper;
}

export { selectorGenerator };