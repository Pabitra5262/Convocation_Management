export const isTokenValid = (
    token: string | null | undefined
): boolean => {
    if (!token) return false;

    try {
        const parts = token.split('.');
        if (parts.length < 2) return false;
        
        // Decode base64 URL payload manually
        const payloadStr = window.atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const decoded = JSON.parse(payloadStr);

        const currentTime: number = Date.now() / 1000;
        return typeof decoded.exp === "number" && decoded.exp > currentTime;
    } catch (error) {
        const err = error as Error;
        console.error("Token validation error:", err.message);
        return false;
    }
};


