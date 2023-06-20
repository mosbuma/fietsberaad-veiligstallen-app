import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthState } from "~/store/authSlice";
// import { AppState } from "~/store/Store";

const PrimaryMenuItem = (props: any) => {
  return <div className="
    PrimaryMenuItem
    px-5
  ">
    <a href="#" className="flex flex-col justify-center h-full">
      {props.item}
    </a>
  </div>
}

const SecundaryMenuItem = (props: any) => {
  return <div className="
    SecundaryMenuItem
    px-2
  ">
    <a href="#" className="flex flex-col justify-center h-full">
      {props.item}
    </a>
  </div>
}

function AppHeader() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: AppState) => state.auth.authState
  );

  const handleLoginClick = () => {
    const authState = isAuthenticated ? false : true;
    dispatch(setAuthState(authState));
  };

  const primaryMenuItems = [
    'ICN',
    'Koop abonnement',
    'Over Utrecht Fietst!',
    'Buurtstallingen',
    'Fietstrommels'
  ];

  const secundaryMenuItems = [
    'FAQ',
    'Tips',
    'Contact'
  ];

  return (
    <div
      className="
        t-0
        fixed z-10
        flex
        w-full
        justify-between
        px-5
        py-3
        bg-white

        overflow-hidden
      "
      style={{height: '64px'}}
    >
      <img
        src="https://huisstijl.utrecht.nl/typo3conf/ext/alternet_sitepackage/Resources/Public/Images/svg/wapen-utrecht-rood.svg"
        className="mr-2 h-10"
        alt="logo Gemeente Utrecht"
      />
      <div className="flex-1 flex flex-start">
        {primaryMenuItems.map(x => <PrimaryMenuItem key={x} item={x} />)}
      </div>
      <div className="flex flex-end">
        {secundaryMenuItems.map(x => <SecundaryMenuItem key={x} item={x} />)}
        <button
          className="
            hidden
            mx-2
            h-10
            rounded-md
            bg-blue-500
            px-4
            font-bold
            text-white
            shadow-lg
            hover:bg-blue-700
          "
          onClick={handleLoginClick}
        >
          {isAuthenticated ? "Logout" : "Login"}
        </button>
      </div>
    </div>
  );
}

export default AppHeader;
