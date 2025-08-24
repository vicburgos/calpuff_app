import { dateSelector } from './Date.js';
import { variableSelector } from './Variable.js';
import { domainSelector } from './Domain.js';

function selectorGenerator(context, state){

    const dateSelectorInstance     = dateSelector(context, state);
    // const domainSelectorInstance   = domainSelector(context, state);
    const variableSelectorInstance = variableSelector(context, state);

    const wrapper = document.createElement('div');
    wrapper.id = 'selector-container';
    Object.assign(wrapper.style, {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '5px',
        background: 'white',
        userSelect: 'none',
        fontSize: '12px',
        height: '30px',
        borderRadius: '5px',
        paddingLeft: '5px',
        paddingRight: '5px',
    });

    wrapper.appendChild(dateSelectorInstance);
    // wrapper.appendChild(domainSelectorInstance);
    wrapper.appendChild(variableSelectorInstance);
    return wrapper;
}

export { selectorGenerator };