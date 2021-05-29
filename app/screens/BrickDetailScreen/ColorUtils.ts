interface HSVColor {
    chroma: number;
    hue: number;
    sat: number;
    val: number;
    luma: number;
    red: number;
    green: number;
    blue: number;
}

export function sortByColor<T>(colorData: T[], getRGB: (arg0: T) => string | null) {
    colorData.sort((a: T, b: T) => {
        const a_rgb = getRGB(a);
        const b_rgb = getRGB(b);
        if (a_rgb == null || b_rgb == null) {
            return 0;
        }
        let a_hsv = rgb2hsv(a_rgb);
        let b_hsv = rgb2hsv(b_rgb);
        // if(a_hsv == undefined || b_hsv == undefined){
        //   return false;
        // }
        return a_hsv.hue - b_hsv.hue;
    })
    return colorData;
}

export function isColorDark(colorString: string) {
    const color = +("0x" + colorString);

    const r = color >> 16;
    const g = color >> 8 & 255;
    const b = color & 255;

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    const hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );
    return hsp < 127.5;
}

function rgb2hsv(hex: string) {
    let colorObj = {} as HSVColor;
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;

    /* Getting the Max and Min values for Chroma. */
    var max = Math.max.apply(Math, [r, g, b]);
    var min = Math.min.apply(Math, [r, g, b]);


    /* Variables for HSV value of hex color. */
    var chr = max - min;
    var hue = 0;
    var val = max;
    var sat = 0;


    if (val > 0) {
        /* Calculate Saturation only if Value isn't 0. */
        sat = chr / val;
        if (sat > 0) {
            if (r == max) {
                hue = 60 * (((g - min) - (b - min)) / chr);
                if (hue < 0) {
                    hue += 360;
                }
            } else if (g == max) {
                hue = 120 + 60 * (((b - min) - (r - min)) / chr);
            } else if (b == max) {
                hue = 240 + 60 * (((r - min) - (g - min)) / chr);
            }
        }
    }
    colorObj.chroma = chr;
    colorObj.hue = hue;
    colorObj.sat = sat;
    colorObj.val = val;
    colorObj.luma = 0.3 * r + 0.59 * g + 0.11 * b;
    colorObj.red = parseInt(hex.substring(0, 2), 16);
    colorObj.green = parseInt(hex.substring(2, 4), 16);
    colorObj.blue = parseInt(hex.substring(4, 6), 16);
    return colorObj;
};