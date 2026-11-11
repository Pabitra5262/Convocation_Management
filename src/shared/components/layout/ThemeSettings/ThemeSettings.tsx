import { useId } from "react";
import { RotateCcw } from "lucide-react";
import { useTheme, type CampusSlice, type ClickAnimations, type Density, type FontSize, type HoverEffect } from "@/config/theme";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/shared/i18n/I18nProvider";

/* Ported from hims-ui-new theme/ThemeCustomizer.tsx. Every control writes to ThemeContext → <html> data attributes /
   CSS variables → the whole UI. Styles: src/shared/styles/shell.css (.ts-*) and theme-settings.css. */

interface Option<T extends string> {
    value: T;
    label: string;
}

/** Row of mutually exclusive buttons (hims-ui-new SegmentedControl). */
const Segmented = <T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Option<T>[]; onChange: (v: T) => void }) => (
    <div role="radiogroup" aria-label={label} className="ts-seg">
        {options.map((o) => (
            <button key={o.value} type="button" role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)} className="ts-seg__btn">
                {o.label}
            </button>
        ))}
    </div>
);

/** Labelled on/off switch with a hint underneath. */
const Switch = ({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="app-switch">
        <span className="min-w-0 flex-1">
            <span className="app-switch__label">{label}</span>
            {description && <span className="app-switch__hint">{description}</span>}
        </span>
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span aria-hidden className="app-switch__track" />
    </label>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div>
        <p className="ts-label">{label}</p>
        {children}
        {hint && <p className="ts-hint">{hint}</p>}
    </div>
);

const Range = ({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) => {
    const id = useId();
    return (
        <div>
            <label htmlFor={id} className="ts-label ts-label--split">
                <span>{label}</span>
                <span className="ts-value">{value}%</span>
            </label>
            <input id={id} type="range" min={min} max={max} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))} className="ts-range" />
        </div>
    );
};

const ThemeSettings = () => {
    const tr = useT();
    const t = useTheme();

    return (
        <div className="ts">
            <section aria-labelledby="ts-layout" className="ts-section">
                <h3 id="ts-layout" className="ts-heading">{tr("Layout & style")}</h3>

                <Field label={tr("Appearance")}>
                    <Segmented label="Light or dark" value={t.theme} onChange={t.setTheme} options={[{ value: "light", label: tr("Light") }, { value: "dark", label: tr("Dark") }]} />
                </Field>

                <div className="ts-box">
                    <div>
                        <Range label={tr("Campus photo darkness")} value={t.campusDarkness} min={60} max={100} onChange={t.setCampusDarkness} />
                        <p className="ts-hint">{tr("Lower it to show more of the photo. Below about 70% some menu text may be harder to read.")}</p>
                    </div>
                    <Range label={tr("Campus photo blur")} value={t.campusBlur} min={0} max={100} onChange={t.setCampusBlur} />
                    <Field label={tr("Part of the photo")}>
                        <Segmented<CampusSlice>
                            label={tr("Part of the photo")}
                            value={t.campusSlice}
                            onChange={t.setCampusSlice}
                            options={[{ value: "left", label: tr("Left") }, { value: "centre", label: tr("Centre") }, { value: "right", label: tr("Right") }]}
                        />
                    </Field>
                </div>

                <Field label={tr("Density")}>
                    <Segmented<Density>
                        label="Density"
                        value={t.density}
                        onChange={t.setDensity}
                        options={[{ value: "compact", label: tr("Compact") }, { value: "comfortable", label: tr("Comfortable") }, { value: "spacious", label: tr("Spacious") }]}
                    />
                </Field>
            </section>

            <section aria-labelledby="ts-access" className="ts-section">
                <h3 id="ts-access" className="ts-heading">{tr("Accessibility")}</h3>

                <Field label={tr("Text size")}>
                    <Segmented<FontSize>
                        label={tr("Text size")}
                        value={t.fontSize}
                        onChange={t.setFontSize}
                        options={[{ value: "small", label: tr("Small") }, { value: "default", label: tr("Default") }, { value: "large", label: tr("Large") }]}
                    />
                </Field>

                <Field label={tr("Click animations")} hint={tr("Small effects on clicks, such as button presses, toggles, menus and tables. Reduce motion turns them all off.")}>
                    <Segmented<ClickAnimations>
                        label={tr("Click animations")}
                        value={t.clickAnimations}
                        onChange={t.setClickAnimations}
                        options={[{ value: "off", label: tr("Off") }, { value: "subtle", label: tr("Subtle") }, { value: "expressive", label: tr("Expressive") }]}
                    />
                </Field>

                <Field label={tr("Button hover spotlight")} hint={tr("A soft light follows your mouse across buttons. Not used on touch screens, with Reduce motion, or in High Contrast.")}>
                    <Segmented<HoverEffect>
                        label={tr("Button hover spotlight")}
                        value={t.hoverEffect}
                        onChange={t.setHoverEffect}
                        options={[{ value: "off", label: tr("Off") }, { value: "subtle", label: tr("Subtle") }, { value: "standard", label: tr("Standard") }, { value: "expressive", label: tr("Strong") }]}
                    />
                </Field>

                <Switch
                    label={tr("Header drop shadow")}
                    description={tr("Adds a soft shadow under the header so it lifts off the page.")}
                    checked={t.headerShadow}
                    onChange={t.setHeaderShadow}
                />
                <Switch
                    label={tr("Reduce motion")}
                    description={tr("Turns off animations and transitions, even if your device does not ask for it.")}
                    checked={t.reduceMotion}
                    onChange={t.setReduceMotion}
                />
            </section>

            <div className="ts-foot">
                <Button variant="outline" leftIcon={RotateCcw} onClick={t.resetCustomizations}>
                    {tr("Reset customisations")}
                </Button>
            </div>
        </div>
    );
};

export default ThemeSettings;
