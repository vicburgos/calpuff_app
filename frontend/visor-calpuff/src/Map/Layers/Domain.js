// Manejar Borde del dominio y Zoom

import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { Fill, Style, Stroke } from 'ol/style'
import { LineString, Polygon } from 'ol/geom';

function domainStaticGenerator(context, state) {
    const myFeatures = new VectorSource();
    const lineFeature = new Feature();

    async function setBorder() {

        // Bordes
        const borderCoords = context.domains[state.domain].borderCoords;

        // Crear el poligono
        let lineCoords = borderCoords.map(([lon, lat]) => fromLonLat([lon, lat]));
        lineFeature.setGeometry(new Polygon([lineCoords]));

        //Generar un poligono con fill gris
        lineFeature.setStyle(new Style({
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
                width: 6,
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.15)',
            }),
        }));

        myFeatures.clear();
        myFeatures.addFeature(lineFeature);  
    }

    state.addEventListener('change:domain', () => {
        setBorder();
    });

    return new VectorLayer({
        source: myFeatures,
    });
}
export { domainStaticGenerator };