import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors";

export const validAllowedFields = (allowFields: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = Object.keys(req.params);
      const query = Object.keys(req.query);
      const body = Object.keys(req.body);
      const submittedFields = [...params, ...query, ...body];

      const newAllowedFields = [
        ...allowFields,
        // Common fields or Default fields
      ];

      const extraFields = submittedFields.filter(
        (field) => !newAllowedFields.includes(field)
      );

      if (extraFields.length > 0) {
        throw new BadRequestError(
          `Extra fields submitted: ${extraFields.join(", ")}`
        );
      }
      return next();
    } catch (error) {
      console.log();
      throw error;
    }
  };
};
