export namespace Http {
  export enum Methods {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
  }

  export enum Status {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    REDIRECT = 301,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500,
  }
}
