import { body } from "express-validator";
//register validation
export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required"),


  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];
//login validation
export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required"),
    //removed normalizeEmail() here too

  body("password")
    .notEmpty()
    .withMessage("Password is required")
];

