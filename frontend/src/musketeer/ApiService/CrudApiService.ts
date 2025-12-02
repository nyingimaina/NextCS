import ApiServiceBase from "./ApiServiceBase";
import ApiService from "./ApiService";
import IValidationResponse from "./ValidationResponse/Data/IValidationResponse";
import UuidProvider from "./UuidProvider";

export default abstract class CrudApiService<
  T extends object
> extends ApiServiceBase {
  public async upsertAsync(model: T): Promise<T | string> {
    if (Reflect.ownKeys(model).includes("id") === false) {
      Reflect.set(model, "id", UuidProvider.defaultGuidV4);
    }
    const savedResponse = await this.postAsync<IValidationResponse<string>>({
      endpoint: "upsert",
      body: model,
    });
    if (savedResponse === null || savedResponse === undefined) {
      return "Failed to save";
    }
    const errorResponse = ApiService.tryGetAsErrorResponse(savedResponse);
    if (errorResponse) {
      return errorResponse.message;
    } else {
      const validationResponse = savedResponse as IValidationResponse<string>;

      if (Reflect.ownKeys(model).includes("id")) {
        Reflect.set(model, "id", validationResponse.entity!);
      }
      return model;
    }
  }

  public async upsertOrThrowAsync(model: T): Promise<boolean> {
    const saveResponse = await this.upsertAsync(model);
    if (saveResponse === typeof "string") {
      throw new Error("Could not save. Error: " + saveResponse);
    } else {
      return true;
    }
  }

  public async getByIdAsync(args: { id: string }): Promise<T> {
    const result = await this.getOrThrowAsync<T>({
      endpoint: "get-by-id",
      queryParams: {
        id: args.id,
      },
    });
    return result;
  }

  public async searchAsync(args: { searchText: string }): Promise<T[]> {
    const result = await this.getOrThrowAsync<T[]>({
      endpoint: "search",
      queryParams: {
        searchText: args.searchText,
      },
    });
    return result;
  }

  public async getPage(args?: {
    page?: number;
    pageSize?: number;
  }): Promise<T[] | string> {
    const result = await this.getAsync<T[]>({
      endpoint: "get-page",
      paging: {
        page: args?.page ?? 1,
        pageSize: args?.pageSize ?? 10000,
      },
    });
    if (!result) {
      return `Unable to get page from route ${this.route}`;
    }
    const errorResponse = ApiService.tryGetAsErrorResponse(result);
    if (errorResponse) {
      return errorResponse.message;
    }
    return result as T[];
  }
}
