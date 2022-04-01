import { Paper, Typography } from "@mui/material";
import { Event, User } from "@prisma/client";
import React from "react";

type EventOverviewProps = {
  event: Event & {
    organizer: User;
  };
};

const EventOverview: React.FC<EventOverviewProps> = ({ event }) => {
  return (
    <Paper sx={{ my: 2, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {event.title}
      </Typography>
      <Typography>{event.startDate} - {event.endDate}</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Organized by: @{event.organizer.username}
      </Typography>
      <Typography variant="body2" color={"GrayText"}>
        {event.description}
      </Typography>
    </Paper>
  );
};

export default EventOverview;
