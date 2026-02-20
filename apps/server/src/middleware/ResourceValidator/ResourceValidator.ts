import { HttpRequest } from "../../interfaces/adapters/index.js";
import { ZodMiniObject } from "zod/v4-mini";
import { IMiddleware, MiddlewareResponse } from "../index.js";
import ValidationException from "../../exceptions/ValidationException.js";

type ZodIssue = {
  origin: string;
  code: string;
  path: string[];
  message: string;
};

export class ResourceValidator implements IMiddleware {
  setup =
    (provided: { schema: ZodMiniObject }) =>
    async (httpRequest: HttpRequest): Promise<MiddlewareResponse> => {
      const data = {
        body: httpRequest.body,
        params: httpRequest.params,
        query: httpRequest.query,
      };

      const result = provided.schema.safeParse(data);

      if (result.success) {
        httpRequest.body = (result.data as typeof data)["body"];
        httpRequest.params = (result.data as typeof data)["params"];
        httpRequest.query = (result.data as typeof data)["query"];
        return { isOk: true };
      }

      const issuesMessage = this._formatIssues(result.error.issues as ZodIssue[]);

      throw new ValidationException(issuesMessage);
    };

  private readonly _formatIssues = (issues: ZodIssue[]) => {
    let issuesArray = [];
    for (let i = 0; i < issues.length; i++) {
      issuesArray.push(issues[i].message);
    }
    return issuesArray.join(", ");
  };
}

const resourceValidator = new ResourceValidator();

export default resourceValidator;
