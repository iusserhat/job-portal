export * from "./HttpMethod";
export * from "./RequestStatus";

// HTTP method enumeration
export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

// User types enumeration
export enum UserType {
  EMPLOYER = "employer",
  JOBSEEKER = "jobseeker",
}
