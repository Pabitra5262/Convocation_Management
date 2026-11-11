import { useEffect, useRef, type RefObject } from "react";

/**
 * Mouse depth for isometric scenes (ported from hims-ui-new hooks/useMouseDepth.ts): eases the scene's layers toward
 * the mouse pointer, and back to centre while `paused` or once the pointer leaves the window.
 * Mouse only: touch and pen never move it; pass `enabled = false` for reduced motion.
 * Writes `--hub-px` / `--hub-py` (-1…1) on the SVG each frame, so React does not re-render; `.hub-layer` in
 * login.css turns them into a translate scaled by each layer's `--k`.
 */
export const useMouseDepth = (svgRef: RefObject<SVGSVGElement | null>, enabled: boolean, paused = false) => {
    const pausedRef = useRef(paused);
    const wakeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || !enabled || !window.matchMedia("(pointer: fine)").matches) return;
        const clamp = (n: number) => Math.max(-1, Math.min(1, n));
        let tx = 0;
        let ty = 0;
        let x = 0;
        let y = 0;
        let frame = 0;
        const tick = () => {
            const gx = pausedRef.current ? 0 : tx;
            const gy = pausedRef.current ? 0 : ty;
            x += (gx - x) * 0.08;
            y += (gy - y) * 0.08;
            svg.style.setProperty("--hub-px", x.toFixed(3));
            svg.style.setProperty("--hub-py", y.toFixed(3));
            // Keep animating until the layers settle, then stop until the mouse moves again.
            frame = Math.abs(gx - x) + Math.abs(gy - y) > 0.002 ? requestAnimationFrame(tick) : 0;
        };
        const wake = () => {
            if (!frame) frame = requestAnimationFrame(tick);
        };
        wakeRef.current = wake;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const b = svg.getBoundingClientRect();
            tx = clamp((e.clientX - (b.left + b.width / 2)) / (b.width / 2));
            ty = clamp((e.clientY - (b.top + b.height / 2)) / (b.height / 2));
            wake();
        };
        const onLeave = () => {
            tx = 0;
            ty = 0;
            wake();
        };
        window.addEventListener("pointermove", onMove);
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            cancelAnimationFrame(frame);
            wakeRef.current = null;
            svg.style.removeProperty("--hub-px");
            svg.style.removeProperty("--hub-py");
        };
    }, [svgRef, enabled]);

    // Paused or resumed: glide to centre, or back toward the pointer.
    useEffect(() => {
        pausedRef.current = paused;
        wakeRef.current?.();
    }, [paused]);
};

export default useMouseDepth;
