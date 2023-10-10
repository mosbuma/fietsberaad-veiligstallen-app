// FormCheckbox.tsx - Generic checkbox component
import * as React from "react";

function FormCheckbox({
  required,
  classes,
  checked,
  defaultChecked,
  onChange,
  children,
}: {
  required?: boolean,
  classes?: string,
  checked?: boolean,
  defaultChecked?: boolean,
  onChange?: Function,
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
        checked={checked}
        defaultChecked={defaultChecked}
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
