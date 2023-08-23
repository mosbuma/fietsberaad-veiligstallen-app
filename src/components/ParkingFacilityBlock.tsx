import { useRouter } from "next/navigation";

import { getParkingColor } from "~/utils/theme";
import { openRoute } from "~/utils/map/index";

import Styles from "./ParkingFacilityBlock.module.css";

type ParkingType = {
  ID: string;
  Title: string;
  Plaats?: string;
  Location?: string;
  Postcode?: any;
  Status?: any;
  Coordinaten?: any;
  Type?: any;
  Tariefcode?: number;
  Openingstijden?: string;
  Open_ma?: string;
  Dicht_ma?: string;
  Open_di?: string;
  Dicht_di?: string;
  Open_wo?: string;
  Dicht_wo?: string;
  Open_do?: string;
  Dicht_do?: string;
  Open_vr?: string;
  Dicht_vr?: string;
  Open_za?: string;
  Dicht_za?: string;
  Open_zo?: string;
  Dicht_zo?: string;
}

const isOpen = (openingTime: Date, closingTime: Date): boolean => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const opening = openingTime.getHours() * 60 + openingTime.getMinutes();
  let closing = closingTime.getHours() * 60 + closingTime.getMinutes();

  if (closing < opening) {
    // Closing time is on the next day, add 24 hours to closing time
    closing += 24 * 60;
  }

  return currentTime >= opening && currentTime <= closing;
};

const formatTime = (time: Date): string => {
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatOpeningToday = (parkingdata: any): string => {
  const dayidx = new Date().getDay();
  const daytxt = ["za", "zo", "ma", "di", "wo", "do", "vr"];

  const openstr = parkingdata["Open_" + daytxt[dayidx]];
  const closestr = parkingdata["Dicht_" + daytxt[dayidx]];

  // console.log(parkingdata.Title, parkingdata.Type, openstr, closestr);

  if (null === openstr || null === closestr) {
    return "";
  }

  const openinfo = new Date(openstr);
  const closeinfo = new Date(closestr);

  // console.log(
  //   parkingdata.Title,
  //   parkingdata.Type,
  //   "valid open/close info",
  //   openinfo,
  //   closeinfo,
  //   parkingdata.Openingstijden
  // );

  if (isOpen(openinfo, closeinfo)) {
    return `open, sluit om ${formatTime(closeinfo)}`;
  } else {
    return "gesloten";
  }
};

function ParkingFacilityBlock({
  parking,
  id,
  compact,
  openParkingHandler,
  expandParkingHandler,
  showButtons,
}: {
  id?: any,
  parking: ParkingType,
  openParkingHandler?: Function,
  showButtons?: false
}) {
  const { push } = useRouter();

  const locationDescription = `${parking.Location || ""}${
    parking.Location && parking.Plaats ? ", " : ""
  }${parking.Plaats ? parking.Plaats : ''}`;

  let costDescription: string | undefined = "";
  switch (parking.Tariefcode) {
    case 1:
      costDescription = "betaald";
      break;
    case 2:
      costDescription = "gratis";
      break;
    case 3:
      // lijkt een testwaarde
      costDescription = "";
      break;
    case 4:
      costDescription = "gratis";
      break;
    case 5:
      costDescription = "gratis";
      break;
    case null:
      costDescription = "";
      break;
    default:
      costDescription = `tariefcode ${parking.Tariefcode}`;
      break;
  }

  const openingDescription = formatOpeningToday(parking);

  const detailsLine = `${costDescription}${
    costDescription && openingDescription ? "| " : ""
  }${openingDescription}`;

  if(parking.ExtraServices) {
    // console.log('parking', parking)
  }

  // Set image
  let parkingImageUrl = parking.Image;
  // If no parking image was found: Show default image
  if(! parkingImageUrl) {
    parkingImageUrl = `/images/bike-blue-green.png`;
  }
  // If parking has an image URL not starting with http: Create veiligstallen URL
  else if(! parkingImageUrl.includes('http')) {
    parkingImageUrl = `https://static.veiligstallen.nl/library/fietsenstallingen/${parkingImageUrl}`;
  }

  return (
    <div
      id={id}
      className={`
        ParkingFacilityBlock
        relative
        flex w-full
        justify-between
        border-b
        border-solid
        border-gray-300
        bg-white
        px-5 pb-5
        pt-5
        ${compact ? 'cursor-pointer' : ''}
      `}
      onClick={() => {
        // Expand parking if expandParkingHandler was given
        if (expandParkingHandler) expandParkingHandler(parking.ID);
        // Open parking if no expand handler was given
        if (!expandParkingHandler && openParkingHandler)
          openParkingHandler(parking.ID);
      }}
    >
      <div
        data-name="left"
        className={`
          mr-2 hidden
          align-middle
          sm:inline-block ${Styles["icon-type"]}
        `}
        style={{
          marginTop: "5px",
          borderColor: getParkingColor(parking.Type),
        }}
      />
      <div data-name="right" className="flex-1">
        <div className="">
          <div className="h-6 overflow-hidden sm:h-auto">
            <b className="text-base">{parking.Title}</b>
          </div>
          <div className="text-sm text-gray-500 h-5 overflow-hidden" title={{locationDescription}}>
            {locationDescription}
          </div>
        </div>
        <div
          className="
          mt-2 flex justify-between
          text-sm text-gray-500
        "
        >
          <div className="">

            {! showButtons && costDescription+' '}

            {showButtons && <div>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  if (openParkingHandler) openParkingHandler(parking.ID);
                }}
                href="#"
                className="text-sm text-gray-500 underline"
              >
                meer informatie
              </a>
            </div>}
          </div>
          {costDescription && openingDescription ? (
            <div className="hidden sm:inline-block">|</div>
          ) : null}
          <div className="text-right">
            {! showButtons && openingDescription+' '}
          </div>

          {(showButtons && parking.Coordinaten) && (<>
            <a href="" className="
              absolute right-5 bottom-5
              inline-block
              rounded-full shadow
              p-2
            " onClick={(e) => {
                e.preventDefault();
                openRoute(parking.Coordinaten)
              }}>
              <img src="/images/icon-route.png" alt="Open route" className="w-5" />
            </a>
          </>)}

        </div>
        {!compact && (
          <>
            <figure className="mt-4     mx-auto p-2">
              <img
                className="mx-auto"
                src={parkingImageUrl}
                style={{
                  borderRadius: "7px",
                  maxHeight: '150px'
                }}
              />
            </figure>
            <div className="mt-4 flex justify-between">
              <div className="flex text-sm text-gray-500">
                {/*
                <span className="mr-2">buggy-uitleen</span>
                <span className="mr-2">fietspomp</span>
                <span className="mr-2">fietsverhuur</span>
                <span className="mr-2">kluisjes</span>
                <span className="mr-2">opladen e-fiets</span>
                <span className="mr-2">toilet</span>
                <span>nog een icoon</span>
                */}
                <span>{parking.ExtraServices}</span>
              </div>
              <div>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    if (openParkingHandler) openParkingHandler(parking.ID);
                  }}
                  href="#"
                  className="text-sm text-gray-500 underline"
                >
                  meer informatie
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ParkingFacilityBlock;
