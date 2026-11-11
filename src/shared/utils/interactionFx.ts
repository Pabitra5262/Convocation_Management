/**
 * Click & hover micro-interactions (ported from hims-ui-new lib/clickFx.ts).
 * - Press spring on small buttons, ripple on [data-ripple] buttons
 * - Shake on danger action chips, flash on clicked table rows
 * - Hover spotlight: tells .ui-btn / .action-icon where the mouse is (--mx / --my)
 * - Circular theme reveal from the last click (withReveal)
 * Styles live in src/shared/styles/motion.css. Everything is skipped when Theme settings → Click animations is Off,
 * Reduce motion is on, or the OS asks for reduced motion.
 */
const PRESSABLE = "button, [role='button'], [role='tab'], [role='switch'], summary";
const SPOT = '.ui-btn, .action-icon';

/** Current click-animation level from Theme settings (data-anim / data-motion on <html>). */
export const animLevel = (): 'off' | 'subtle' | 'expressive' => {
    const root = document.documentElement;
    if (root.dataset.motion === 'reduced' || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) return 'off';
    const a = root.dataset.anim;
    return a === 'off' || a === 'expressive' ? a : 'subtle';
};

const reducedMotion = () => animLevel() === 'off';

/** Last pointer position, so the theme reveal can start from where the user clicked. */
export const lastClick = { x: 0, y: 0 };

/** Re-triggers a CSS animation class on an element and removes it afterwards. */
const restart = (el: Element, cls: string, ms: number) => {
    el.classList.remove(cls);
    void (el as HTMLElement).offsetWidth;
    el.classList.add(cls);
    window.setTimeout(() => el.classList.remove(cls), ms);
};

const isDisabled = (el: HTMLElement) =>
    (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true';

let clickStarted = false;
export function initClickEffects() {
    if (clickStarted || typeof document === 'undefined') return;
    clickStarted = true;
    let pressed: HTMLElement | null = null;

    const release = () => {
        if (!pressed) return;
        const el = pressed;
        pressed = null;
        el.removeAttribute('data-pressed');
        if (!reducedMotion()) restart(el, 'fx-release', 260);
    };

    document.addEventListener(
        'pointerdown',
        (e) => {
            lastClick.x = e.clientX;
            lastClick.y = e.clientY;
            if (reducedMotion() || e.button !== 0) return;
            const target = e.target as Element | null;

            const el = target?.closest<HTMLElement>(PRESSABLE);
            if (el && !isDisabled(el) && !el.hasAttribute('data-nopress')) {
                const r = el.getBoundingClientRect();
                // Big buttons (cards, whole sidebar rows) stay still; small controls get the spring.
                if (r.width <= 360 && r.height <= 80) {
                    pressed = el;
                    if (!el.textContent?.trim()) el.setAttribute('data-icon-only', '');
                    el.setAttribute('data-pressed', '');
                }
            }

            const rip = target?.closest<HTMLElement>('[data-ripple]');
            if (rip && !isDisabled(rip)) {
                const r = rip.getBoundingClientRect();
                const size = Math.max(r.width, r.height) * 2.4;
                const s = document.createElement('span');
                s.className = 'fx-ripple';
                s.style.cssText = `left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;width:${size}px;height:${size}px`;
                rip.appendChild(s);
                s.addEventListener('animationend', () => s.remove(), { once: true });
                window.setTimeout(() => s.remove(), 900);
            }
        },
        true,
    );
    ['pointerup', 'pointercancel', 'dragstart'].forEach((n) => document.addEventListener(n, release, true));
    window.addEventListener('blur', release);

    document.addEventListener(
        'click',
        (e) => {
            if (reducedMotion()) return;
            const target = e.target as Element | null;
            const danger = target?.closest<HTMLElement>('.action-icon--danger');
            if (danger) restart(danger, 'fx-shake', 400);
            const row = target?.closest<HTMLElement>('tbody tr[tabindex]');
            if (row && !target?.closest('button, a, input, label, select, textarea, [role="checkbox"]')) {
                restart(row, 'fx-row-flash', 700);
            }
        },
        true,
    );
}

let spotStarted = false;
export function initHoverSpotlight() {
    if (spotStarted || typeof document === 'undefined') return;
    spotStarted = true;
    let spotEl: HTMLElement | null = null;
    let spotEvt: PointerEvent | null = null;
    let raf = 0;

    document.addEventListener(
        'pointermove',
        (e) => {
            if (e.pointerType !== 'mouse' || document.documentElement.dataset.spot === 'off' || reducedMotion()) return;
            const el = (e.target as Element | null)?.closest<HTMLElement>(SPOT);
            if (!el || isDisabled(el)) return;
            spotEl = el;
            spotEvt = e;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                if (!spotEl || !spotEvt) return;
                const r = spotEl.getBoundingClientRect();
                spotEl.style.setProperty('--mx', `${spotEvt.clientX - r.left}px`);
                spotEl.style.setProperty('--my', `${spotEvt.clientY - r.top}px`);
            });
        },
        { passive: true },
    );
}

type ViewTransitionDoc = { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

/** Runs `change` with a circular reveal from the last click (Expressive only; otherwise a plain change). */
export function withReveal(change: () => void) {
    const doc = document as unknown as ViewTransitionDoc;
    if (animLevel() !== 'expressive' || !doc.startViewTransition) return change();
    const { x, y } = lastClick;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(change);
    vt.ready
        .then(() =>
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
                { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
            ),
        )
        .catch(() => {});
}

export function initInteractionEffects() {
    initClickEffects();
    initHoverSpotlight();
}
