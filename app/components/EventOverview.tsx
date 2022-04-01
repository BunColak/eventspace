import { Edit } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { Event, User } from "@prisma/client";
import { format } from "date-fns";
import React from "react";
import { Link } from "remix";

type EventOverviewProps = {
  event: Event & {
    organizer: User;
  };
  currentUserId: number;
};

const NORMAL_FORMAT = "dd.MM.yyyy HH:mm";
const FULL_DAY_FORMAT = "dd.MM.yyyy";

const EventOverview: React.FC<EventOverviewProps> = ({
  event,
  currentUserId,
}) => {
  return (
    <Paper sx={{ my: 2, p: 2, position: "relative" }}>
      {currentUserId === event.organizerId ? (
        <Button
          component={Link}
          to={`/events/edit/${event.id}`}
          startIcon={<Edit />}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          Edit Event
        </Button>
      ) : null}
      <Typography variant="h6" gutterBottom>
        {event.title}
      </Typography>
      <Typography>
        {format(
          new Date(event.startDate),
          event.fullDay ? FULL_DAY_FORMAT : NORMAL_FORMAT
        )}{" "}
        -{" "}
        {format(
          new Date(event.endDate || ""),
          event.fullDay ? FULL_DAY_FORMAT : NORMAL_FORMAT
        )}
      </Typography>
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
