import { Router } from "express";
import passport from "passport";
import UserDto from "../Services/dtos/user.dto.js";
import generateUniqueToken from "../utils/crypto.js";
import sendPasswordResetEmail from "../utils/nodemailer.js";
import userModel from "../models/user.model.js";
import { createHash } from "../utils/utils.js";

const router = Router();

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {
    {
    }
  }
);
router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/github/error" }),
  async (req, res) => {
    const user = req.user;
    req.session.user = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
    };
    req.session.admin = true;
    res.redirect("/users");
  }
);
router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "api/session/fail-register",
  }),
  async (req, res) => {
    const user = req.user;
    const rol = user.roll;
    req.session.user = {
      _id: user._id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
      rol: rol,
    };
    res.send({
      status: "success",
      msg: "User created",
      data: req.session.user,
    });
  }
);

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/fail-login",
  }),
  async (req, res) => {
    const user = req.user;
    const rol = user.roll;
    req.session.user = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
      rol: rol,
    };
    res.send({
      status: "success",
      payload: req.session.user,
      message: "Log successful",
    });
  }
);
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) return res.status(200).send("Loged Out succesfuly");
    else res.send("Fail to log out");
  });
});

router.get("/fail-register", (req, res) => {
  res.status(401).send({ error: "failed to process register" });
});

router.get("/current", (req, res) => {
  if (!req.session.user) {
    return res.send({ error: "must be logged on" });
  }
  res.send({ user: new UserDto(req.session.user) });
});

router.get("/fail-login", (req, res) => {
  res.status(401).send({ error: "failed to process login" });
});

router.post("/reset-password/:token", async (req, res) => {
  const token = req.params.token;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send("Las contraseñas no coinciden.");
  }

  try {
    const user = await userModel.findOne({ resetToken: token });

    if (!user || Date.now() > user.resetTokenExpires) {
      return res.render("reset-password-expired");
    }
    user.password = createHash(password);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.send("Password changed succesfuly.");
  } catch (error) {
    console.error("Error at changing password:", error);
    res.status(500).send("internal server error.");
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    const resetToken = await generateUniqueToken();
    const resetTokenExpires = Date.now() + 60 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;

    await user.save();
    sendPasswordResetEmail(user.email, resetToken);

    res.send("Email sent correctly");
  } catch (error) {
    console.error("Error recovering password:", error);
    res.status(500).send("Server internal error");
  }
});

router.delete("/delete-user/:uid", async (req, res) => {
  try {
    const userId = req.params.uid;
    if (!userId) {
      return res.status(400).send("User ID is required.");
    }

    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).send("User not found.");
    }

    res.status(200).send({
      status: "success",
      msg: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

router.post("/find-user/:uid", async (req, res) => {
  try {
    const userId = req.params.uid;
    req.session.user = req.body.createdUser;
    if (!userId) {
      return res.status(400).send("User ID is required.");
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }
    console.log(req.session.user, "find-user");
    const { email } = req.session.user;
    if (email !== "test@example.com") {
      return res
        .status(403)
        .send(
          "Access denied. You do not have permission to access this resource."
        );
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Internal server error.");
  }
});
export default router;
