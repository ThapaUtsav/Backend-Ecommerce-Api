import { z } from "zod";
import { Request, Response, NextFunction } from "express";

//generic implementation for datatype didnt work as intended through function
// function validateBody<T>(schema: ZodSchema<T>) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const result = schema.safeParse(req.body);
//     if (!result.success) {
//       return res.status(400).json({
//         message: "Validation Error caused",
//         errors: result.error.issues.map((err) => ({
//           path: err.path,
//           message: err.message,
//         })),
//       });
//     }
//     req.body = result.data;
//     next();
//   };
// }
// export default validateBody;

export const validateBody = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.issues.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }

    next();
  };
};
