import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Event } from "@prisma/client";
import { formatISO } from "date-fns";
import React from "react";
import * as Yup from "yup";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useCatch,
  useLoaderData,
} from "remix";
import { db } from "~/db.server";
import { requireUserId } from "~/utils/session.server";
import { FormActionData } from "~/utils/types";
import { handleValidationErrors } from "~/utils/validation";

type LoaderData = {
  event: Event;
};

const updateEventSchema = Yup.object({
  title: Yup.string().label("Title").trim(),
  description: Yup.string().label("Description"),
  startDate: Yup.date().label("Start Date"),
  endDate: Yup.date()
    .label("End Date")
    .when("startDate", (startDate: Date, schema: Yup.DateSchema) =>
      schema.min(startDate, "End Date is earlier than start date.")
    ),
  fullDay: Yup.boolean(),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const eventId = Number(params.id);

  if (Number.isNaN(eventId)) {
    throw json(`No event found with ID=${params.id}`, { status: 404 });
  }

  const event = await db.event.findFirst({ where: { id: eventId } });

  if (event?.organizerId !== userId) {
    throw json("You cannot edit this event since you are not the organizer.");
  }

  return { event };
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);
  const eventId = Number(params.id);

  if (Number.isNaN(eventId)) {
    throw json(`No event found with ID=${params.id}`, { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const fullDay = Boolean(formData.get("fullDay"));

  const response = await updateEventSchema
    .validate({
      title,
      description,
      startDate,
      endDate,
      fullDay,
    }, {abortEarly: false})
    .then(async (validatedValues) => {
      await db.event.update({
        where: { id: eventId },
        data: { ...validatedValues },
      });

      return redirect('/');
    })
    .catch(handleValidationErrors);

  return response;
};

const EventEdit = () => {
  const formData = useActionData<FormActionData>();
  const { event } = useLoaderData<LoaderData>();
  const [checked, setChecked] = React.useState(event.fullDay);

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 2 }}>
        <Form method="post" action={`/events/edit/${event.id}`}>
          <Box>
            <TextField
              fullWidth
              required
              label="Title"
              name="title"
              error={!!formData?.fieldErrors?.title}
              helperText={formData?.fieldErrors?.title}
              defaultValue={event.title}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              required
              label="Description"
              name="description"
              multiline
              minRows={5}
              defaultValue={event.description}
              error={!!formData?.fieldErrors?.description}
              helperText={formData?.fieldErrors?.description}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(e) => setChecked((r) => !r)}
                    name="fullDay"
                  />
                }
                label="Full Day"
              />
            </FormGroup>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              required
              label="Start Date"
              type={checked ? "date" : "datetime-local"}
              name="startDate"
              defaultValue={formatISO(new Date(event.startDate), {
                representation: "date",
              })}
              error={!!formData?.fieldErrors?.startDate}
              helperText={formData?.fieldErrors?.startDate}
            />
            <TextField
              required
              sx={{ ml: 2 }}
              label="End Date"
              type={checked ? "date" : "datetime-local"}
              name="endDate"
              defaultValue={formatISO(new Date(event.endDate || ""), {
                representation: "date",
              })}
              error={!!formData?.fieldErrors?.endDate}
              helperText={formData?.fieldErrors?.endDate}
            />
          </Box>
          <Button variant="contained" type="submit" sx={{ mt: 2 }}>
            Edit Event
          </Button>
        </Form>
      </Paper>
    </Container>
  );
};

export function CatchBoundary() {
  const catchValues = useCatch();
  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h5">{catchValues.data}</Typography>
    </Container>
  );
}

export default EventEdit;
