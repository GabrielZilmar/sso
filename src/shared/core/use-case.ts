export interface UseCase<Params, Result> {
  execute(params: Params): Promise<Result> | Result;
}
