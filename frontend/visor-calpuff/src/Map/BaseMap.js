import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { Attribution, Control } from 'ol/control';
import { MouseWheelZoom, DragPan } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';

import { background } from './Layers/Background.js';
import { placesGenerator } from './Layers/Places.js';
import { contourGenerator } from './Layers/Contour.js';
import { windGenerator } from './Layers/Wind.js';
import { domainStaticGenerator } from './Layers/Domain.js';
import { setupMousePosition } from './Widget/MousePosition.js';
import { setupPopup } from './Widget/Popup.js';


function mapGenerator(context, state) {

    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    const layersBackground = [
        background.black,
        background.white,
        background.satellite,
        background.openStreet,
    ]

    const map = new Map({
        target: mapContainer,
        layers: layersBackground.concat([background.topo]),
        view: new View({
            center: fromLonLat([
                context.ref_lon,
                context.ref_lat
            ]),
            zoom: 9.5,
        }),
        controls: []
    });

    // Remove Atributtions
    map.getControls().forEach(function (control) {
        if (control instanceof Attribution) {
            map.removeControl(control);
        }
    });
    // Remove Interaction
    map.getInteractions().forEach(function (interaction) {
        if (interaction instanceof MouseWheelZoom || interaction instanceof DragPan) {
            map.removeInteraction(interaction);
        }
    });
    // Agregamos un MouseWheelZoom que solo se activa con Ctrl
    map.addInteraction(new MouseWheelZoom({
        condition: platformModifierKeyOnly,
        duration: 250
    }));
    // Agregamos un DragPan que solo se activa con Ctrl
    map.addInteraction(new DragPan({
        condition: platformModifierKeyOnly,
        kinetic: null, // Desactivamos la inercia
    }));

    // // Agregamos domainLayer
    // const domainLayer = domainStaticGenerator(context, state);
    // map.addLayer(domainLayer);
    
    // Agregamos contourLayer and colormap
    const [contourLayer, colorMapContainer] = contourGenerator(context, state, map);
    const wrapperColorMap = document.createElement('div');
    Object.assign(wrapperColorMap.style, {
        position: 'absolute',
        bottom: '40px',
        right: '10px',
    });
    wrapperColorMap.id = 'wrapper-colorbar';
    wrapperColorMap.appendChild(colorMapContainer);
    mapContainer.appendChild(wrapperColorMap);
    contourLayer.setZIndex(2);
    map.addLayer(contourLayer);


    // Switches
    const wrapperSwitch = document.createElement('div');
    Object.assign(wrapperSwitch.style, {
        position: 'absolute',
        bottom: '120px',
        right: '10px',
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '8px',
    });
    wrapperSwitch.id = 'switches';
    mapContainer.appendChild(wrapperSwitch);

    // Agregamos Switch-Places
    const [switchLabelsHtml, vectorLayerLabels] = placesGenerator(context, map)
    wrapperSwitch.appendChild(switchLabelsHtml);
    vectorLayerLabels.setZIndex(4);
    map.addLayer(vectorLayerLabels);
    // Activamos el switch por defecto
    switchLabelsHtml.querySelector('input').click();

    // Agregamos Switch-Viento
    const [switchWindHtml, vectorLayerWind] = windGenerator(context, state);
    wrapperSwitch.appendChild(switchWindHtml);
    vectorLayerWind.setZIndex(3);
    map.addLayer(vectorLayerWind);

    // Agregamos Mouse
    const mouseContainer = setupMousePosition(map)
    Object.assign(mouseContainer.style, {
        width: '100px',
        position: 'absolute',
        bottom: '70px',
        right: '10px',
    });
    mapContainer.appendChild(mouseContainer);
    
    // Agregamos Popup
    setupPopup(map);


    //// TODO: Modular
    // Agregamos selector de capa
    const select = document.createElement('select');
    select.id = 'layer-selector';
    select.title = 'Selecciona una capa';
    // Agregamos opciones segun layersBackground
    layersBackground.forEach((layer, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.dark = layer.get('dark') || false; // Agregamos dark si existe
        option.textContent = layer.get('name') || `Layer ${index + 1}`;
        select.appendChild(option);
    });
    // Agregamos change
    select.addEventListener('change', (event) => {
        const selectedLayerIndex = parseInt(event.target.value);
        const darkModeOption = event.target.selectedOptions[0].dark;
        window.dispatchEvent(new CustomEvent('darkMode', { detail: darkModeOption }));
        layersBackground.forEach((layer, index) => {
            index === selectedLayerIndex 
                ? layer.setVisible(true)
                : layer.setVisible(false);
        });
    });
    // Select default layer
    select.dispatchEvent(new Event('change'));
    const wrapperSelect = document.createElement('div');
    Object.assign(wrapperSelect.style, {
        position: 'absolute',
        top: '10px',
        left: '10px',

        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignItems: 'center',
        paddingLeft: '5px',
        paddingRight: '5px',

        background: 'white',
        userSelect: 'none',
        fontSize: '12px',
        height: '30px',
        borderRadius: '5px',
    });
    const iconSelect = document.createElement('i');
    iconSelect.classList.add("bi", "bi-stack");
    Object.assign(iconSelect.style, {
        marginLeft: '5px',
    });
    wrapperSelect.appendChild(iconSelect);
    wrapperSelect.appendChild(select);
    mapContainer.appendChild(wrapperSelect);
    ////End-TODO: Modular

    return { mapContainer, map }
}

export { mapGenerator };



