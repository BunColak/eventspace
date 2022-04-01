import * as React from "react";
import {
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import { withEmotionCache } from "@emotion/react";
import { CssBaseline, unstable_useEnhancedEffect as useEnhancedEffect } from "@mui/material";
import ClientStyleContext from "./utils/ClientStyleContext";
import theme from "./theme";
import Navbar from "./components/Navbar";

interface DocumentProps {
  children: React.ReactNode;
  title?: string;
}

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap",
  },
];

export const meta: MetaFunction = () => ({
  "emotion-insertion-point": "emotion-insertion-point",
});

const Document = withEmotionCache(
  ({ children, title }: DocumentProps, emotionCache) => {
    const clientStyleData = React.useContext(ClientStyleContext);

    // Only executed on client
    useEnhancedEffect(() => {
      emotionCache.sheet.container = document.head;
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      clientStyleData.reset();
    }, []);

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="theme-color" content={theme.palette.primary.main} />
          {title ? <title>{title}</title> : null}
          <Meta />
          <Links />
        </head>
        <body>
          <CssBaseline />
          <Navbar />
          <Outlet />

          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);

export default Document;
