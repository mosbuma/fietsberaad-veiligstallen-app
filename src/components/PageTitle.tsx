import * as React from "react";
// import Input from '@mui/material/TextField';

function PageTitle({
  children
}) {
  return (
    <h1 className="
      text-3xl
      font-poppinssemibold
      mb-6
    ">
      {children}
    </h1>
  );
}

export default PageTitle;
