/* eslint-disable @typescript-eslint/no-empty-function */
import httpStatus from "http-status";
import supertest from "supertest";
import app, { init } from "@/app";
import { generateValidToken, cleanDb } from "../helpers";
import faker from "@faker-js/faker";
import { createEnrollmentWithAddress, createUser, createTicket, createHotel, createRoom, rooms, createDifferentTickeType } from "../factories";
import { TicketStatus } from "@prisma/client";
import * as jwt from "jsonwebtoken";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("Should respond with status 401 if no token is given", async () => {
    const result = await server.get("/hotels");
    expect(result.status).toBe(401);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should respond with status 404 if user doesn't have a ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 402 if user doesn't have a paid ticket ", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createDifferentTickeType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 400 if the ticketType of user is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createDifferentTickeType(true, false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("Should respond with status 200 if token is valid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createDifferentTickeType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.body).toEqual([{
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      createdAt: hotel.createdAt.toISOString(),
      updatedAt: hotel.updatedAt.toISOString()
    }]);

    expect(result.status).toBe(httpStatus.OK);
  });
});

describe("GET /hotels/:hotelId", () => {
  it("Should respond with status 401 if no token is given", async () => {
    const result = await server.get("/hotels/hotelId");
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const result = await server.get("/hotels/hotelId").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const result = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should respond with status 400 if the hotel doesn't exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createDifferentTickeType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const result = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);
    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status 200 if token is valid", async () => {
    const user = await createUser();

    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createDifferentTickeType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    await createRoom(hotel.id);
    const hotelWithRooms = await rooms(hotel.id);

    const result = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(result.body).toEqual(
      expect.objectContaining({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: expect.arrayContaining([
          {
            id: hotelWithRooms[0].id,
            name: hotelWithRooms[0].name,
            capacity: hotelWithRooms[0].capacity,
            hotelId: hotelWithRooms[0].hotelId,
            createdAt: hotelWithRooms[0].createdAt.toISOString(),
            updatedAt: hotelWithRooms[0].updatedAt.toISOString(),
          }
        ])
      }));
  });
});
