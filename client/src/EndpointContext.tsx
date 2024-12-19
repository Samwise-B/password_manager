import { createContext } from "react";

export interface IEndpointContext {
  apiHost: string,
  getList: string,
  addPass: string,
  updatePass: string,
  deletePass: string,
  loginChallenge: string,
  verifyChallenge: string,
  register: string,
  logout: string,
}
  
export const EndpointContext = createContext<IEndpointContext>({
    apiHost: import.meta.env.VITE_API_HOST,
    getList: import.meta.env.VITE_API_GET_LIST,
    addPass: import.meta.env.VITE_API_ADD_PASS,
    updatePass: import.meta.env.VITE_API_UPDATE_PASS,
    deletePass: import.meta.env.VITE_API_DELETE_PASS,
    loginChallenge: import.meta.env.VITE_API_LOGIN_CHALLENGE,
    verifyChallenge: import.meta.env.VITE_API_LOGIN_VERIFY,
    register: import.meta.env.VITE_API_REGISTER,
    logout: import.meta.env.VITE_API_LOGOUT
});