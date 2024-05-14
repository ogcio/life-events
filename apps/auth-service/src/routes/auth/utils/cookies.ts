import { FastifyReply, FastifyRequest } from "fastify";

enum SAME_SITE_VALUES {
  STRICT = "strict",
  LAX = "lax",
  NONE = "none",
}

const isSecure = (request: FastifyRequest) => request.protocol === "https";

const setCookie = (
  request: FastifyRequest,
  reply: FastifyReply,
  key: string,
  value: string,
  appConfig: { [key: string]: string },
) => {
  const env = process.env.NODE_ENV;
  const secure = isSecure(request);
  reply.setCookie(key, value, {
    httpOnly: true,
    secure,
    path: "/",
    sameSite: secure ? SAME_SITE_VALUES.STRICT : SAME_SITE_VALUES.LAX,
    ...(env === "production" ? { domain: appConfig.HOST_DOMAIN } : {}),
  });
};

const deleteCookie = (
  request: FastifyRequest,
  reply: FastifyReply,
  key: string,
  value: string,
  appConfig: { [key: string]: string },
) => {
  const secure = isSecure(request);
  reply.cookie(key, value, {
    path: "/",
    domain: appConfig.HOST_DOMAIN,
    httpOnly: true,
    expires: new Date(Date.now() - 100),
    secure,
    sameSite: secure ? SAME_SITE_VALUES.STRICT : SAME_SITE_VALUES.LAX,
  });
};

export { setCookie, deleteCookie };
