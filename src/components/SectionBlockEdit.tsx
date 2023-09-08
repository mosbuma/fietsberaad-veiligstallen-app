const  SectionBlockEdit = ({
  children,
  contentClasses,
}: {
  children: any;
  contentClasses?: string;
}) => {
  return (
    <div className="flex flex-wrap justify-between xl:flex-nowrap w-full">
      <div
        className={`
        ml-4
        mt-4
        w-full
        text-sm

        xl:ml-0

        xl:mt-0
        xl:w-auto

        xl:flex-1
        xl:text-base
        ${contentClasses ? contentClasses : ""}
      `}
      >
        {children}
      </div>
    </div>
  );
};

export default SectionBlockEdit;