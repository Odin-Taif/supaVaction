import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  // Retrieve the authenticated user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { listedHomes: true },
  });

  // Check if authenticated user is the owner of this home
  const { id } = req.query;
  if (!user?.listedHomes?.find((home) => home.id === id)) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  // Update home
  if (req.method === "PATCH") {
    // TODO
  }
  // HTTP method not supported!
  else {
    res.setHeader("Allow", ["PATCH"]);
    res
      .status(405)
      .json({ message: `HTTP method ${req.method} is not supported.` });
  }
}
