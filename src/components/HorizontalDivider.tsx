import * as React from "react";

function HorizontalDivider({
  className
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#D6D6D6',
        height: '1px'
      }}
    />
  );
}

export default HorizontalDivider;
