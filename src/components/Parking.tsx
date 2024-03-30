import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { AppState } from "~/store/store";

import { type ParkingDetailsType } from "~/types/";
import { getParkingDetails, getNewStallingDefaultRecord } from "~/utils/parkings";

import Modal from "src/components/Modal";
import ParkingEdit from "~/components/parking/ParkingEdit";
import ParkingView from "~/components/parking/ParkingView";

const Parking = ({ id, stallingId, onStallingIdChanged, onClose }: { id: string, stallingId: string | undefined, onStallingIdChanged: (newId: string | undefined) => void, onClose: () => void }) => {
  const session = useSession();
  // const router = useRouter();

  const [currentRevision, setCurrentRevision] = useState<number>(0);
  const [currentStallingId, setCurrentStallingId] = useState<string | undefined>(stallingId);
  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType | null>(null);
  const [editMode, setEditMode] = React.useState(false);

  const currentLatLong = useSelector(
    (state: AppState) => state.map.currentLatLng
  );

  useEffect(() => {
    if (currentStallingId === "aanmelden") {

      setCurrentStalling(getNewStallingDefaultRecord("", currentLatLong));
      setEditMode(true);
    } else if (currentStallingId !== undefined) {
      getParkingDetails(currentStallingId).then((stalling) => {
        if (null !== stalling) {
          setCurrentStalling(stalling);
        } else {
          setCurrentStalling(null);
        }
      });
    } else {
      setCurrentStalling(null);
    }
  }, [
    currentStallingId,
    currentRevision
  ]);

  const handleCloseEdit = (newStallingId: string | false) => {
    setEditMode(false);

    if (false !== newStallingId) {
      setCurrentStallingId(newStallingId);
      if (newStallingId.substring(0, 8) === 'VOORSTEL' || newStallingId === '') {
        onClose();
      }
    }
  }

  const handleUpdateRevision = () => {
    setCurrentRevision(currentRevision + 1);
  }

  if (null === currentStalling) {
    return null;
  }

  let allowEdit = session.status === "authenticated" || currentStalling && currentStalling.ID === "";

  let content = undefined;
  if (allowEdit === true && (editMode === true)) {
    content = (<ParkingEdit parkingdata={currentStalling} onClose={handleCloseEdit} onChange={handleUpdateRevision} />);
  } else {
    content = (<ParkingView parkingdata={currentStalling} onEdit={allowEdit ? () => { setEditMode(true) } : undefined} />);
  }

  return (
    <Modal
      key={id}
      onClose={() => {
        if (editMode) {
          if (confirm('Wil je het bewerkformulier verlaten?')) {
            setEditMode(false);
            onStallingIdChanged(undefined)
          }
        } else {
          onStallingIdChanged(undefined);
        }
      }}
      clickOutsideClosesDialog={false}
    >
      {content}
    </Modal >
  )
};

export default Parking;
