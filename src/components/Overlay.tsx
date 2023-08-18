// @ts-nocheck

import React, { useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

// Import components
import AppHeaderMobile from "~/components/AppHeaderMobile";

interface OverlayProps {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Overlay: React.FC<OverlayProps> = ({
  onClose,
  children,
  title,
}) => {
  const overlayWrapperRef = useRef<HTMLDivElement>(null);

  const backDropHandler = useCallback(
    (e: MouseEvent) => {
      if (
        overlayWrapperRef.current &&
        !overlayWrapperRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    },
    [onClose]
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

  const handleCloseClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    onClose();
  };

  const overlayContent = (
    <div className="bg-white">
      <div ref={overlayWrapperRef} className="overlay-wrapper">
        <div className="overlay">
          <AppHeaderMobile
            title={title}
            showCloseButton={true}
            handleCloseClick={handleCloseClick}
          />
          <div className="overlay-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    overlayContent,
    document.getElementById("overlay-root") as HTMLElement
  );
};

export default Overlay;
