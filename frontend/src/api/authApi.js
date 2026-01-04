import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getProfile = () => axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);

const loginUser = (payload) =>
  axiosInstance.post(API_PATHS.AUTH.LOGIN, payload);

const registerUser = (payload) =>
  axiosInstance.post(API_PATHS.AUTH.REGISTER, payload);

const logoutUser = () => axiosInstance.post(API_PATHS.AUTH.LOGOUT);

const updateProfile = (payload) =>
  axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, payload);

export { getProfile, loginUser, registerUser, logoutUser, updateProfile };
