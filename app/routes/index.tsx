import { Button } from "@mui/material";
import React from "react";
import { Form, LoaderFunction } from "remix";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  return null;
};

const Index = () => {
  return (
    <Form method="post" action="/logout">
      <Button type="submit" variant="contained" color="primary">
        Logout
      </Button>
    </Form>
  );
};

export default Index;
