import {
    interpolatePlasma,
    interpolatePuRd,
    interpolateViridis,
    interpolateRainbow,
} from 'd3';

// Con remapMidpoint podemos modificar el centro de la escala de colores (e.g. isoterma 0)
function remapMidpoint(t, mid = 0.5) {
  if (t <= mid) {
    return (t / mid) * 0.5;
  } else {
    return 0.5 + ((t - mid) / (1 - mid)) * 0.5;
  }
}

function TransformHexToRGB(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

// COLORS MAP
export const colorsMap = {
    1: {
        interpolate: (t) => {
          const rgbValue = interpolateRainbow(1-(0.1 + 0.9 * t))
          const rgbsplit = rgbValue.match(/\d+/g);
          return `rgba(${rgbsplit[0]}, ${rgbsplit[1]}, ${rgbsplit[2]}, 0.8)`;
        },
    },
    2: {
        interpolate: (t) => {
          const rgbValue = interpolatePuRd(0.3 + 0.7 * t)
          const rgbsplit = rgbValue.match(/\d+/g);
          return `rgba(${rgbsplit[0]}, ${rgbsplit[1]}, ${rgbsplit[2]}, 0.7)`;
        },
    },
    3: {
        interpolate: (t) => {
          const rgbValue = interpolatePlasma(0.2 + 0.8 * t)
          const rgbsplit = TransformHexToRGB(rgbValue);
          return `rgba(${rgbsplit[0]}, ${rgbsplit[1]}, ${rgbsplit[2]}, 0.8)`;
        },
    },
}