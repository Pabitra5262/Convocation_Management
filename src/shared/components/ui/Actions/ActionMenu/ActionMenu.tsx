import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MoreVertical, Eye, Edit, Trash2, Download, FileText, Lock, Link as LinkIcon } from 'lucide-react';
import type { ActionType } from "../action.types";

interface ActionMenuProps {
    actions: ActionType[];
    onAction?: (action: ActionType) => void;
}

const actionIcons: Partial<Record<ActionType, React.ReactNode>> = {
    view: <Eye size={16} />,
    edit: <Edit size={16} />,
    delete: <Trash2 size={16} />,
    download: <Download size={16} />,
    pdf: <FileText size={16} />,
    toggle: null,
    lock: <Lock size={16} />,
    link: <LinkIcon size={16} />,
};

const actionLabels: Partial<Record<ActionType, string>> = {
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    download: 'Download',
    pdf: 'PDF',
    toggle: 'Toggle',
    lock: 'Lock',
    link: 'Link',
};

const actionColors: Partial<Record<ActionType, string>> = {
    view: 'text-blue-600 hover:bg-blue-50',
    edit: 'text-amber-600 hover:bg-amber-50',
    delete: 'text-red-600 hover:bg-red-50',
    download: 'text-green-600 hover:bg-green-50',
    pdf: 'text-purple-600 hover:bg-purple-50',
    toggle: 'text-gray-600 hover:bg-gray-50',
    lock: 'text-gray-600 hover:bg-gray-50',
    link: 'text-cyan-600 hover:bg-cyan-50',
};

export default function ActionMenu({ actions, onAction }: Readonly<ActionMenuProps>) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX - 180,
            });
        }
    }, [isOpen]);

    const menuPortal = isOpen ? ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
            style={{
                top: `${coords.top}px`,
                left: `${coords.left}px`,
            }}
        >
            {actions.map((action) => (
                <button
                    key={action}
                    type="button"
                    onClick={() => {
                        onAction?.(action);
                        setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm font-medium transition-colors ${actionColors[action]} border-b border-gray-100 last:border-b-0`}
                >
                    {actionIcons[action]}
                    <span>{actionLabels[action]}</span>
                </button>
            ))}
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div className="relative">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    title="Actions"
                >
                    <MoreVertical size={18} className="text-gray-600" />
                </button>
            </div>
            {menuPortal}
        </>
    );
}
