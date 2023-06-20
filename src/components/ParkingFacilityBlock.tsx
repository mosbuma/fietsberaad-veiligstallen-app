import { useRouter } from 'next/navigation';

function ParkingFacilityBlock({
  parking,
  compact,
  onClick
}: {
  parking: {
    ID: string,
    Title: string,
    Plaats?: string,
    Postcode?: any,
    Status?: any,
    Coordinaten?: any
  },
  compact?: boolean,
  onClick?: Function
}) {
  const { push } = useRouter();
  
  return (
    <div className="
      ParkingFacilityBlock
      w-full bg-white
      my-4
      border-b
      border-solid
      border-gray-300
      pb-4
    " onClick={() => {
      if(onClick) onClick(parking.ID);
    }}>
      <div className="">
        <b>{parking.Title}</b><br />
        Catharijnesingel 28<br />
      </div>
      <div className="mt-2 flex justify-between">
        <div>
          Eerste 24 uur gratis
        </div>
        <div>
          open, sluit om 1:00
        </div>
      </div>
      {! compact && <>
        <figure className="mt-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bicycle_parking_at_Alewife_station%2C_August_2001.jpg/330px-Bicycle_parking_at_Alewife_station%2C_August_2001.jpg" />
        </figure>
        <div className="mt-4 flex justify-between">
          <div className="flex">
            <span>icoon1</span>
            <span>icoon2</span>
          </div>
          <div>
            <a href="#">Meer informatie</a>
          </div>
        </div>
      </>}
    </div>
  );
};

export default ParkingFacilityBlock;
