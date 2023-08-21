// FormInput.tsx - Generic input field
import * as React from "react";

function FormInput({
  innerRef,
  type,
  required,
  placeholder,
  className,
  onChange,
  value,
  label,
}: {
  innerRef?: React.LegacyRef<HTMLInputElement>,
  type?: string,
  required?: boolean,
  placeholder?: string,
  classNAme?: string,
  onChange?: Function
  value?: any
  label?: string,
}) {
  return (
    <>
      <label>
        {label ? <div>
          <b>{label}</b>
        </div> : ''}
    		<input
          ref={innerRef} 
          type={type || 'text'}
          placeholder={placeholder}
          required={required || false}
          onChange={onChange}
          value={value}
          className={`
            px-5
            py-2
            border
            rounded-full
            my-2
            ${className}
          `}
        />
      </label>
    </>
  );
}

export default FormInput;
