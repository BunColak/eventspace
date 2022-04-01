import { Container, Box } from "@mui/material";
import { Event, User } from "@prisma/client";
import React from "react";
import { LoaderFunction, useLoaderData } from "remix";
import EventOverview from "~/components/EventOverview";
import { db } from "~/db.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = {
  events: (Event & {
    organizer: User;
  })[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const myEvents = await db.event.findMany({
    where: { organizerId: userId },
    include: { organizer: true },
  });

  return {
    events: myEvents,
  };
};

const Index = () => {
  const data = useLoaderData<LoaderData>();

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        {data.events.map((event) => (
          <EventOverview key={event.id} event={event} />
        ))}
      </Box>
    </Container>
  );
};

export default Index;
