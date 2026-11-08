import { readFile, writeFile } from "node:fs/promises";
import { faker } from "@faker-js/faker";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function writeToFile() {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      company: faker.company.name(),
      website: faker.internet.url(),
      createdAt: faker.date.past().toISOString(),
    });
  }
  await writeFile("data.json", JSON.stringify({ data }), "utf8");
}
export const GET = async (_: NextRequest) => {
  console.log("incoming...");
  const fileData = await readFile("data.json", "utf8").catch(async (err) => {
    console.error("Error reading file:", err);
    await writeToFile();
    return await readFile("data.json", "utf8");
  });

  return new NextResponse(fileData, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
