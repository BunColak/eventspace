import { json } from "remix";
import { ValidationError } from "yup";

export const handleValidationErrors = (error: unknown) => {
    if (error instanceof ValidationError) {

        console.log(formatFieldErrors(error));
        
        return json({ fieldErrors: formatFieldErrors(error) }, { status: 400 });
    }
    console.error(error);
    return json({ error: "Unknown Error" }, { status: 500 });
}

export const formatFieldErrors = (error: ValidationError) => {
    const fieldErrors: { [k: string]: string } = {};

    error.inner.forEach(
        (inner) => inner.path && (fieldErrors[inner.path] = inner.message)
    );

    return fieldErrors
}