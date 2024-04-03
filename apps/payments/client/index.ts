import axios from "axios";
import { ProvidersApi } from "./autogenerated";

const buildAxiosInstance = (userId) => {
  const instance = axios.create({});
  instance.defaults.headers.common["x-user-id"] = userId;
  return instance;
};

export default (userId) => {
  return {
    providers: new ProvidersApi(
      undefined,
      process.env.BACKEND_URL,
      buildAxiosInstance(userId),
    ),
  };
};
