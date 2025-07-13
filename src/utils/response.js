

 const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  };
  
  const sendError = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  };
  
  const sendCreated = (res, data, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, 201);
  };
  
  const sendNotFound = (res, message = 'Resource not found') => {
    return sendError(res, message, 404);
  };
  
  const sendBadRequest = (res, message = 'Bad request', errors = null) => {
    return sendError(res, message, 400, errors);
  };
  
  const sendUnauthorized = (res, message = 'Unauthorized') => {
    return sendError(res, message, 401);
  };
  
  const sendForbidden = (res, message = 'Forbidden') => {
    return sendError(res, message, 403);
  };
  
  const sendValidationError = (res, errors) => {
    return sendError(res, 'Validation failed', 400, errors);
  };
  
  const sendPaginated = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  };
  
  module.exports = {
    sendSuccess,
    sendError,
    sendCreated,
    sendNotFound,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendValidationError,
    sendPaginated,
  };