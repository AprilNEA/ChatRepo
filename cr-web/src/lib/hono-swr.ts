import useSWR, {
  mutate,
  type Key,
  type SWRConfiguration,
  type SWRResponse,
} from "swr";
import useSWRMutation, {
  type SWRMutationConfiguration,
  type SWRMutationResponse,
} from "swr/mutation";
import type {
  ClientMethod,
  ClientRequestOptions,
  InferRequestType,
  InferResponseType,
} from "hono/client";

/**
 * Utility function to generate SWR key
 */
function generateSWRKey<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  args?: InferRequestType<TMethod>
): Key {
  console.log(method.__path, args);
  return ["hc", ...method.__path, args];
}

/**
 * useHC Hook for Query requests (SWR)
 */
export function useHC<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  ...params: InferRequestType<TMethod> extends never
    ? [
        args?: InferRequestType<TMethod>,
        options?: SWRConfiguration<InferResponseType<TMethod>> &
          ClientRequestOptions
      ]
    : [
        args: InferRequestType<TMethod>,
        options?: SWRConfiguration<InferResponseType<TMethod>> &
          ClientRequestOptions
      ]
): SWRResponse<InferResponseType<TMethod>, Error> {
  const [args, options = {}] = params;

  // Separate SWR configuration and client configuration
  const {
    fetch: _fetch,
    webSocket,
    init,
    headers,
    // All SWR configuration options
    ...swrOptions
  } = options;

  const clientOptions: ClientRequestOptions = {
    fetch: _fetch,
    webSocket,
    init,
    headers,
  };

  const swrKey = generateSWRKey(method, args);

  return useSWR(
    swrKey,
    async () => {
      try {
        const response = await method(args, clientOptions);
        console.log(response);
        if (!response.ok) {
          const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          (error as any).status = response.status;
          (error as any).response = response;
          throw error;
        }

        // Automatically parse the response Content-Type
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          return await response.json();
        }
        if (contentType.includes("text/")) {
          return await response.text();
        }
        // For other types, try json, otherwise return text
        try {
          return await response.json();
        } catch {
          return await response.text();
        }
      } catch (error) {
        console.error("useHC fetch error:", error);
        throw error;
      }
    },
    swrOptions
  );
}

/**
 * useHCMutation Hook for Mutation requests (SWR Mutation)
 */
export function useHCMutation<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  options?: SWRMutationConfiguration<
    InferResponseType<TMethod>,
    Error,
    Key,
    InferRequestType<TMethod>
  > &
    ClientRequestOptions
): SWRMutationResponse<
  InferResponseType<TMethod>,
  Error,
  Key,
  InferRequestType<TMethod>
> {
  const {
    fetch: _fetch,
    webSocket,
    init,
    headers,
    ...swrOptions
  } = options || {};

  const clientOptions: ClientRequestOptions = {
    fetch: _fetch,
    webSocket,
    init,
    headers,
  };

  const swrKey = generateSWRKey(method);

  return useSWRMutation<
    InferResponseType<TMethod>,
    Error,
    Key,
    InferRequestType<TMethod>
  >(
    swrKey,
    async (_: Key, { arg }: { arg: InferRequestType<TMethod> }) => {
      try {
        const response = await method(arg, clientOptions);

        if (!response.ok) {
          const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          (error as any).status = response.status;
          (error as any).response = response;
          throw error;
        }

        // 根据响应的 Content-Type 自动解析
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          return await response.json();
        }
        if (contentType.includes("text/")) {
          return await response.text();
        }

        try {
          return await response.json();
        } catch {
          return await response.text();
        }
      } catch (error) {
        console.error("useHCMutation error:", error);
        throw error;
      }
    },
    swrOptions
  );
}

/*
 * Getting the original response object
 */
export function useHCRaw<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  ...params: InferRequestType<TMethod> extends never
    ? [
        args?: InferRequestType<TMethod>,
        options?: SWRConfiguration<InferResponseType<TMethod>> &
          ClientRequestOptions
      ]
    : [
        args: InferRequestType<TMethod>,
        options?: SWRConfiguration<InferResponseType<TMethod>> &
          ClientRequestOptions
      ]
): SWRResponse<InferResponseType<TMethod>, Error> {
  const [args, options = {}] = params;

  const { fetch: _fetch, webSocket, init, headers, ...swrOptions } = options;

  const clientOptions: ClientRequestOptions = {
    fetch: _fetch,
    webSocket,
    init,
    headers,
  };

  const swrKey = generateSWRKey(method, args);

  return useSWR(
    swrKey,
    async () => {
      return await method(args, clientOptions);
    },
    swrOptions
  );
}

/*
 * Trigger revalidation manually
 */
export function mutateHC<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  args?: InferRequestType<TMethod>
) {
  const key = generateSWRKey(method, args);
  return mutate(key);
}

/*
 * Check if the method requires arguments
 */
export type RequiresArgs<TMethod> = InferRequestType<TMethod> extends never
  ? false
  : true;

export type UseHCOptions<TMethod extends ClientMethod<any, any>> =
  SWRConfiguration<InferResponseType<TMethod>> & ClientRequestOptions;

export type UseHCMutationOptions<TMethod extends ClientMethod<any, any>> =
  SWRMutationConfiguration<
    InferResponseType<TMethod>,
    Error,
    string,
    InferRequestType<TMethod>
  > &
    ClientRequestOptions;
