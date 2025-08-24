//// Layout
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './VueElements/Layout.vue'

const root = document.getElementById('root')
const Layout = createApp(App);
Layout.use(ElementPlus);
Layout.mount(root)
const panelMap   = document.getElementById('vue-panel-map');
const panelTable = document.getElementById('vue-panel-table');
const panelSerie = document.getElementById('vue-panel-serie');

//// Main
import { Context, State } from './Data/DataManager.js';
import { mapGenerator } from './Map/BaseMap.js'
import { tableGenerator } from './Functions/Table.js'
import { serieGenerator } from './Functions/Serie.js'
import { reproductorGenerator } from './Controls/Reproductor/Wrapper.js'
import { selectorGenerator } from './Controls/Selector/Wrapper.js';


async function main() {

  // Generamos el contexto
  const context = new Context();
  await context.init();
  const state = new State(context);
  await state.init();
  window.context = context;
  window.state = state;

  // Agregamos el mapa
  const { mapContainer, map } = mapGenerator(context, state);
  Object.assign(mapContainer.style, {
    position: "relative",
    height: "100%",
    width: "100%",
  });
  panelMap.appendChild(mapContainer);

  // Agregamos tabla
  const [tableHtml, loadButton] = await tableGenerator(context, state, map);
  panelTable.appendChild(tableHtml);
  panelTable.appendChild(loadButton);

  // Agregamos serie
  serieGenerator(context, state, map, panelSerie);

  // Agregamos el selector
  const selectorContainer = selectorGenerator(context, state);
  Object.assign(selectorContainer.style, {
    position: 'absolute',
    top: '10px',
    right: '10px',
  });
  mapContainer.appendChild(selectorContainer);

  // Agregamos el reproductor
  const reproductorContainer = reproductorGenerator(context, state);
  Object.assign(reproductorContainer.style, {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    right: '10px',
  });
  mapContainer.appendChild(reproductorContainer);
}

main();