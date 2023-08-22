import React from "react";
import { useSession } from "next-auth/react";

import ParkingEdit from "~/components/ParkingEdit";
import ParkingView from "~/components/ParkingView";

const Parking = ({ parkingdata }: { parkingdata: any }) => {
  const session = useSession();

  const [editMode, setEditMode] = React.useState(false);

  const allowEdit = session.status === "authenticated";

  if(allowEdit===true && editMode===true) {
    return (<ParkingEdit parkingdata={parkingdata} onClose={()=>{setEditMode(false)}}/>);
  } else {
    return (<ParkingView parkingdata={parkingdata} onEdit={allowEdit?()=>{setEditMode(true)}:undefined}/>);
  }
};

export default Parking;
