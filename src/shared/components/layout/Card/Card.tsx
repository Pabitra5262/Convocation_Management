import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/* Styles: src/shared/styles/card.css (ported from hims-ui-new components/ui/Card) */

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ---------------------------------------------------------------------- */
/* Building blocks                                                        */
/* ---------------------------------------------------------------------- */

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    icon?: LucideIcon;
    as?: "h2" | "h3" | "h4";
    /** Form sections: a hairline under the heading with a short saffron accent at its left end. */
    divider?: boolean;
}

export const CardHeader = ({ title, description, actions, icon: Icon, as: Heading = "h3", divider, className, ...rest }: CardHeaderProps) => (
    <div className={cx("ui-card__header", divider && "card-header-divider", className)} {...rest}>
        <div className="ui-card__heading">
            {Icon && (
                <span className="ui-card__icon" aria-hidden>
                    <Icon size={16} />
                </span>
            )}
            <div className="min-w-0">
                <Heading className="ui-card__title">{title}</Heading>
                {description && <p className="ui-card__description">{description}</p>}
            </div>
        </div>
        {actions && <div className="ui-card__actions">{actions}</div>}
    </div>
);

export const CardBody = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cx("ui-card__body", className)} {...rest} />
);

export const CardFooter = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cx("ui-card__footer", className)} {...rest} />
);

/* ---------------------------------------------------------------------- */
/* Card                                                                   */
/* ---------------------------------------------------------------------- */

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** Shortcut: renders a CardHeader (with the saffron divider) and wraps children in a CardBody. */
    title?: ReactNode;
    description?: ReactNode;
    icon?: LucideIcon;
    actions?: ReactNode;
    footer?: ReactNode;
    /** Remove body padding (e.g. when the card wraps a table). */
    flush?: boolean;
    /** Lifts with a stronger shadow on hover. */
    interactive?: boolean;
    /** Same as className (kept for existing pages). */
    containerClassName?: string;
    bodyClassName?: string;
}

/**
 * <Card title="Employee Details" icon={Users} actions={…}>…</Card>
 * or compose freely: <Card><CardHeader …/><CardBody>…</CardBody><CardFooter>…</CardFooter></Card>
 */
const Card = ({
    title,
    description,
    icon,
    actions,
    footer,
    flush,
    interactive,
    containerClassName,
    bodyClassName,
    className,
    children,
    ...rest
}: CardProps) => {
    // When flush is true (e.g. wrapping a full-width DataTable across feature list pages),
    // avoid rendering a redundant duplicate header or double-bordered box,
    // so the table displays with its native toolbar, header strip, and rounded borders.
    if (flush) {
        return (
            <div className={cx("ui-card-flush-wrap w-full", containerClassName, className)} {...rest}>
                {children}
            </div>
        );
    }

    const hasShortcut = title !== undefined || footer !== undefined;
    return (
        <div className={cx("ui-card", interactive && "ui-card--interactive", containerClassName, className)} {...rest}>
            {hasShortcut ? (
                <>
                    {title !== undefined && <CardHeader title={title} description={description} icon={icon} actions={actions} divider />}
                    <CardBody className={bodyClassName}>{children}</CardBody>
                    {footer && <CardFooter>{footer}</CardFooter>}
                </>
            ) : (
                children
            )}
        </div>
    );
};

export default Card;
