import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router'
import { AppState } from "~/store/store";

import { type ParkingDetailsType } from "~/types/";
import { getParkingDetails, getNewStallingDefaultRecord } from "~/utils/parkings";

import ParkingEdit from "~/components/parking/ParkingEdit";
import ParkingView from "~/components/parking/ParkingView";

const Parking = () => {
  const session = useSession();
  const router = useRouter();

  const [currentRevision, setCurrentRevision] = useState<number>(0);
  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType | null>(null);
  const [editMode, setEditMode] = React.useState(false);

  const currentLatLong = useSelector(
    (state: AppState) => state.map.currentLatLng
  );

  useEffect(() => {
    if (router.query.stallingid === undefined || Array.isArray(router.query.stallingid)) {
      return;
    }

    const stallingId = router.query.stallingid;
    if (stallingId === undefined || Array.isArray(stallingId)) {
      console.warn('stallingId is undefined or array', stallingId);
      return;
    }

    if (stallingId === "aanmelden") {
      router.replace({ query: {} }, undefined, { shallow: true });

      let prefix = '';
      if (!session) {
        // when no user is logged in, a recognizalbe prefix is used
        prefix = 'VOORSTEL';
      }
      setCurrentStalling(getNewStallingDefaultRecord("", currentLatLong));
      setEditMode(true);
    } else {
      getParkingDetails(stallingId).then((stalling) => {
        if (null !== stalling) {
          setCurrentStalling(stalling);
        }
      });
    }

    // console.log(`***** getParkingDetails ${stallingId} -R ${currentRevision} ******`);
  }, [
    router.query.stallingid,
    currentRevision
  ]);

  const handleCloseEdit = (changeStallingID?: string) => {
    if (changeStallingID) {
      router.replace({ query: { stallingid: changeStallingID } }, undefined, { shallow: true });
      getParkingDetails(changeStallingID).then((stalling) => {
        if (null !== stalling) {
          setCurrentStalling(stalling);
          setEditMode(false);
        }
      });
    } else {
      setEditMode(false);
    }
  }

  const handleUpdateRevision = () => {
    setCurrentRevision(currentRevision + 1);
  }

  if (null === currentStalling) {
    return null;
  }

  let allowEdit = session.status === "authenticated" || currentStalling && currentStalling.ID === "";

  if (allowEdit === true && (editMode === true)) {
    return (<ParkingEdit parkingdata={currentStalling} onClose={handleCloseEdit} onChange={handleUpdateRevision} />);
  } else {
    return (<ParkingView parkingdata={currentStalling} onEdit={allowEdit ? () => { setEditMode(true) } : undefined} />);
  }
};

export default Parking;
