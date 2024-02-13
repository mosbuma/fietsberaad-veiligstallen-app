import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { type ParkingDetailsType } from "~/types/";
import { getParkingDetails, generateRandomId } from "~/utils/parkings";

import ParkingEdit from "~/components/parking/ParkingEdit";
import ParkingView from "~/components/parking/ParkingView";

const Parking = ({
  parkingID,
  startInEditMode = false
}: {
  parkingID: string,
  startInEditMode?: boolean
}) => {
  const session = useSession();

  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType | null>(null);
  const [currentRevision, setCurrentRevision] = useState<number>(0);

  useEffect(() => {
    const stallingId = parkingID;
    if (stallingId === undefined || Array.isArray(stallingId)) {
      console.warn('stallingId is undefined or array', stallingId);
      return;
    }

    if (stallingId === "nieuw") {
      console.warn('edit of stallingid "nieuw" is not allowed');
      return;
    }

    // console.log(`***** getParkingDetails ${stallingId} -R ${currentRevision} ******`);
    getParkingDetails(stallingId).then((stalling) => {
      setCurrentStalling(stalling);
    });
  }, [
    parkingID,
    currentRevision
  ]);

  const handleCloseEdit = () => {
    // console.log("handleCloseEdit");
    setEditMode(false);
  }

  const handleUpdateRevision = () => {
    setCurrentRevision(currentRevision + 1);
  }

  const [editMode, setEditMode] = React.useState(startInEditMode);

  const allowEdit = session.status === "authenticated" || parkingID.substring(0, 8) === "VOORSTEL";

  if (null === currentStalling) {
    return (null);
  }


  if (allowEdit === true && (editMode === true)) {
    return (<ParkingEdit parkingdata={currentStalling} onClose={() => handleCloseEdit()} onChange={handleUpdateRevision} />);
  } else {
    return (<ParkingView parkingdata={currentStalling} onEdit={allowEdit ? () => { setEditMode(true) } : undefined} />);
  }
};

export default Parking;
