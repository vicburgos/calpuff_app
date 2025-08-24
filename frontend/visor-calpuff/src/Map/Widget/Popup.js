import 'ol/ol.css';
import './stylePopup.css';
import { toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { Popover } from 'bootstrap';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Modify } from 'ol/interaction';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Select } from 'ol/interaction';
import {altKeyOnly, click, pointerMove} from 'ol/events/condition.js';
import { Circle, Fill, Stroke } from 'ol/style.js';
import { Style } from 'ol/style.js';

// Draw
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  zIndex: 10,
});
const pointSerie = new Feature();
const stylePoint = new Style({
  image: new Circle({
    radius: 5,
    fill: new Fill({ color: 'rgba(255, 140, 0, 0.47)' }),
    stroke: new Stroke({ color: 'darkorange', width: 2 }),
  }),
});
pointSerie.setStyle(stylePoint);
vectorSource.addFeature(pointSerie);

const modify = new Modify({
    source: vectorSource,
    condition: () => true,              // permite el arrastre
    insertVertexCondition: () => false, // evita insertar nuevos vertices
    deleteCondition: () => false,       // evita borrar vertices
    style: stylePoint,
});
const select = new Select({
  condition: click,
  style: stylePoint,
});

// Popup
const popupContainer = document.createElement('div');
popupContainer.className = 'ol-popup';
Object.assign(popupContainer.style, {
  userSelect: 'none',
});

// Overlay ol
const overlay = new Overlay({
  element: popupContainer,
  offset: [-10, 0],
  updateWhileAnimating: true,
  updateWhileInteracting: true,
});

function setupPopup(map) {
  map.addLayer(vectorLayer);
  map.addInteraction(modify);
  map.addInteraction(select);
  map.addOverlay(overlay);
  map.getViewport().addEventListener('contextmenu', (e) => e.preventDefault());

  map.on('contextmenu', (event) => {
    const coordinate = event.coordinate;
    pointSerie.setGeometry(new Point(coordinate));
    generatePopover(coordinate);
  });

  modify.on('modifyend', async (event) => {
    const coordinate = event.features.item(0).getGeometry().getCoordinates();
    generatePopover(coordinate);
  });

  select.on('select', (event) => {
    const coordinate = event.selected[0].getGeometry().getCoordinates();
    generatePopover(coordinate);
  });

  function generatePopover(coordinate) {
    overlay.setPosition(coordinate);
    // Destruir popover previo
    let existingPopover = Popover.getInstance(popupContainer);
    if (existingPopover) {
      existingPopover.dispose();
    }

    //// Generamos el contenido
    const contentPopup = document.createElement('div');
    Object.assign(contentPopup.style, {
      position: 'relative',
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      paddingRight: '5px',
    });
    // Agregamos boton de cerrar
    const closeButton = document.createElement('button');
    closeButton.className = 'btn-close';
    Object.assign(closeButton.style, {
      position: 'absolute',
      top: '-12px',
      right: '-12px',
      width: '6px',
      height: '6px',
    });
    closeButton.onclick = () => {
      popover.hide();
      setTimeout(() => {
        overlay.setPosition(undefined);
      }, 200);
    };
    contentPopup.appendChild(closeButton);
    // Agregamos span con coordenadas
    const [lon, lat] = toLonLat(coordinate);
    const coordSpan = document.createElement('span');
    coordSpan.innerHTML = `<i class="bi bi-crosshair" aria-hidden="true"></i> (${lat.toFixed(3)}, ${lon.toFixed(3)})`
    contentPopup.appendChild(coordSpan);
    // Agregamos boton para generar serie
    const serieButton = document.createElement('button');
    serieButton.type = 'button';
    Object.assign(serieButton.style, {
      backgroundColor: 'transparent',
      border: 'none',
      userSelect: 'none',
      color: 'dodgerblue',
      width: '100%',
      textAlign: 'left',
    });
    serieButton.textContent = 'Generar serie';
    serieButton.onclick = () => {
      const event = new CustomEvent('serie:start', {
        detail: {
          lon: lon,
          lat: lat,
        },
      });
      document.dispatchEvent(event);
    };
    contentPopup.appendChild(serieButton);
    document.addEventListener('serie:end', () => {
      closeButton.click();
    });
    //// End-Generamos el contenido
  
    //// Generamos y mostramos el nuevo Popover
    const popover = new Popover(popupContainer, {
      animation: true,
      trigger: 'manual',
      container: popupContainer,
      content: contentPopup,
      placement: 'left',  // aparece arriba
      html: true,
      delay: { "show": 200, "hide": 200 },
    });
    popover.show();    
  }

}

export { popupContainer, setupPopup };