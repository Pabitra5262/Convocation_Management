import React from "react";
import { Plus, Minus } from "lucide-react";

interface DynamicFormTableProps<T> {
    rows: readonly T[];
    headers: readonly React.ReactNode[];
    onAdd?: () => void;
    onRemove?: (index: number) => void;
    renderRow: (index: number) => React.ReactNode;
    disableAddRemove?: boolean;
    showAction?: boolean;
}

const isPrimitive = (value: unknown): value is string | number =>
    typeof value === "string" || typeof value === "number";

const getHeaderKey = (header: React.ReactNode, index: number): string => {
    if (isPrimitive(header)) {
        return `header-${header}`;
    }
    if (React.isValidElement(header) && isPrimitive(header.key)) {
        return String(header.key);
    }
    return `header-col-${index}`;
};

const getRowKey = <T,>(row: T, index: number): string => {
    if (row && typeof row === "object") {
        const item = row as Record<string, unknown>;
        if (isPrimitive(item.id)) return `row-${item.id}`;
        if (isPrimitive(item.tempId)) return `row-${item.tempId}`;
        if (isPrimitive(item.key)) return `row-${item.key}`;
    }
    return `row-item-${index}`;
};

const DynamicFormTable = <T,>({
    rows,
    headers,
    onAdd,
    onRemove,
    renderRow,
    disableAddRemove = false,
    showAction = true,
}: Readonly<DynamicFormTableProps<T>>) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border border-table-border antialiased">
                <thead className="bg-table-header-bg">
                    <tr>
                        <th className="py-2 px-3 border border-table-border w-16 text-center text-table-header-text font-semibold text-sm">Sl.No.</th>
                        {headers.map((h, idx) => (
                            <th key={getHeaderKey(h, idx)} className="py-2 px-3 border border-table-border text-left text-table-header-text font-semibold text-sm">{h}</th>
                        ))}
                        {showAction && (
                            <th className="py-2 px-3 border border-table-border w-24 text-center text-table-header-text font-semibold text-sm">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onAdd?.()}
                                        disabled={disableAddRemove || !onAdd}
                                        className={`p-1 rounded text-white transition-all ${disableAddRemove || !onAdd
                                            ? "bg-gray-300 opacity-50 cursor-not-allowed text-gray-500"
                                            : "bg-primary hover:opacity-80"
                                            }`}
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={getRowKey(row, index)} className="hover:bg-table-row-hover transition-colors">
                            <td className="py-1.5 px-3 border border-table-border text-center text-sm text-text-main">{index + 1}</td>
                            {renderRow(index)}
                            {showAction && (
                                <td className="py-1.5 px-3 border border-table-border text-center">
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => onRemove?.(index)}
                                            disabled={disableAddRemove || !onRemove}
                                            className={`p-1 rounded text-white transition-all ${disableAddRemove || !onRemove
                                                ? "bg-gray-300 opacity-50 cursor-not-allowed text-gray-500"
                                                : "bg-danger hover:opacity-80"
                                                }`}
                                        >
                                            <Minus size={13} />
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DynamicFormTable;
