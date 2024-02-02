import React from "react";
import { useRouter } from 'next/router'

import { Button } from "~/components/Button";

function WelcomeToMunicipality({
  municipalityInfo,
  buttonClickHandler
}: {
  municipalityInfo?: any,
  buttonClickHandler?: Function
}) {
  const { push } = useRouter();

  if (!municipalityInfo) {
    return <div>
      Leuk dat je VeiligStallen gebruikt!
    </div>
  }

  return <div className="
    text-center
  ">
    <div data-name="bike-icon">
      <img
        src="/images/bike-blue-green.png"
        alt="Fiets"
        className="
          h-24
          mx-auto
          -mt-16
        "
      />
    </div>

    <h1 data-name="title" className="
      text-4xl
      font-bold
      my-6
      text-red-500
    "
      style={{
        color: `#${municipalityInfo.ThemeColor1}`
      }}
    >
      Welkom in {municipalityInfo.CompanyName}
    </h1>

    <p className="my-6">
      De kortste weg naar een veilige plek voor uw fiets in {municipalityInfo.CompanyName}.
    </p>

    <div className="my-6">
      <div>
        <Button onClick={(e) => {
          e.preventDefault();
          // Redirect
          const url = `/${municipalityInfo.UrlName}?typesFilter=bewaakt,onbewaakt,toezicht,geautomatiseerd`;
          push(url);
          // Close modal
          if (buttonClickHandler) {
            buttonClickHandler();
          }
        }}
          className="mx-auto inline-block w-full py-3 text-center max-w-xs"
          style={{
            backgroundColor: `#${municipalityInfo.ThemeColor1}`,
            color: `#fff`
          }}
        >
          Zoek een openbare stalling
        </Button>
      </div>
      <div>
        <Button onClick={(e) => {
          e.preventDefault();
          // Redirect
          const url = `/${municipalityInfo.UrlName}?typesFilter=buurtstalling,fietstrommel,fietskluizen`;
          push(url);
          // Close modal
          if (buttonClickHandler) {
            buttonClickHandler();
          }
        }}
          className="mx-auto inline-block w-full py-3 text-center max-w-xs"
          style={{
            backgroundColor: `#${municipalityInfo.ThemeColor1}`,
            color: `#fff`
          }}
        >
          Zoek een prive stalling
        </Button>
      </div>
    </div>

    <p className="mt-6">
      <a href={`/${municipalityInfo.UrlName}/home`} className="text-gray-500 underline" onClick={(e) => {
        e.preventDefault();
        push(`/${municipalityInfo.UrlName}/home`);
        // Close modal
        if (buttonClickHandler) {
          buttonClickHandler();
        }
      }}>
        Parkeren in {municipalityInfo.CompanyName} - Hoe werkt het?
      </a>
    </p>

  </div>
}

export default WelcomeToMunicipality;
