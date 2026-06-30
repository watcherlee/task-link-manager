import { runRolloverCompensation } from "../lib/rollover";

const result = await runRolloverCompensation();
console.log("Rollover result:", result);
