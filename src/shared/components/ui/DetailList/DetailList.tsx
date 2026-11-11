import type { ReactNode } from "react";

/* Label / value rows for detail cards. Styles: src/shared/styles/display.css */

export interface DetailItem {
    label: string;
    value: ReactNode;
}

export const DetailList = ({ items, className = "" }: { items: DetailItem[]; className?: string }) => (
    <dl className={`ui-detail-list ${className}`}>
        {items.map((item) => (
            <div key={item.label} className="ui-detail-list__row">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
            </div>
        ))}
    </dl>
);

export default DetailList;
