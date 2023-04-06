import { lightColors } from '@digital-ai/dot-components';

export const primaryColors = {
    blue: lightColors.b500, // '#3D6C9E'
    green: lightColors.g500, // '#498500'
    red: lightColors.r500, // '#D61F21'
    orange: lightColors.o500, // '#FF9E49'
    purple: lightColors.p500, // '#991C71'
    yellow: lightColors.y500, // '#EEC511'
};

export default {
    // PRIMARY COLORS
    ...primaryColors,

    // SECONDARY COLORS
    xldblue: lightColors.b500, // '#3D6C9E'
    lightblue: lightColors.b400, // '#5A82AD'
    darkblue: lightColors.b700, // '#2F598C'

    // SHADES OF GRAY
    black: lightColors.n700, // '#3B485C'
    antracite: lightColors.n700, // '#3B485C'
    gray: lightColors.n400, // '#667385'
    lightgray: lightColors.n300, // '#A4ACB6'
    background: lightColors.n50, // '#F3F5F6'
    silver: lightColors.n50, // '#F3F5F6'
    white: lightColors.n0, // '#FFFFFF'

    // Semantic COLORS
    oddRowColor: lightColors.n0, // '#FFFFFF'
    evenRowColor: lightColors.n50, // '#F3F5F6'

    hoverColor: '#EAEEEF',
    selectedColor: '#E4E9EB',
    highlightColor: '#CDEFDC',

    successBackground: lightColors.g50, // '#E9F0E0'
    successHover: lightColors.g100, // '#C8DAB3'

    warningBackground: lightColors.o50, // '#FFF3E9'
    warningHover: lightColors.o100, // '#FFE2C8'

    errorBackground: lightColors.r50, //'#FAE4E4'
    errorHover: lightColors.r100, // '#F3BCBC'
};

export function rgbToHexString(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

export function hexToRgbString(hex) {
    const rgbObject = hexToRgb(hex);
    return `rgb(${rgbObject.r}, ${rgbObject.g}, ${rgbObject.b})`;
}