import { ValidationError } from "yup";

export const formatFieldErrors = (error: ValidationError) => {
    const fieldErrors: { [k: string]: string } = {};

    error.inner.forEach(
        (inner) => inner.path && (fieldErrors[inner.path] = inner.message)
    );

    return fieldErrors
}