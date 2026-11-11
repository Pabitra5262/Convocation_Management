/**
 * Client-side image captcha (ported from hims-ui-new data/api.ts): 5 characters drawn on a noisy canvas.
 * Replace with the server captcha (AuthService.getCaptcha) once the login API is connected.
 */
const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export interface Captcha {
    /** The characters to type (kept client-side until the account service exists). */
    text: string;
    /** PNG data URL of the drawn image. */
    image: string;
}

/** Cryptographically random integer in [0, max). */
const randomInt = (max: number) => {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    return buf[0] % max;
};

const drawCaptcha = (text: string): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 80;
    const g = canvas.getContext("2d");
    if (!g) return "";
    const r = (n: number) => Math.random() * n;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, 200, 80);
    for (let i = 0; i < 220; i++) {
        g.fillStyle = `hsl(${r(360)} 70% 55%)`;
        g.fillRect(r(200), r(80), 2, 2);
    }
    g.font = "700 40px Georgia, serif";
    g.textBaseline = "middle";
    [...text].forEach((ch, i) => {
        g.save();
        g.translate(14 + i * 37, 42 + r(10) - 5);
        g.rotate((r(1) - 0.5) * 0.6);
        g.fillStyle = "#111";
        g.fillText(ch, 0, 0);
        g.restore();
    });
    for (let i = 0; i < 4; i++) {
        g.strokeStyle = `hsl(${r(360)} 70% 45%)`;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(r(40), r(80));
        g.bezierCurveTo(r(200), r(80), r(200), r(80), 160 + r(40), r(80));
        g.stroke();
    }
    return canvas.toDataURL("image/png");
};

export const createCaptcha = (): Captcha => {
    const text = Array.from({ length: 5 }, () => CAPTCHA_CHARS[randomInt(CAPTCHA_CHARS.length)]).join("");
    return { text, image: drawCaptcha(text) };
};
