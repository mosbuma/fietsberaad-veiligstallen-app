export const RadioButton = ({
  isActive,
  onClick,
  children,
  htmlBefore
}: {
  isActive?: Boolean,
  onClick?: Function,
  children: any
  htmlBefore?: any
}) => {
  return (
    <button
      className={`
        py-1 px-2 mb-3
        text-left rounded-md
        whitespace-nowrap text-ellipsis overflow-hidden
        font-poppinsmedium
        width-auto
        text-base
        hover:shadow
        transition-all
        ${
          isActive
            ? "border border-gray-700 shadow shadow-md"
            : "border border-gray-200 bg-white text-gray-700 shadow shadow-sm"
        }
      `}
      onClick={() => {
        if(onClick) onClick()
      }}
      style={{ userSelect: "none" }} // disable highlighting
    >
      {htmlBefore}
      {children}
    </button>
  );
}

export const Button = ({
  onClick,
  children,
  htmlBefore,
  className
}: {
  onClick?: Function,
  children: any
  htmlBefore?: any,
  className?: string
}) => {
  return (
    <button
      className={`
        py-1 px-4 mb-3
        text-left rounded-full
        whitespace-nowrap text-ellipsis overflow-hidden
        font-poppinsmedium
        width-auto
        text-base
        hover:shadow
        transition-all
        text-white
        ${className}
      `}
      onClick={() => {
        if(onClick) onClick()
      }}
      style={{
        userSelect: "none", // disable highlighting
        backgroundColor: '#CC0000'
      }}
    >
      {htmlBefore}
      {children}
    </button>
  );
}