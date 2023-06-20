import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthState } from "~/store/authSlice";

function AppBody({ children }: {children: any}) {
  return <div className="AppBody" style={{
    paddingTop: '64px'
  }}>
    <div className="p-4">
      {children}
    </div>
  </div>
}

export default AppBody;
