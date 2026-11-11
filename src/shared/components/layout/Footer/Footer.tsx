import { useT } from "@/shared/i18n/I18nProvider";

/* Ported from hims-ui-new components/layout/Footer.tsx. Styles: src/shared/styles/shell.css */

const Footer = ({ version = "v1.0.0" }: { version?: string }) => {
    const t = useT();
    return (
        <footer className="app-footer no-print">
            <p>© {new Date().getFullYear()} HIMS Plus. {t("All rights reserved.")}</p>
            <p>{version}</p>
        </footer>
    );
};

export default Footer;
