import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  MetaFunction,
  useActionData,
} from "remix";
import * as Yup from "yup";
import { db } from "~/db.server";
import { noLoginRequired, register } from "~/utils/session.server";
import { formatFieldErrors } from "~/utils/validation";

export type ActionData = {
  error?: string;
  fieldErrors?: {
    [key: string]: string;
  };
};

const registerSchema = Yup.object({
  username: Yup.string().label("Username").trim().required(),
  email: Yup.string().label("Email").required().email(),
  password: Yup.string().label("Password").trim().required().min(8),
});

export const meta: MetaFunction = () => ({
  title: "Register | Eventspace",
});

export const loader: LoaderFunction = async ({ request }) => {
  return noLoginRequired(request);
};

export const action: ActionFunction = async ({ context, params, request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const validatedValues = await registerSchema.validate(
      { username, email, password },
      { abortEarly: false }
    );

    const existingUser = await db.user.findFirst({
      where: {
        OR: {
          email: validatedValues.email,
          username: validatedValues.username,
        },
      },
    });

    if (existingUser) {
      return json(
        {
          fieldErrors: {
            email: "Another user with this email or username already exits.",
            username: "Another user with this email or username already exits.",
          },
        },
        { status: 400 }
      );
    }

    const user = await register(
      validatedValues.username,
      validatedValues.email,
      validatedValues.password
    );
    return user;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return json({ fieldErrors: formatFieldErrors(error) }, { status: 400 });
    } else {
      return json({ error: "Error validating form" }, { status: 500 });
    }
  }
};

const Register = () => {
  const formData = useActionData<ActionData>();

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, pb: 8, mt: 8 }}>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          Register
        </Typography>
        {formData?.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formData?.error}
          </Alert>
        )}
        <Box sx={{ mt: 2, px: 12 }}>
          <Form method="post" action="/register">
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
                type="email"
                name="email"
                label="Email"
                error={!!formData?.fieldErrors?.email}
                helperText={formData?.fieldErrors?.email}
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
              Already a member? <Link to="/login">Click here to login.</Link>
            </Typography>
            <Button
              sx={{ mt: 1 }}
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
            >
              Register
            </Button>
          </Form>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
