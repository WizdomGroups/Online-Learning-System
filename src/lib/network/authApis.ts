import axios, { AxiosResponse } from "axios";

import { FORGOT_PASSWORD_URL, LOGIN_URL, OTP_VERIFICATION_URL, RESET_OLDPASS_URL } from "../endPoints";

export const LoginApiApiFunction = async (
  data: any
): Promise<AxiosResponse> => {
  const response = await axios.post(LOGIN_URL, data);
  return response;
};

export const ForgotPasswordApiFunction = async (
  data: any
): Promise<AxiosResponse> => {
  const response = await axios.post(FORGOT_PASSWORD_URL, data);
  return response;
}

export const OtpVerificationApiFunction = async (
  data: any
): Promise<AxiosResponse> => {
  const response = await axios.post(OTP_VERIFICATION_URL, data);
  return response;
};

export const ResetPasswordApiFunction = async (
  data: any
): Promise<AxiosResponse> => {
  const response = await axios.post(OTP_VERIFICATION_URL, data);
  return response;
};

export const ResetOLDPasswordApiFunction = async (
  data: any
): Promise<AxiosResponse> => {
  const token = sessionStorage.getItem("token") ? JSON.parse(sessionStorage.getItem("token")!) : null;
  const response = await axios.post(
    RESET_OLDPASS_URL,
    data,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  );
  return response;
};