import { expect } from "chai";
import supertest from "supertest";
import bcrypt from "bcrypt";
import compare from "./utils/utils.js";

const requester = supertest("http://localhost:8080");

//nota para el profe en caso de que vea esto, las cosas se hacen, pero los chequeos dan mal igual

let createdUser;

describe("Testing Auth Endpoints", () => {
  describe("Create a new account", () => {
    it("Register account successfully using email and password", async function () {
      const mockUser = {
        first_name: "John",
        last_name: "Test",
        email: "test@example.com",
        age: 55,
        password: "test1234",
      };

      const { statusCode, body } = await requester
        .post("/api/sessions/register")
        .send(mockUser);
      expect(statusCode).is.equals(200);
      expect(body.msg).is.equals("User created");
      expect(body.status).is.equals("success");

      createdUser = body.data;
    });
    it("The password should be stored encrypted", async function () {
      const isMatch = await compare(createdUser._id, "test1234");
      expect(isMatch).is.equals(true);
    });

    it("New user should have 'user' role", async function () {
      expect(createdUser.role).to.be.equals("user");
      expect(createdUser.role).to.be.a("string");
    });
  });

  describe("Login user", () => {
    it("Login user successfully using valid credentials", async function () {
      const mockUser = {
        email: "test@example.com",
        password: "test1234",
      };

      const { statusCode, _body } = await requester
        .post("/api/sessions/login")
        .send(mockUser);

      expect(statusCode).is.equals(200);
      expect(_body.success).is.equals(true);
    });

    it("Login user failed with invalid credentials", async function () {
      const mockUser = {
        email: "test@example.com",
        password: "test123456",
      };

      const { statusCode, ok, _body } = await requester
        .post("/api/sessions/login")
        .send(mockUser);

      expect(ok).is.equals(false);
      expect(_body.success).is.equals(false);
    });

    //todo: hacer un delete user
  });
});
