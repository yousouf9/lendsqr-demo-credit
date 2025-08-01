import { Router, Request } from "express";
import { container } from "tsyringe";
import { body } from "express-validator";

import { AuthController } from "../../controllers/auth.controller";
import { validateRequest } from "../../middlewares/validate-request";
import { validAllowedFields } from "../../middlewares/validate-fields";

const router = Router();

// Resolve authController from container
const authController: AuthController = container.resolve(AuthController);

/**
 * @route authentication
 */
router.post(
  "/login",
  validAllowedFields(["email", "password"]),
  [
    body("email")
      .isEmail()
      .withMessage({
        message: "Invalid email format",
      })
      .isLength({ min: 3, max: 100 })
      .withMessage({
        message: "Email length must be between 3 and 100 characters",
      }),
    body("password")
      .isString()
      .withMessage({
        message: "password must be a string",
      })
      .isLength({ min: 6, max: 50 })
      .withMessage({
        message: "Password length must be between 6 and 50 characters",
      })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)
      .withMessage({
        message:
          "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
      }),
  ],
  validateRequest,
  authController.login
);

router.post(
  "/register",
  validAllowedFields([
    "email",
    "password",
    "phoneNumber",
    "firstName",
    "lastName",
    "middleName",
    "confirmPassword",
  ]),
  [
    body("email")
      .isEmail()
      .withMessage({
        message: "Invalid email format",
      })
      .isLength({ min: 3, max: 100 })
      .withMessage({
        message: "Email length must be between 3 and 100 characters",
      }),
    body("phoneNumber")
      .isString()
      .trim()
      .isMobilePhone("en-NG")
      .withMessage({
        message: "Invalid Nigerian phone number",
      })
      .custom((value: string) => {
        const regex = /^\+234[789][01]\d{8}$/;
        if (!regex.test(value)) {
          return false;
        }
        return true;
      })
      .withMessage({
        message: "Phone number must be in the format +234XXXXXXXXXX",
      }),

    body("firstName")
      .isString()
      .withMessage({
        message: "firstName must be a string",
      })
      .isLength({ min: 3, max: 50 })
      .withMessage({
        message: "First name length must be between 3 and 50 characters",
      }),

    body("lastName")
      .isString()
      .withMessage({
        message: "lastName must be a string",
      })
      .isLength({ min: 3, max: 50 })
      .withMessage({
        message: "lastName length must be between 3 and 50 characters",
      }),
    body("middleName")
      .optional()
      .isString()
      .withMessage({
        message: "middleName must be a string",
      })
      .isLength({ min: 1, max: 50 })
      .withMessage({
        message: "middleName length must be between 3 and 50 characters",
      }),
    body("password")
      .isString()
      .withMessage({
        message: "password must be a string",
      })
      .isLength({ min: 6, max: 50 })
      .withMessage({
        message: "Password length must be between 6 and 50 characters",
      })
      .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)
      .withMessage({
        message:
          "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
      }),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return false;
        }
        return true;
      })
      .withMessage({
        message: "Password confirmation does not match password",
      }),
  ],
  validateRequest,
  authController.register
);

export default router;
