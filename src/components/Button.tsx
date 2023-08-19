// @ts-nocheck

export const RadioButton = ({
  isActive,
  onClick,
  children,
  htmlBefore,
  className
}: {
  isActive?: Boolean,
  onClick?: Function,
  children: any
  htmlBefore?: any
  className?: string
}) => {
  return (
    <button
      className={`
        px-2 mb-3
        text-left rounded-md
        whitespace-nowrap text-ellipsis overflow-hidden
        font-poppinsmedium
        width-auto
        text-base
        hover:shadow
        transition-all
        bg-white
        ${className && className.indexOf('py-') > -1 ? '' : 'py-1'}
        ${
          isActive
            ? "border border-gray-700 shadow shadow-md"
            : "border border-gray-200 bg-white text-gray-700 shadow shadow-sm"
        }
        ${className}
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
  className,
  style
}: {
  onClick?: Function,
  children: any
  htmlBefore?: any,
  className?: string,
  style?: object
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
      style={Object.assign({}, {
        userSelect: "none", // disable highlighting
        backgroundColor: '#CC0000'
      }, style)}
    >
      {htmlBefore}
      {children}
    </button>
  );
}

export const IconButton = ({
  onClick,
  children,
  htmlBefore,
  className,
  iconUrl,
  style
}: {
  onClick?: Function,
  children: any
  htmlBefore?: any,
  className?: string
  iconUrl?: string
  style?: any
}) => {
  return (
    <button
      className={`
        text-left rounded-full
        whitespace-nowrap text-ellipsis overflow-hidden
        font-poppinsmedium
        width-auto
        text-base
        hover:shadow
        transition-all
        text-white
        bg-center
        bg-no-repeat
        w-10
        h-10
        shadow-md
        ${className}
      `}
      onClick={() => {
        if(onClick) onClick()
      }}
      style={Object.assign({}, {
        userSelect: "none", // disable highlighting
        backgroundColor: '#FFFFFF',
        backgroundImage: `url('${iconUrl}')`,
        backgroundSize: '20px'
      }, style)}
    >
      {htmlBefore}
      {children}
    </button>
  );
}
