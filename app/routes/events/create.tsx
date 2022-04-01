import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Paper,
  TextField,
} from "@mui/material";
import React from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  MetaFunction,
  redirect,
  useActionData,
} from "remix";
import * as Yup from "yup";
import { db } from "~/db.server";
import { requireUserId } from "~/utils/session.server";
import { FormActionData } from "~/utils/types";
import { handleValidationErrors } from "~/utils/validation";

const createEventSchema = Yup.object({
  title: Yup.string().label("Title").trim().required(),
  description: Yup.string().label("Description").required(),
  startDate: Yup.date().label("Start Date").required(),
  endDate: Yup.date().label('End Date').when("fullDay", {
    is: true,
    then: (schema) => schema.required(),
  }).when('startDate', (startDate: Date, schema: Yup.DateSchema) => schema.min(startDate, "End Date is earlier than start date.")),
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

export const meta: MetaFunction = () => ({
  title: "Create Event",
});

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

  return null;
};

const Index = () => {
  const formData = useActionData<FormActionData>();
  const [checked, setChecked] = React.useState(true);

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 2, mt: 8 }}>
        <Form method="post" action="/events/create">
          <Box>
            <TextField
              fullWidth
              required
              label="Title"
              name="title"
              error={!!formData?.fieldErrors?.title}
              helperText={formData?.fieldErrors?.title}
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
              defaultValue={new Date()}
              error={!!formData?.fieldErrors?.startDate}
              helperText={formData?.fieldErrors?.startDate}
            />
            <TextField
              required
              sx={{ ml: 2 }}
              label="End Date"
              type={checked ? "date" : "datetime-local"}
              name="endDate"
              defaultValue={new Date()}
              error={!!formData?.fieldErrors?.endDate}
              helperText={formData?.fieldErrors?.endDate}
            />
          </Box>
          <Button variant="contained" type="submit" sx={{ mt: 2 }}>
            Create Event
          </Button>
        </Form>
      </Paper>
    </Container>
  );
};

export default Index;
