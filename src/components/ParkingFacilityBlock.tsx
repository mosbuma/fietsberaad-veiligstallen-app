
function ParkingFacilityBlock({ parking }: {
  Title: string,
  Plaats?: string,
  Postcode?: any,
  Status?: any,
  Coordinaten?: any,
}) {
  return (
    <div className="
      w-full bg-white
      my-4
      border-b
      border-solid
      border-gray-300
      pb-4
    ">
      <b>{parking.Title}</b><br />
      {parking.Postcode} {parking.Plaats}<br />
      &euro;0,00 - &euro;0,55 | {parking.Status}
    </div>
  );
};

export default ParkingFacilityBlock;
