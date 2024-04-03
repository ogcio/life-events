/* tslint:disable */
/* eslint-disable */
/**
 * OGCIO Payment API
 * API for OGCIO Payment Service
 *
 * The version of the OpenAPI document: 0.1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import type { Configuration } from "./configuration";
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from "axios";
import globalAxios from "axios";
// Some imports not used depending on template conditions
// @ts-ignore
import {
  DUMMY_BASE_URL,
  assertParamExists,
  setApiKeyToObject,
  setBasicAuthToObject,
  setBearerAuthToObject,
  setOAuthToObject,
  setSearchParams,
  serializeDataIfNeeded,
  toPathString,
  createRequestFunction,
} from "./common";
import type { RequestArgs } from "./base";
// @ts-ignore
import {
  BASE_PATH,
  COLLECTION_FORMATS,
  BaseAPI,
  RequiredError,
  operationServerMap,
} from "./base";

/**
 *
 * @export
 * @interface ApiV1ProvidersPost200Response
 */
export interface ApiV1ProvidersPost200Response {
  /**
   *
   * @type {string}
   * @memberof ApiV1ProvidersPost200Response
   */
  id?: string;
}
/**
 *
 * @export
 * @interface ApiV1ProvidersPostRequest
 */
export interface ApiV1ProvidersPostRequest {
  /**
   *
   * @type {string}
   * @memberof ApiV1ProvidersPostRequest
   */
  name: string;
  /**
   *
   * @type {ApiV1ProvidersPostRequestType}
   * @memberof ApiV1ProvidersPostRequest
   */
  type: ApiV1ProvidersPostRequestType;
  /**
   *
   * @type {object}
   * @memberof ApiV1ProvidersPostRequest
   */
  providerData: object;
}
/**
 *
 * @export
 * @interface ApiV1ProvidersPostRequestType
 */
export interface ApiV1ProvidersPostRequestType {}

/**
 * DefaultApi - axios parameter creator
 * @export
 */
export const DefaultApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    apiV1HealthGet: async (
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/api/v1/health`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "GET",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * DefaultApi - functional programming interface
 * @export
 */
export const DefaultApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = DefaultApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async apiV1HealthGet(
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.apiV1HealthGet(options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap["DefaultApi.apiV1HealthGet"]?.[
          localVarOperationServerIndex
        ]?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
  };
};

/**
 * DefaultApi - factory interface
 * @export
 */
export const DefaultApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = DefaultApiFp(configuration);
  return {
    /**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    apiV1HealthGet(options?: any): AxiosPromise<void> {
      return localVarFp
        .apiV1HealthGet(options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * DefaultApi - object-oriented interface
 * @export
 * @class DefaultApi
 * @extends {BaseAPI}
 */
export class DefaultApi extends BaseAPI {
  /**
   *
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public apiV1HealthGet(options?: RawAxiosRequestConfig) {
    return DefaultApiFp(this.configuration)
      .apiV1HealthGet(options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * ProvidersApi - axios parameter creator
 * @export
 */
export const ProvidersApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @param {ApiV1ProvidersPostRequest} apiV1ProvidersPostRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    apiV1ProvidersPost: async (
      apiV1ProvidersPostRequest: ApiV1ProvidersPostRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'apiV1ProvidersPostRequest' is not null or undefined
      assertParamExists(
        "apiV1ProvidersPost",
        "apiV1ProvidersPostRequest",
        apiV1ProvidersPostRequest,
      );
      const localVarPath = `/api/v1/providers/`;
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: "POST",
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarHeaderParameter["Content-Type"] = "application/json";

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        apiV1ProvidersPostRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * ProvidersApi - functional programming interface
 * @export
 */
export const ProvidersApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    ProvidersApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @param {ApiV1ProvidersPostRequest} apiV1ProvidersPostRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async apiV1ProvidersPost(
      apiV1ProvidersPostRequest: ApiV1ProvidersPostRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ApiV1ProvidersPost200Response>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.apiV1ProvidersPost(
          apiV1ProvidersPostRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap["ProvidersApi.apiV1ProvidersPost"]?.[
          localVarOperationServerIndex
        ]?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
  };
};

/**
 * ProvidersApi - factory interface
 * @export
 */
export const ProvidersApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ProvidersApiFp(configuration);
  return {
    /**
     *
     * @param {ApiV1ProvidersPostRequest} apiV1ProvidersPostRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    apiV1ProvidersPost(
      apiV1ProvidersPostRequest: ApiV1ProvidersPostRequest,
      options?: any,
    ): AxiosPromise<ApiV1ProvidersPost200Response> {
      return localVarFp
        .apiV1ProvidersPost(apiV1ProvidersPostRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ProvidersApi - object-oriented interface
 * @export
 * @class ProvidersApi
 * @extends {BaseAPI}
 */
export class ProvidersApi extends BaseAPI {
  /**
   *
   * @param {ApiV1ProvidersPostRequest} apiV1ProvidersPostRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ProvidersApi
   */
  public apiV1ProvidersPost(
    apiV1ProvidersPostRequest: ApiV1ProvidersPostRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ProvidersApiFp(this.configuration)
      .apiV1ProvidersPost(apiV1ProvidersPostRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}
