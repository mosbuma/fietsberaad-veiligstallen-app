import * as React from "react";
import Input from '@mui/material/TextField';

function ContentPageWrapper({
  children,
  className
}: {
  children?: any
  className?: string
}) {
  return (
    <main className={`
      px-5
      pt-28
      mx-auto
      max-w-5xl
      ${className}
    `}>
      {children}
    </main>
  );
}

export default ContentPageWrapper;
