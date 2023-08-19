// Logo.tsx - Location specific logo
import * as React from "react";
import {
  useDispatch, useSelector
} from "react-redux";

function Logo({
  imageUrl
}: {
  imageUrl?: string
}) {
  return (
    <>
  		<img
        src={imageUrl ? imageUrl : `/images/logo-transparant.png`}
        className="mr-2 h-12"
        alt="logo Gemeente Utrecht"
      />
    </>
  );
}

export default Logo;
