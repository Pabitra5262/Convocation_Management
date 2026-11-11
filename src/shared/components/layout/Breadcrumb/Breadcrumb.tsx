import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    href?: string;
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    /** Adds a leading "Home" link to /dashboard (default true). */
    showHome?: boolean;
    className?: string;
}

/** Home › Administration › Governing Body › Current page. Styles: src/shared/styles/breadcrumb.css */
const Breadcrumb: React.FC<Readonly<BreadcrumbProps>> = ({ items, showHome = true, className = '' }) => {
    const crumbs: BreadcrumbItem[] = showHome ? [{ label: 'Home', path: '/dashboard' }, ...items] : items;

    return (
        <nav aria-label="Breadcrumb" className={`breadcrumb ${className}`}>
            <ol className="breadcrumb__list">
                {crumbs.map((item, i) => {
                    const isLast = i === crumbs.length - 1;
                    const to = item.path || item.href;
                    // On phones only the last two levels are shown.
                    const isFar = i < crumbs.length - 2;
                    return (
                        <li key={`${item.label}-${i}`} className={`breadcrumb__item ${isFar ? 'breadcrumb__item--far' : ''}`}>
                            {i > 0 && <ChevronRight size={13} className="breadcrumb__separator" />}
                            {isLast || !to || to === '#' ? (
                                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'breadcrumb__current' : undefined}>
                                    {item.label}
                                </span>
                            ) : (
                                <Link to={to} className="breadcrumb__link">
                                    {i === 0 && showHome && <Home size={13} />}
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
