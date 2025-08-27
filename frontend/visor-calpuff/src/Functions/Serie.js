import Highcharts from 'highcharts';

function parseInstanceToDate(instance, context) {
    if (!instance) return null;
    const date = new Date(instance.replace("_", " ") + ":00:00Z");
    if (context.optionLocalTime) {
        const localOffset = date.getTimezoneOffset();
        date.setMinutes(date.getMinutes() - localOffset);
    }
    return date;
}

function updateStartDateAxis(instance, context) {
    const startDate = parseInstanceToDate(instance, context);
    if (!startDate) return {};
    return {
        type: 'datetime',
        min: startDate.getTime() + context.startHour * 60 * 60 * 1000,
        max: startDate.getTime() + context.endHour * 60 * 60 * 1000,
    };
}

export function serieGenerator(context, state, map, panelSerie) {
    const Chart = Highcharts.chart(panelSerie, {
        chart: { type: "area", zoomType: "x" },
        title: { text: '' },
        xAxis: updateStartDateAxis(state.instance, context),
        yAxis: {
            title: { text: 'µg/m³', rotation: 0, x: -25, useHTML: true },
            min: 0, max: 150
        },
        plotOptions: { area: { stacking: "normal" } },
        tooltip: {
            formatter: function () {
                return `<b>${this.series.name}</b>: ${Highcharts.numberFormat(this.y, 2)} µg/m³<br>` +
                    `<b>${Highcharts.dateFormat('%Y-%m-%d %H:%M', this.x)}</b>`;
            }
        },
        accessibility: { enabled: false },
        credits: { enabled: false },
        series: [{ name: 'MP10', data: [], color: 'red', fillOpacity: 0.5 }],
    });

    // Actualiza el plot line del frame
    function updateIndicator() {
        if (!state.instance) return;
        const startDate = parseInstanceToDate(state.instance, context);
        if (!startDate) return;

        Chart.xAxis[0].removePlotLine('time-indicator');
        Chart.xAxis[0].addPlotLine({
            id: 'time-indicator',
            color: 'dodgerblue',
            width: 1,
            value: startDate.getTime() + state.frame * context.ref_dt * 60 * 1000,
        });
    }

    // Actualiza el eje X cuando cambia la instancia
    function updateXAxis() {
        if (!state.instance) return;
        Chart.update({
            xAxis: updateStartDateAxis(state.instance, context)
        });
    }

    state.addEventListener('change:frame', () => {
        updateIndicator();
    });
    state.addEventListener('change:instance', () => {
        Chart.series[0].setData([], true);
        updateXAxis();
        updateIndicator();
    });

    let lonSerie = null;
    let latSerie = null;

    document.addEventListener('serie:start', async (e) => {
        if (!state.instance || !state.variable) return;

        const startDate = parseInstanceToDate(state.instance, context);

        if (e.detail?.lon && e.detail?.lat) {
            lonSerie = e.detail.lon;
            latSerie = e.detail.lat;
        }
        if (!lonSerie || !latSerie) return;

        const data = state.currentData;
        const [i, j] = data.proj_lonlat_to_ij(lonSerie, latSerie);
        const { nx, nz, nt, emVector } = data;

        const serieData = [];
        for (let t = 0; t < nt; t++) {
            let val = 0;
            for (let z = 0; z < nz; z++) {
                val += data.valuesApi(t, z)[j * nx + i] * emVector[z];
            }
            const timestamp = startDate.getTime() + t * context.ref_dt * 60 * 1000;
            serieData.push([timestamp, val]);
        }
        Chart.series[0].setData(serieData, true);
        document.dispatchEvent(new CustomEvent('serie:end'));
    });

    document.addEventListener('serie:clean', () => {
        Chart.series[0].setData([], true);
    });
}

// // src/Functions/Serie.js
// import Highcharts from 'highcharts';

// function updateStartDateAxis(instance){
//     const startDate = new Date(instance.replace("_", " ") + ":00:00Z");
//     if (context.optionLocalTime) {
//         const localOffset = startDate.getTimezoneOffset();
//         startDate.setMinutes(startDate.getMinutes() - localOffset);
//     }
//     const xAxis = {
//         type: 'datetime',
//         min: startDate.getTime() + context.startHour * 60 * 60 * 1000,
//         max: startDate.getTime() + context.endHour * 60 * 60 * 1000,
//     }
//     return xAxis;
// }

// export function serieGenerator(context, state, map, panelSerie) {
//     const Chart = Highcharts.chart(panelSerie, {
//         chart: { type: "area", zoomType: "x" },
//         title: { text: '' },
//         // xAxis: {
//         //     type: 'datetime',
//         //     min: startDate.getTime() + context.startHour * 60 * 60 * 1000,
//         //     max: startDate.getTime() + context.endHour * 60 * 60 * 1000,
//         // },
//         yAxis: { title: { text: 'µg/m³', rotation: 0, x: -25, useHTML: true }
//             , min: 0, max: 250 
//         },
//         plotOptions: { area: { stacking: "normal" } },
//         tooltip: {
//             formatter: function() {
//                 return `<b>${this.series.name}</b>: ${Highcharts.numberFormat(this.y, 2)} µg/m³<br>` +
//                        `<b>${Highcharts.dateFormat('%Y-%m-%d %H:%M', this.x)}</b>`;
//             }
//         },
//         accessibility: { enabled: false },
//         credits: {enabled: false},
//         series: [{ name: 'MP10', data: [], color: 'red', fillOpacity: 0.5 }],
//     });

//     function updateIndicator() {
//         if (!state.instance){
//             return;
//         }
//         const startDate = new Date(state.instance.replace("_", " ") + ":00:00Z");
//         if (context.optionLocalTime) {
//             const localOffset = startDate.getTimezoneOffset();
//             startDate.setMinutes(startDate.getMinutes() - localOffset);
//         }
//         Chart.xAxis[0].removePlotLine('time-indicator');
//         Chart.xAxis[0].addPlotLine({
//             id: 'time-indicator',
//             color: 'dodgerblue',
//             width: 1,
//             value: startDate.getTime() + state.frame * context.ref_dt * 60 * 1000,
//         });
//     }
//     state.addEventListener('change:frame', updateIndicator);
//     state.addEventListener('change:instance', updateIndicator);

//     let lonSerie = null
//     let latSerie = null;
//     // Escuchar evento para generar serie
//     document.addEventListener('serie:start', async (e) => {
//         Chart.update({
//             xAxis: updateStartDateAxis(state.instance)
//         });
//         // Revisamos si hay lat lon en e
//         if (e.detail && e.detail.lon && e.detail.lat) {
//             //Update lonSerie and latSerie
//             lonSerie = e.detail.lon;
//             latSerie = e.detail.lat;
//         }
//         if (!lonSerie || !latSerie) {
//             return;
//         }
//         if (!state.variable){
//             return;
//         }
//         const data = state.currentData;
//         const [i, j] = data.proj_lonlat_to_ij(lonSerie, latSerie);
//         const { nx, nz, nt, emVector } = data;
//         const serieData = [];
//         // Generar serie de manera asincrónica para no bloquear la UI
//         for (let t = 0; t < nt; t++) {
//             let val = 0;
//             for (let z = 0; z < nz; z++) {
//                 val += data.valuesApi(t, z)[j * nx + i] * emVector[z];
//             }
//             const timestamp = startDate.getTime() + t * context.ref_dt * 60 * 1000;
//             serieData.push([timestamp, val]);

//             // // cada 10 iteraciones dejamos que el browser refresque UI
//             // if (t % 10 === 0) {
//             //     await new Promise(resolve => setTimeout(resolve, 0));
//             // }
//         }
//         Chart.series[0].setData(serieData, true);
//         document.dispatchEvent(new CustomEvent('serie:end'));
//     });
//     document.addEventListener('serie:clean', async (e) => {
//         // lonSerie = null;
//         // latSerie = null;
//         Chart.series[0].setData([], true);
//     });
// }
