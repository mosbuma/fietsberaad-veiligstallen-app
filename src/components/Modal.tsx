// @ts-nocheck

import React, { useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const isServer = typeof window === "undefined";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  clickOutsideClosesDialog?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  onClose,
  children,
  title,
  clickOutsideClosesDialog = false,
}) => {
  const modalWrapperRef = useRef<HTMLDivElement>(null);

  const backDropHandler = useCallback(
    (e: MouseEvent) => {
      if (!clickOutsideClosesDialog) return;
      if (
        modalWrapperRef.current &&
        !modalWrapperRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    },
    [onClose, clickOutsideClosesDialog]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      window.addEventListener("click", backDropHandler);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", backDropHandler);
    };
  }, [backDropHandler]);

  useEffect(() => {
    const initEscapeHandler = (event) => {
      // Check if <escape> is pressed
      if ( event.keyCode == 27 ) {
        console.log('escape pressed');
        // Close modal
        onClose();
      }
    }
    window.addEventListener('keydown', initEscapeHandler);

    return () => {
      window.removeEventListener('keydown', initEscapeHandler);
    }
  }, []);

  const handleCloseClick = (
    e?: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if(e) e.preventDefault();
    onClose();
  };

  const modalContent = (
    <div className="modal-overlay relative z-20">
      <div className="modal-background absolute top-0 right-0 bottom-0 left-0" onClick={handleCloseClick} />
      <div ref={modalWrapperRef} className="modal-wrapper">
        <div className="modal">
          <a href="#" onClick={handleCloseClick} className="modal-close-button">
            x
          </a>
          <div className="modal-body relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById("modal-root") as HTMLElement
  );
};

export default Modal;
