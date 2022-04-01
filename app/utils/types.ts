export type FormActionData = {
    error?: string;
    fieldErrors?: {
        [key: string]: string;
    };
};