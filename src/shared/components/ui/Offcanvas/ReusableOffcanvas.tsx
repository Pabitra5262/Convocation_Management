import React, { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialog, usePresence } from '@/shared/hooks/useDialog';

/* Styles: src/shared/styles/overlay.css (hims-ui-new Overlay/Drawer) */

interface ReusableOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subTitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  /** Panel width for left/right (height for top/bottom). Full width on phones. */
  width?: string | number;
  closeOnBackdropClick?: boolean;
}

/** Side panel: slides in from an edge, dims the page, traps focus, Esc to close. */
const ReusableOffcanvas: React.FC<Readonly<ReusableOffcanvasProps>> = ({
  isOpen,
  onClose,
  title,
  subTitle,
  children,
  footer,
  anchor = 'right',
  width = 450,
  closeOnBackdropClick = true,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { mounted, closing } = usePresence(isOpen, 260);
  useDialog(panelRef, isOpen, onClose);

  if (!mounted) return null;

  const size = typeof width === 'number' ? `${width}px` : width;
  const horizontal = anchor === 'left' || anchor === 'right';

  return createPortal(
    <div className={`ui-overlay ui-overlay--${anchor} ${closing ? 'is-closing' : ''}`}>
      <div className="ui-backdrop" onMouseDown={closeOnBackdropClick ? onClose : undefined} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`ui-drawer ui-drawer--${anchor}`}
        style={{ '--drawer-size': size } as React.CSSProperties}
      >
        <header className="ui-modal__header">
          <div className="min-w-0">
            <h2 id={titleId} className="ui-modal__title">{title}</h2>
            {subTitle && <p className="ui-modal__description">{subTitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close panel" className="ui-modal__close">
            <X size={18} />
          </button>
        </header>
        <div className={`ui-modal__body ${horizontal ? 'flex-1' : ''}`}>{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
};

export default ReusableOffcanvas;
