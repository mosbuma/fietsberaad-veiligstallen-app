import { useRouter } from 'next/navigation';

import {getParkingColor} from '~/utils/theme';

import Styles from './ParkingFacilityBlock.module.css';

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
    Coordinaten?: any,
    Type?: any
  },
  compact?: boolean,
  onClick?: Function
}) {
  const { push } = useRouter();
  
  return (
    <div className="
      ParkingFacilityBlock
      w-full bg-white
      px-5
      my-5
      border-b
      border-solid
      border-gray-300
      pb-5
      flex justify-between
      cursor-pointer
    " onClick={() => {
      if(onClick) onClick(parking.ID);
    }}>
      <div
        data-name="left"
        className={`
          mr-2
          inline-block align-middle ${Styles['icon-type']}
        `}
        style={{
          marginTop: '5px',
          borderColor: getParkingColor(parking.Type)
        }}
      />
      <div data-name="right" className="flex-1">
        <div className="">
          <div>
            <b className="text-base">{parking.Title}</b>
          </div>
          <div className="text-sm text-gray-500">
            Catharijnesingel 28
          </div>
        </div>
        <div className="
          mt-2 flex justify-between
          text-sm text-gray-500
        ">
          <div className="flex-1">
            Eerste 24 uur gratis
          </div>
          <div>
            |
          </div>
          <div className="flex-1 text-right">
            open, sluit om 1:00
          </div>
        </div>
        {! compact && <>
          <figure className="mt-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bicycle_parking_at_Alewife_station%2C_August_2001.jpg/330px-Bicycle_parking_at_Alewife_station%2C_August_2001.jpg" style={{
              borderRadius: '7px'
            }} />
          </figure>
          <div className="mt-4 flex justify-between">
            <div className="flex text-sm text-gray-500">
              <span className="mr-2">icoon1</span>
              <span>icoon2</span>
            </div>
            <div>
              <a href="#" className="underline text-sm text-gray-500">meer informatie</a>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
};

export default ParkingFacilityBlock;
