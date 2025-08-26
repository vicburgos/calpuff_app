// Manejar Borde del dominio y Zoom

import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { Fill, Style, Stroke } from 'ol/style'
import { LineString, Polygon } from 'ol/geom';
import { transformExtent } from 'ol/proj';


async function domainGenerator(context, state, map) {
    const myFeatures = new VectorSource();
    const lineFeature = new Feature();

    async function setBorder() {
        // HARD CODE para la variable lat-lon
        let varReference = 'mp10_hd_lon';
        const Data  = await state.getData(state.domain, state.instance, varReference);
        const nx = Data.nx;
        const ny = Data.ny;
        const valuesLon = Data.valuesXX;
        const valuesLat = Data.valuesYY;

        // Creamos bordes
        const borderCoords = [];
        for (let i = 0; i < nx; i++) {   //Inferior
            let j = 0;
            borderCoords.push([
                valuesLon[j*nx + i],
                valuesLat[j*nx + i], 
            ]);
        }
        for (let j = 0; j < ny; j++) {  //Derecho
            let i = nx - 1;
            borderCoords.push([
                valuesLon[j*nx + i],
                valuesLat[j*nx + i], 
            ]);
        }
        for (let i = 0; i < nx; i++) {  //Superior
            let j = ny - 1;
            borderCoords.push([
                valuesLon[j*nx  + nx - 1 - i],
                valuesLat[j*nx + nx - 1 - i], 
            ]);
        }
        for (let j = 0; j < ny; j++) {  //Izquierdo
            let i = 0;
            borderCoords.push([
                valuesLon[(ny - 1 - j)*nx + i],
                valuesLat[(ny - 1 - j)*nx + i], 
            ]);
        }

        // Guardamos
        context.borderCoords = borderCoords;

        // Crear el poligono
        let lineCoords = borderCoords.map(([lon, lat]) => fromLonLat([lon, lat]));
        lineFeature.setGeometry(new Polygon([lineCoords]));

        //Generar un poligono con fill gris
        lineFeature.setStyle(new Style({
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
                width: 3,
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.15)',
            }),
        }));

        myFeatures.clear();
        myFeatures.addFeature(lineFeature);

        // SET VIEW
        let minLAT     = Math.min(...borderCoords.map(coord => coord[1]));
        let minLON     = Math.min(...borderCoords.map(coord => coord[0]));
        let maxLAT     = Math.max(...borderCoords.map(coord => coord[1]));
        let maxLON     = Math.max(...borderCoords.map(coord => coord[0]));

        let extent = [minLON, minLAT, maxLON, maxLAT];

        // 2. Transformar el extent a EPSG:3857
        let extentTransformed = transformExtent(extent, 'EPSG:4326', 'EPSG:3857');

        // 3. Obtener el nivel de zoom basado en el extent
        let view = map.getView();
        let resolution = view.getResolutionForExtent(extentTransformed, map.getSize());

        // 4. Calcular el nuevo centro del dominio
        let fixPosition =  0;
        let center = fromLonLat([(extent[0] + extent[2]) * 0.5, (extent[1] + extent[3]) * 0.5 - fixPosition]);

        //5. Animación de cambio de dominio
        view.animate({
            center: center,
            resolution: 100,
            duration: 1000,
        });
    }

    await setBorder();

    state.addEventListener('change:domain', async () => {
        await setBorder();
    });

    return new VectorLayer({
        source: myFeatures,
        zIndex: 10,
    });
}
export { domainGenerator };