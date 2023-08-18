// FormInput.tsx - Generic input field
import * as React from "react";

function FormInput({
  innerRef,
  type,
  required,
  placeholder,
  classes,
}: {
  innerRef?: React.LegacyRef<HTMLInputElement>,
  type?: string,
  required?: boolean,
  placeholder?: string,
  classes?: string,
}) {
  return (
    <>
  		<input
        ref={innerRef} 
        type={type || 'text'}
        placeholder={placeholder}
        required={required || false}
        className={`
          px-5
          py-2
          border
          rounded-full
          my-2
          ${classes}
        `}
      />
    </>
  );
}

export default FormInput;
