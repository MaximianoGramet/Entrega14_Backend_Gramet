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

// describe("Testing Product Endpoints", () => {
//   let newProduct;
//   describe("Create a new product", () => {
//     it("Create a new product with all information neccesary", async function () {
//       const mockProduct = {
//         title: "Test product",
//         description: "Description testing",
//         price: 100,
//         thumbnail:
//           "https://http2.mlstatic.com/D_NQ_NP_652325-MLA69889728837_062023-O.webp",
//         code: "7357",
//         stock: 10,
//         status: true,
//       };

//       const { statusCode, ok, _body } = await requester
//         .post("/api/products")
//         .send(mockProduct);

//       expect(statusCode).is.equals(201);
//       expect(ok).is.equals(true);
//       expect(_body.productCreated).to.not.be.empty;

//       newProduct = _body.productCreated;
//     });

//     it("Fail to create a new product with missing properties", async function () {
//       const mockProduct = {
//         title: "Test product",
//         thumbnail: "https://images.unsplash.com/photo-1519002",
//         code: "7358",
//         status: true,
//       };

//       const { statusCode, ok, _body } = await requester
//         .post("/api/products")
//         .send(mockProduct);

//       expect(statusCode).is.equals(400);
//       expect(ok).is.equals(false);
//       expect(_body.code).is.equals(3);
//     });

//     it("Fail to create a new product with existing code", async function () {
//       const mockProduct = {
//         title: "Test product",
//         description: "Description testing",
//         price: 100,
//         thumbnail:
//           "https://http2.mlstatic.com/D_NQ_NP_652325-MLA69889728837_062023-O.webp",
//         code: "7357",
//         stock: 10,
//         status: true,
//       };

//       const { statusCode, ok, _body } = await requester
//         .post("/api/products")
//         .send(mockProduct);

//       expect(statusCode).is.equals(400);
//       expect(ok).is.equals(false);
//       expect(_body.error).is.equals("Error");
//     });
//   });

//   describe("Get products", () => {
//     it("Get all products", async function () {
//       const { statusCode, ok, _body } = await requester.get("/api/products");

//       expect(statusCode).is.equals(200);
//       expect(ok).is.equals(true);
//       expect(_body.productData.payload).to.not.be.empty;
//     });

//     it("Get product by ID", async function () {
//       const { statusCode, ok, _body } = await requester.get(
//         `/api/products/${newProduct._id}`
//       );

//       expect(statusCode).is.equals(200);
//       expect(ok).is.equals(true);
//       expect(_body.productSelected).to.not.be.empty;
//     });

//     it("Failed to get product with an invalid ID", async function () {
//       const { statusCode, ok, _body } = await requester.get(
//         `/api/products/asleñw`
//       );

//       expect(statusCode).is.equals(404);
//       expect(ok).is.equals(false);
//       expect(_body.error).is.not.equals("");
//     });
//   });

//   describe("Delete a product", () => {
//     it("Failed to delete a product with invalid ProductID", async function () {
//       const { statusCode, ok } = await requester.delete(
//         `/api/products/sñelqweña`
//       );

//       expect(statusCode).is.equals(400);
//       expect(ok).is.equals(false);
//     });

//     it("Delete a product with a valid ProductID", async function () {
//       const { statusCode, ok } = await requester.delete(
//         `/api/products/${newProduct._id}`
//       );

//       expect(statusCode).is.equals(200);
//       expect(ok).is.equals(true);
//     });
//   });
// });

// describe("Testing Cart Endpoints", () => {
//   describe("Create a new cart", () => {
//     it("Create a new cart successfully", async function () {
//       const mockProduct = {
//         title: "Test product",
//         description: "Description for a random test product",
//         price: 100,
//         thumbnail: "https://images.unsplash.com/photo-1519002",
//         category: "Manga",
//         code: "TEST01",
//         stock: 10,
//         status: true,
//       };

//       const result = await requester.post("/api/products").send(mockProduct);

//       const productGeneratedForTesting = result._body;

//       const cartMock = {
//         userId: createdUser._id,
//         products: [productGeneratedForTesting.productCreated._id],
//       };

//       const { statusCode, ok, _body } = await requester
//         .post("/api/carts")
//         .send(cartMock);
//       expect(statusCode).is.equals(200);
//       expect(ok).is.equals(true);
//       expect(_body.cartCreated).to.not.be.empty;
//     });
//   });
// });
