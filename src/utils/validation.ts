class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message); // Call the parent class (Error) constructor
    this.statusCode = statusCode;

    // Set the prototype explicitly for compatibility with built-in Error
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export const validate = (schema: any, data: any) => {
  const { error, value } = schema.validate(data);
  if (error) {
    let message = error.details[0].message.replace(/['"]/g, '');
    message = message.charAt(0).toUpperCase() + message.slice(1);

    // Use the custom ValidationError class
    const validationError = new ValidationError(message, 400);
    throw validationError;
  }
  return value;
};
