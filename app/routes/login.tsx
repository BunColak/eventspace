import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import React from "react";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  MetaFunction,
  useActionData
} from "remix";
import { object, string } from "yup";
import {
  createUserSession,
  login,
  noLoginRequired
} from "~/utils/session.server";
import { handleValidationErrors } from "~/utils/validation";
import { ActionData } from "./register";

const loginSchema = object({
  username: string().label("Username").required(),
  password: string().label("Password").required(),
});

export const meta: MetaFunction = () => ({
  title: "Login | Eventspace",
});

export const loader: LoaderFunction = async ({ request }) => {
  await noLoginRequired(request);

  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  const response = loginSchema
    .validate({ username, password }, { abortEarly: false })
    .then(async (validatedValues) => {
      const user = await login(validatedValues);
      if (!user) {
        return json({ error: "Username or password wrong" }, { status: 400 });
      }
      return createUserSession(user.id, "/");
    })
    .catch(handleValidationErrors);

  return response;
};

const Login = () => {
  const formData = useActionData<ActionData>();

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, pb: 8, mt: 8 }}>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          Login
        </Typography>
        {formData?.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formData?.error}
          </Alert>
        )}
        <Box sx={{ mt: 2, px: 12 }}>
          <Form method="post" action="/login">
            <Box>
              <TextField
                fullWidth
                name="username"
                label="Username"
                error={!!formData?.fieldErrors?.username}
                helperText={formData?.fieldErrors?.username}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                required
                type="password"
                name="password"
                label="Password"
                error={!!formData?.fieldErrors?.password}
                helperText={formData?.fieldErrors?.password}
              />
            </Box>
            <Typography variant="caption">
              Not a member? <Link to="/register">Click here to register.</Link>
            </Typography>
            <Button
              sx={{ mt: 1 }}
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
            >
              Login
            </Button>
          </Form>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
