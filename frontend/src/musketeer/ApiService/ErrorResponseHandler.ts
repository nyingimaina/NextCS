import ApiService from "./ApiService";
import IErrorResponse from "./IErrorResponse";

export default class ErrorResponseHandler {
  public static getResponseOrThrowError<T>(
    combined: T | undefined | IErrorResponse
  ): T | undefined {
    const splitResponse = this.getSplitResponses<T>(combined);
    if (!splitResponse) {
      return undefined;
    } else if (splitResponse.errorMessage) {
      throw new Error(splitResponse.errorMessage);
    } else {
      return splitResponse.response;
    }
  }

  public static getSplitResponses<T>(
    combined: T | undefined | IErrorResponse
  ): { response: T; errorMessage: string } | undefined {
    if (!combined) {
      return undefined;
    }
    if (ApiService.isErrorResponse(combined)) {
      return {
        errorMessage: ApiService.getAsErrorResponse(combined).message,
      } as { response: T; errorMessage: string };
    } else {
      return {
        response: combined as T,
        errorMessage: "",
      };
    }
  }
}
