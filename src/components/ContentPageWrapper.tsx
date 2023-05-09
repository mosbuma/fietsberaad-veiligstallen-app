import * as React from "react";
import Input from '@mui/material/TextField';

function ContentPageWrapper({
  children
}) {
  return (
    <main className="
      px-5
      pt-28
    ">
      {children}
    </main>
  );
}

export default ContentPageWrapper;
