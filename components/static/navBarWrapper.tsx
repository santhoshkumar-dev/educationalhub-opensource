// @ts-nocheck
import NavBar from "./navBar";
import { currentUser } from "@clerk/nextjs/server";

export default async function NavBarWrapper() {
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    user = null; // Handle the case where the user is not found
  }
  return (
    <NavBar
      userFirstName={user?.firstName}
      userLastName={user?.lastName}
      userLogo={user?.imageUrl}
    />
  );
}
