import { getSession } from "next-auth/react";
// pages/index.js
import { prisma } from "@/lib/prisma";
// pages/api/image-upload.js
import { supabase } from "@/lib/supabase";

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
    try {
      const home = await prisma.home.update({
        where: { id },
        data: req.body,
      });
      res.status(200).json(home);
    } catch (e) {
      res.status(500).json({ message: "Something went wrong" });
    }
    // TODO
  } else if (req.method === "DELETE") {
    try {
      const home = await prisma.home.delete({
        where: { id },
      });
      if (home.image) {
        const path = home.image.split(`${process.env.SUPABASE_BUCKET}/`)?.[1];
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([path]);
      }
      res.status(200).json(home);
    } catch (e) {
      res.status(500).json({ message: "Something went wrong" });
    }
    // TODO
  }
  // HTTP method not supported!
  else {
    res.setHeader("Allow", ["PATCH", "DELETE"]);
    res
      .status(405)
      .json({ message: `HTTP method ${req.method} is not supported.` });
  }
}
