import { useCallback } from "react";
import { useNavigate, type NavigateOptions, type To } from "react-router-dom";

/**
 * hplus_react `useAppNavigate`: module-relative navigation. In hplus_react it adds the module's mount prefix
 * (e.g. `/admin`); the wireframe runs at the root, so paths are used as they are.
 */
export const useAppNavigate = () => {
    const navigate = useNavigate();
    return useCallback(
        (to: To | number, options?: NavigateOptions) => {
            if (typeof to === "number") navigate(to);
            else navigate(to, options);
        },
        [navigate],
    );
};

export default useAppNavigate;
