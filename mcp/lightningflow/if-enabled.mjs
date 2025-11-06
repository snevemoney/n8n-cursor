#!/usr/bin/env node
import { spawn } from "node:child_process";

const ok = (process.env.ENABLED || "").match(/^(1|true|yes)$/i);
if (!ok) process.exit(0);

const target = process.argv[2];
if (!target) process.exit(1);

spawn("node", [target], { stdio: "inherit", env: process.env }).on("exit", c => process.exit(c ?? 0));
