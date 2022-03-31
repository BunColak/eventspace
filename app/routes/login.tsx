import { Alert, Box, Button, TextField } from "@mui/material";
import React from "react";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useActionData,
} from "remix";
import { object, string, ValidationError } from "yup";
import {
  createUserSession,
  login,
  noLoginRequired,
} from "~/utils/session.server";
import { formatFieldErrors } from "~/utils/validation";
import { ActionData } from "./register";

const loginSchema = object({
  username: string().label("Username").required(),
  password: string().label("Password").required(),
});

export const loader: LoaderFunction = async ({ request }) => {  
  // await noLoginRequired(request);

  return null
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const validatedValues = await loginSchema.validate(
      { username, password },
      { abortEarly: false }
    );
    const user = await login(validatedValues);
    if (!user) {
      return json({ error: "Username or password wrong" }, { status: 400 });
    }
    return createUserSession(user.id, "/");
  } catch (error) {
    if (error instanceof ValidationError) {
      return json({ fieldErrors: formatFieldErrors(error) }, { status: 400 });
    }
    return json({ error: "Unknown Error" }, { status: 500 });
  }
};

const Login = () => {
  const formData = useActionData<ActionData>();

  return (
    <Form method="post" action="/login">
      {formData?.error && <Alert severity="error">{formData?.error}</Alert>}
      <Box>
        <TextField
          name="username"
          placeholder="username"
          error={!!formData?.fieldErrors?.username}
          helperText={formData?.fieldErrors?.username}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <TextField
          required
          type="password"
          name="password"
          placeholder="password"
          error={!!formData?.fieldErrors?.password}
          helperText={formData?.fieldErrors?.password}
        />
      </Box>
      <Button sx={{ mt: 4 }} type="submit">
        Login
      </Button>
    </Form>
  );
};

export default Login;
