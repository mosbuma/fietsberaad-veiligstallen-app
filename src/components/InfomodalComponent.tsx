"use client";

import { useState, useEffect, useRef } from "react";
import { AppState } from "~/store/store";
import Modal from "src/components/Modal";
import WelcomeToMunicipality from "./WelcomeToMunicipality";
import { useSelector } from "react-redux";

export default function InfomodalComponent({ }) {
    const [visible, setVisible] = useState(true);

    const initialLatLng = useSelector(
        (state: AppState) => state.map.initialLatLng,
    );

    const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo,
    );

    const TO_showWelcomeModal = useRef<NodeJS.Timeout | null>(null);

    // Open municipality info modal
    useEffect(() => {
        if (TO_showWelcomeModal.current) clearTimeout(TO_showWelcomeModal.current);
        TO_showWelcomeModal.current = setTimeout(() => {
          if (!initialLatLng || !activeMunicipalityInfo) return;
          // Save the fact that user did see welcome modal
          const VS__didSeeWelcomeModalString: string =
            localStorage.getItem("VS__didSeeWelcomeModal") || "";
          let VS__didSeeWelcomeModal: number = 0;
          try {
            VS__didSeeWelcomeModal = parseInt(VS__didSeeWelcomeModalString);
          } catch (ex) {
            VS__didSeeWelcomeModal = 0;
          }
    
          // console.log('GET timestamp', VS__didSeeWelcomeModal, Date.now() - VS__didSeeWelcomeModal, 'Date.now()', Date.now())
          // Only show modal once per 15 minutes
          if (
            !VS__didSeeWelcomeModal ||
            Date.now() - VS__didSeeWelcomeModal > (3600 * 1000) / 4
          ) {
            setVisible(true);
          }
        }, 1650); // 1500 is flyTo time in MapComponent
      }, [activeMunicipalityInfo, initialLatLng]);
  

    const handleClose = () => {
        setVisible(false);
    }

    if(!visible) return null;

    return (
        <Modal
        onClose={() => {
            // Save the fact that user did see welcome modal
            localStorage.setItem(
            "VS__didSeeWelcomeModal",
            Date.now().toString(),
            );

            setVisible(false);
        }}
        clickOutsideClosesDialog={false}
        modalStyle={{
            width: "400px",
            maxWidth: "100%",
            marginRight: "auto",
            marginLeft: "auto",
        }}
        modalBodyStyle={{
            overflow: "visible",
        }}
        >
        <WelcomeToMunicipality
            municipalityInfo={activeMunicipalityInfo}
            buttonClickHandler={() => {
            // Save the fact that user did see welcome modal
            localStorage.setItem(
                "VS__didSeeWelcomeModal",
                Date.now().toString(),
            );

            setVisible(false);
            }}
        />
        </Modal>
    );
}