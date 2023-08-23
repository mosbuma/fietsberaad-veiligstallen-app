// Logo.tsx - Location specific logo
import * as React from "react";

function Logo({
  imageUrl
}: {
  imageUrl?: string
}) {
  return (
    <>
  		<img
        src={imageUrl ? imageUrl : `/images/logo-transparant.png`}
        className="block mr-2 h-12"
        alt="logo Gemeente"
      />
    </>
  );
}

export default Logo;
