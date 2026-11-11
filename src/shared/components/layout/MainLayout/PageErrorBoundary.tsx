import { Component, type ErrorInfo, type ReactNode } from "react";
import { ServerCrash } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/shared/i18n/I18nProvider";

/* Ported from hims-ui-new app/PageErrorBoundary.tsx. Styles: src/shared/styles/shell.css */

export const PageError = ({ onRetry }: { onRetry: () => void }) => {
    const t = useT();
    return (
        <div role="alert" className="page-error">
            <span className="page-error__icon"><ServerCrash size={28} /></span>
            <p className="page-error__code">{t("Error 500 · Server error")}</p>
            <h2 className="page-error__title">{t("Something went wrong on our side")}</h2>
            <p className="page-error__text">
                {t("The server couldn't complete the request. It has been logged automatically. Please try again in a moment.")}
            </p>
            <Button variant="outline" onClick={onRetry}>{t("Try again")}</Button>
        </div>
    );
};

/**
 * Catches errors thrown while a page renders and shows an error panel inside the app shell instead of a blank screen.
 * Keyed by the route in MainLayout, so moving to another page starts fresh.
 */
export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Swap for the real error-reporting service when it is connected.
        console.error("Page crashed", error, info.componentStack);
    }

    render() {
        return this.state.failed ? <PageError onRetry={() => this.setState({ failed: false })} /> : this.props.children;
    }
}
