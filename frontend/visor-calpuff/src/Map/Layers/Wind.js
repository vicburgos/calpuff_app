import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { SwitchFactory } from '../../utils/SwitchOnOFF/0_SwitchContainer.js';
import { Point } from 'ol/geom';

function triangleGenerator(colorWind) {
    let triangleUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <polygon points="10,20 6,0 14,0" fill="${colorWind}"/>
        </svg>
    `);
    return triangleUrl;
}

export function windGenerator(context, state) {
    //// OL
    const features = new Collection();
    const vectorSource = new VectorSource();
    vectorSource.addFeatures(features);

    const vectorLayerWind = new VectorLayer({
        source: vectorSource,
        visible: false,
        opacity: 0.4,
        updateWhileInteracting: true,
        updateWhileAnimating: true,
    });

    async function setGrid() {
        // HARD CODE para la grilla de viento
        let varReference = 'mp10_ld_v10';
        const Data = await state.getData(state.domain, state.instance, varReference);

        const LON = Data.valuesXX
        const LAT = Data.valuesYY
        features.clear();
        LON.map((_, index) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([LON[index], LAT[index]])),
            });
            features.push(feature);
        });
    }

    let colorWind = 'rgba(255, 255, 255, 1)';
    async function setWind() {
        vectorSource.clear();
        // HARD CODE para la grilla de viento
        let windx = 'mp10_ld_u10';
        let windy = 'mp10_ld_v10';
        const windxData = await state.getData(state.domain, state.instance, windx);
        const windyData = await state.getData(state.domain, state.instance, windy);

        let maxExpectedSpeed = Math.sqrt(
            Math.pow(windxData.attrs.vmax, 2) +
            Math.pow(windyData.attrs.vmax, 2)
        );
        maxExpectedSpeed = 10;

        const U = windxData.valuesApi(state.frame, 0);
        const V = windyData.valuesApi(state.frame, 0);

        U.map((_, index) => {
            const angle = Math.atan2(-U[index], -V[index]);
            const magnitude = Math.sqrt(U[index] * U[index] + V[index] * V[index]);
            const scale = 0.05 + 0.95 * Math.min(magnitude / maxExpectedSpeed, 1);
            let feature = features.array_[index];
            
            feature.setStyle(new Style({
                image: new Icon({
                    src: triangleGenerator(colorWind),
                    rotation: angle,
                    rotateWithView: true,
                    scale: scale,
                })
            }));
            vectorSource.addFeature(feature);
        });
    }

    state.addEventListener('change:instance', async () => {
        switchWindHtml.querySelector('input').checked
            ? await (setGrid, setWind()) :
            null
    });

    state.addEventListener('change:frame', async () => {
        switchWindHtml.querySelector('input').checked
            ? await setWind() :
            null
    });

    //// HTML
    const switchWindHtml = SwitchFactory.create('switch-wind', 'Viento');
    switchWindHtml.querySelector('input').addEventListener('click', () => {
        switchWindHtml.querySelector('input').checked
            ? (setGrid(), setWind(), vectorLayerWind.setVisible(true))
            : vectorLayerWind.setVisible(false);
    });

    window.addEventListener('darkMode', (event) => {
        if (event.detail === true) {
            colorWind = 'rgba(255, 255, 255, 1)';
            switchWindHtml.querySelector('input').checked
                ? setWind()
                : null;
        } else {
            colorWind = 'rgba(8, 0, 253, 1)';
            switchWindHtml.querySelector('input').checked
                ? setWind()
                : null;
        }
    });

    return [switchWindHtml, vectorLayerWind];
}