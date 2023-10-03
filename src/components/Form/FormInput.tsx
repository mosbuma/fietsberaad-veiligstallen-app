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
  size,
  style
}: {
  innerRef?: React.LegacyRef<HTMLInputElement>,
  type?: string,
  required?: boolean,
  placeholder?: string,
  className?: string,
  onChange?: Function
  value?: any
  label?: string,
  size?: number
  style?: object
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
          size={size}
          style={style}
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
