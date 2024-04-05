import { expect } from "chai";
import supertest from "supertest";
import config from "../src/config/config.js";
import bcrypt from "bcrypt";

const ADMIN_NAME = config.adminName;
const ADMIN_PASSWORD = config.adminPassword;

const requester = supertest("http://localhost:8080");

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
      const response = await requester.get(
        `/api/sessions/find-user/${createdUser._id}`
      );
      expect(response.body.password).to.not.equal("test1234");
      const isMatch = await bcrypt.compare("test1234", response.body.password);
      expect(isMatch).is.equal(true);
    });

    it("New user should have 'user' role", async function () {
      expect(createdUser.rol).to.be.equals("user");
      expect(createdUser.rol).to.be.a("string");
    });
  });

  describe("Login user", () => {
    it("Login user successfully using valid credentials", async function () {
      const mockUser = {
        email: "test@example.com",
        password: "test1234",
      };

      const { statusCode, body } = await requester
        .post("/api/sessions/login")
        .send(mockUser);

      expect(statusCode).is.equals(200);
      expect(body.status).is.equals("success");
    });

    it("Login user failed with invalid credentials", async function () {
      const mockUser = {
        email: "test@example.com",
        password: "test123456",
      };

      const { body } = await requester
        .post("/api/sessions/login")
        .send(mockUser);

      expect(body.status).is.not.equals("success");
    });

    describe("Delete user", () => {
      it("Logout from user account", async function () {
        const response = await requester.get("/api/sessions/logout");
        expect(response.status).to.equal(200);
      });

      it("Login as admin", async function () {
        const adminUser = {
          email: ADMIN_NAME,
          password: ADMIN_PASSWORD,
        };

        const { statusCode } = await requester
          .post("/api/sessions/login")
          .send(adminUser);

        expect(statusCode).to.equal(200);
      });

      it("Delete user successfully", async function () {
        const { statusCode, body } = await requester.delete(
          `/api/sessions/delete-user/${createdUser._id}`
        );

        expect(statusCode).is.equals(200);
        expect(body.status).is.equals("success");
        expect(body.msg).is.equals("User deleted successfully");
      });

      it("Logout from admin account", async function () {
        const response = await requester.get("/api/sessions/logout");
        expect(response.status).to.equal(200);
      });
    });
  });
});
