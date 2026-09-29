// Prints an ADMIN_PASSWORD_HASH line for .env.local.
// Usage: npm run hash-password   (asks for the password; nothing is echoed or stored)
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
// Hide what is typed.
rl._writeToOutput = (s) => rl.output.write(s.includes("Password") ? s : "");

rl.question("Password for the admin account (min 12 characters): ", async (password) => {
  rl.close();
  process.stdout.write("\n");
  if (password.length < 12) {
    console.error("Use at least 12 characters.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  // Next.js expands $VAR in .env files, so every $ in the hash must be escaped.
  console.log(`ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}`);
});
