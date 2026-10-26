import { describe, it, expect } from "vitest";
import { dbUri } from "@/lib/db/client";

describe("dbUri", () => {
  it("uses 127.0.0.1 instead of localhost (Node may resolve localhost to ::1)", () => {
    expect(dbUri("mysql://u%40x:p%2Fw@localhost:3306/db_1")).toBe("mysql://u%40x:p%2Fw@127.0.0.1:3306/db_1");
  });
  it("leaves other hosts alone", () => {
    expect(dbUri("mysql://u:p@db.example:3306/d")).toBe("mysql://u:p@db.example:3306/d");
  });
});
