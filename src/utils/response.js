export const successResponse = (
 res,
 message = "Success",
 data = {},
 status = 200
) => {

 return res.status(status).json({
  success: true,
  message,
  data
 });

};


export const errorResponse = (
 res,
 message = "Server error",
 status = 500,
 errors = null
) => {

 return res.status(status).json({
  success: false,
  message,
  errors
 });

};