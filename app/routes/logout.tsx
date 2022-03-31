import { ActionFunction, LoaderFunction, redirect } from "remix";
import { logout } from "../utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  await logout(request);

  return null;
};

export const loader: LoaderFunction = async ({ request }) => {
  return redirect("/");
};
