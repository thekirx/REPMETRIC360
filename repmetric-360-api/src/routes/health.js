import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ ok: true, service: "repmetric-360-api" });
});

export default router;
