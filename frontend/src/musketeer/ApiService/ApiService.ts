import IErrorResponse from "./IErrorResponse";
import IUploadedFileResult from "./IUploadedFileResult";
import { v4 as uuidv4 } from "uuid";
import IValidationError from "./ValidationResponse/Data/IValidationError";
import IValidationResponse from "./ValidationResponse/Data/IValidationResponse";

export default class ApiService {
  public static isErrorResponse(data: object | undefined): boolean {
    if (data && typeof data === "object" && "isError" in data && data.isError) {
      return true;
    } else {
      return false;
    }
  }

  public static isValidationError(data: object | undefined): boolean {
    try {
      if (
        data &&
        typeof data === "object" &&
        "validationErrors" in data &&
        (data.validationErrors as IValidationError[]).length > 0
      ) {
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }

  public static tryGetAsErrorResponse(
    data: object
  ): IErrorResponse | undefined {
    if (this.isErrorResponse(data)) {
      return this.getAsErrorResponse(data);
    } else if (this.isValidationError(data)) {
      return this.getAsErrorResponse({
        message: (data as IValidationResponse<object>).validationErrors[0]
          .errors[0],
        isError: true,
      } as IErrorResponse);
    }
  }

  public static getAsErrorResponse(data: object): IErrorResponse {
    return data as IErrorResponse;
  }

  public get apiUrl(): string {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    } else {
      throw new Error("process.env.NEXT_PUBLIC_API_URL is not defined");
    }
  }

  private baseUrl: string = this.apiUrl;

  // Function to create fetch options with headers
  private createFetchOptions(
    method: string,
    body?: object,
    headers?: Record<string, string>
  ): RequestInit {
    // headers = this.addStandardHeaders({
    //   headers: headers,
    // });
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers, // Spread additional headers
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  public generateListQueryParam<T>(args: {
    name: string;
    values: T[];
    trimFirst?: boolean;
  }): string {
    const params = new URLSearchParams();

    args.values.forEach((item) => {
      params.append(args.name, `${item}`);
    });

    const asString = params.toString();
    if (args.trimFirst) {
      const toTrim = `&${args.name}=`;
      return asString.substring(asString.indexOf(toTrim) + toTrim.length);
    }
    return params.toString();
  }

  // Generic GET method
  public async get<T>(args: {
    endpoint: string;
    headers?: Record<string, string>;
  }): Promise<T | undefined | IErrorResponse> {
    const { endpoint, headers } = args;

    try {
      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        this.createFetchOptions("GET", undefined, headers)
      );

      return await this.getResponseAsync(response);
    } catch (error) {
      console.error("GET request error:", error);
      return undefined;
    }
  }

  private async getResponseAsync<T>(
    response: Response
  ): Promise<T | IErrorResponse> {
    const data = await response.json();
    if (!response.ok) {
      return {
        message:
          data.message || `GET request failed with status ${response.status}`,
        isError: true,
      } as IErrorResponse;
    }

    // Type guard to check if data matches the IErrorResponse structure
    if (ApiService.isErrorResponse(data)) {
      return data as IErrorResponse;
    }

    // If data is valid, return it as T
    return data as T;
  }

  // Generic POST method
  public async post<U>(args: {
    endpoint: string;
    body: object;
    headers?: Record<string, string>;
  }): Promise<U | undefined | IErrorResponse> {
    const { endpoint, body, headers } = args;

    try {
      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        this.createFetchOptions("POST", body, headers)
      );

      return await this.getResponseAsync(response);
    } catch (error) {
      console.error("POST request error:", error);
      return undefined;
    }
  }

  // private addStandardHeaders(args: {
  //   headers?: Record<string, string>;
  // }): Record<string, string> {
  //   args.headers = args.headers || {};

  //   const authenticatedUser =
  //     AuthenticatedUserTracker.authenticatedUser ??
  //     ({
  //       email: "",
  //       companyId: "",
  //     } as IAuthenticationResponse);
  //   const standardHeaders: Record<string, string> = {
  //     "x-user-email": authenticatedUser.email,
  //     "x-company-id": authenticatedUser.companyId,
  //     "x-user-id": authenticatedUser.userId,
  //   };

  //   for (const [key, value] of Object.entries(standardHeaders)) {
  //     if (!(key in args.headers)) {
  //       args.headers[key] = value;
  //     }
  //   }

  //   return args.headers;
  // }

  private listenForFileUploadInformation(args: {
    endpoint: string;
    uploadId: string;
    onData: (data: string) => void;
  }) {
    const url = `${this.baseUrl}upload/${args.endpoint}?uploadId=${args.uploadId}`;
    const evtSource = new EventSource(url);
    const terminationMessage = "---terminate---";
    evtSource.onmessage = (event: MessageEvent) => {
      if (event.data === terminationMessage) {
        evtSource.close();
        return;
      }
      args.onData(event.data);
    };
  }

  // Method to upload files with progress tracking
  uploadFile({
    endpoint,
    file,
    onProgress,
    headers = {},
    onData,
    datatype,
  }: {
    endpoint: string;
    file: File;
    onProgress: (progress: number) => void;
    onData: (data: string) => void;
    headers?: Record<string, string>;
    datatype: "customers";
  }): Promise<IUploadedFileResult> {
    // headers = this.addStandardHeaders({
    //   headers: headers,
    // });
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      const uploadId = uuidv4();
      this.listenForFileUploadInformation({
        endpoint: "listen",
        uploadId,
        onData,
      });
      formData.append("formFile", file);
      formData.append("uploadId", uploadId);
      formData.append("datatype", datatype);

      xhr.open("POST", `${this.baseUrl}${endpoint}`, true);

      // Set headers if provided
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      };

      // Handle the response
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText) as {
              value: IUploadedFileResult;
            };
            console.log("File uploaded successfully:", result);
            resolve(result.value); // Resolve with result for flexibility
          } catch (error) {
            reject(
              new Error("Failed to parse the server response." + ` ${error}`)
            );
          }
        } else {
          reject(
            new Error(
              `File upload failed with status ${xhr.status}: ${xhr.statusText}`
            )
          );
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        reject(new Error("A network error occurred during the file upload."));
      };

      // Send the request
      xhr.send(formData);
    });
  }

  // Method to download files as a Blob
  async downloadFile({
    endpoint,
    headers,
  }: {
    endpoint: string;
    headers?: Record<string, string>;
  }): Promise<Blob | undefined> {
    try {
      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        this.createFetchOptions("GET", undefined, headers)
      );

      if (!response.ok) {
        throw new Error(
          `Download request failed with status ${response.status}`
        );
      }

      const blob = await response.blob(); // Get the response as a Blob
      return blob; // Return the Blob
    } catch (error) {
      console.error("Download request error:", error);
      return undefined;
    }
  }

  // Method to write a Blob to disk
  downloadBlobToDisk(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob); // Create a URL for the Blob
    const a = document.createElement("a"); // Create an anchor element
    a.href = url; // Set the href to the Blob URL
    a.download = filename; // Set the desired file name
    document.body.appendChild(a); // Append the anchor to the document body
    a.click(); // Programmatically click the anchor to trigger the download
    document.body.removeChild(a); // Remove the anchor from the document
    URL.revokeObjectURL(url); // Revoke the Blob URL to free memory
  }
}
