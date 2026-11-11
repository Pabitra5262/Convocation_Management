import { removeJwtToken } from "./cookieUtils";

export const clearAuthData = (): void => {
    removeJwtToken();
};
