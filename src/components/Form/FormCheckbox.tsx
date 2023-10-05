// FormCheckbox.tsx - Generic checkbox component
import * as React from "react";

function FormCheckbox({
  required,
  classes,
  checked,
  children,
  onChange
}: {
  required?: boolean,
  classes?: string,
  checked?: boolean,
  children?: any,
  onChange?: React.ChangeEventHandler<HTMLInputElement>
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
        checked={checked}
        className="
          mr-2
          my-2
          inline-block
        "
        onChange={(e) => (onChange ? onChange(e) : () => {} )}
      />
      {children}
    </label>
  );
}

export default FormCheckbox;
