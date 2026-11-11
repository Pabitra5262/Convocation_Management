

import CryptoJS from "crypto-js";
import { SECRET_KEY, SECRET_IV } from "./keys";

const key: CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse(SECRET_KEY);
const iv: CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse(SECRET_IV);

export const encryptPayload = (
    payload: unknown
): string | null => {
    try {
        const payloadString: string =
            typeof payload === "string"
                ? payload
                : JSON.stringify(payload);

        const encrypted: CryptoJS.lib.CipherParams =
            CryptoJS.AES.encrypt(payloadString, key, {
                iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });

        return encrypted.toString();
    } catch (err) {
        const error = err as Error;
        console.error("Encryption error:", error.message);
        return null;
    }
};
