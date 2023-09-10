import React from "react";
import { useSession } from "next-auth/react";

import { type ParkingDetailsType } from "~/types/";
import ParkingEdit from "~/components/parking/ParkingEdit";
import ParkingView from "~/components/parking/ParkingView";

const Parking = ({ parkingdata, startInEditMode=false }: { parkingdata: ParkingDetailsType, startInEditMode: boolean }) => {
  const session = useSession();

  const handleCloseEdit = () => {
    console.log("handleCloseEdit");
    setEditMode(false);
  }

  const [editMode, setEditMode] = React.useState(startInEditMode);

  const allowEdit = session.status === "authenticated" || parkingdata.ID.substring(0,8) === "VOORSTEL";

  if(allowEdit===true && (editMode===true)) {
    return (<ParkingEdit parkingdata={parkingdata} onClose={()=>handleCloseEdit()}/>);
  } else {
    return (<ParkingView parkingdata={parkingdata} onEdit={allowEdit?()=>{setEditMode(true)}:undefined}/>);
  }
};

export default Parking;
