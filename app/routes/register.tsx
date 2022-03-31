import { Box, Button, TextField } from "@mui/material";
import React from "react";
import { ActionFunction, Form, json, LoaderFunction, useActionData } from "remix";
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

export const loader: LoaderFunction = async ({request}) => {
  return noLoginRequired(request)
}

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
  console.log({ formData });

  return (
    <div>
      <Form method="post" action="/register">
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
            type="email"
            name="email"
            placeholder="email"
            error={!!formData?.fieldErrors?.email}
            helperText={formData?.fieldErrors?.email}
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
          Register
        </Button>
      </Form>
    </div>
  );
};

export default Register;
