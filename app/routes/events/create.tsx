import { Button, Checkbox, TextField } from "@mui/material";
import React from "react";
import {
    ActionFunction,
    Form,
    LoaderFunction,
    redirect,
    useActionData
} from "remix";
import * as Yup from "yup";
import { db } from "~/db.server";
import { requireUserId } from "~/utils/session.server";
import { handleValidationErrors } from "~/utils/validation";

const createEventSchema = Yup.object({
  title: Yup.string().label("Title").trim().required(),
  description: Yup.string().label("Description").required(),
  startDate: Yup.date().required(),
  endDate: Yup.date(),
  fullDay: Yup.boolean(),
});

const createEvent = async (
  values: typeof createEventSchema.__outputType,
  userId: number
) => {
  await db.event.create({
    data: { ...values, organizerId: userId },
  });

  return redirect("/");
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const description = formData.get("description");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const fullDay = Boolean(formData.get("fullDay"));

  const values = { title, description, startDate, endDate, fullDay };
  const response = await createEventSchema
    .validate(values, { abortEarly: false })
    .then((validatedValues) => createEvent(validatedValues, userId))
    .catch(handleValidationErrors);

  return response;
};

export const loader: LoaderFunction = async ({ request }) => {
    requireUserId(request);

    return null
};

const Index = () => {
  const data = useActionData();
  console.log({ data });

  return (
    <Form method="post" action="/events/create">
      <TextField label="Title" name="title" />
      <TextField label="Description" name="description" multiline />
      <TextField type="date" name="startDate" />
      <TextField type="date" name="endDate" />
      <Checkbox name="fullDay" defaultChecked />
      <Button type="submit">Create Event</Button>
    </Form>
  );
};

export default Index;
