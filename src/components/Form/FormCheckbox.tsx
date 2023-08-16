// FormCheckbox.tsx - Generic checkbox component
import * as React from "react";

function FormCheckbox({
  required,
  classes,
  children
}: {
  required?: boolean,
  classes?: string,
  children?: any,
}) {
  return (
    <label
      className={`
        inline-block
        mx-5
        cursor-pointer
        ${classes}
      `}
    >
  		<input
        type={'checkbox'}
        required={required}
        className="
          mr-2
          my-2
          inline-block
        "
      />
      {children}
    </label>
  );
}

export default FormCheckbox;
