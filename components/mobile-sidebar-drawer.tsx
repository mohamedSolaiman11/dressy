"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";

export function MobileSidebarDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="icon-button mobile-drawer-toggle"
        aria-label="فتح القائمة الجانبية"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      {open ? (
        <div className="mobile-drawer-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <aside
            className="mobile-drawer-sheet"
            aria-label="القائمة الجانبية"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-drawer-head">
              <strong>القائمة</strong>
              <button
                type="button"
                className="icon-button"
                aria-label="إغلاق القائمة الجانبية"
                onClick={() => setOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mobile-drawer-body">{children}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
