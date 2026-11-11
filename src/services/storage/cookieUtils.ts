

const getCookie = (name: string): string | null => {
    const value: string = `; ${document.cookie}`;
    const parts: string[] = value.split(`; ${name}=`);

    if (parts.length === 2) {
        const lastPart: string | undefined = parts.pop();
        if (!lastPart) return null;

        return lastPart.split(";").shift() ?? null;
    }

    return null;
};

const setCookie = (
    name: string,
    value: string,
    days: number = 7
): void => {
    const expires: Date = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const removeCookie = (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const getJwtToken = (): string | null => {
    return getCookie("jwtToken");
};

export const setJwtToken = (
    token: string,
    days: number = 7
): void => {
    setCookie("jwtToken", token, days);
};

export const removeJwtToken = (): void => {
    removeCookie("jwtToken");
};
