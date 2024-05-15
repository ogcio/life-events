import * as jose from "jose";

type GovIdJwtPayload = {
  surname: string;
  givenName: string;
  email: string;
};

export default (token: string) => {
  const decoded = jose.decodeJwt<jose.JWTPayload & GovIdJwtPayload>(token);
  return {
    firstName: decoded.givenName,
    lastName: decoded.surname,
    email: decoded.email,
  };
};
