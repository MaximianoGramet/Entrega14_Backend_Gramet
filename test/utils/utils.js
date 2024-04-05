import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import config from "../../src/config/config.js";

const MONGO_URL = config.urlMongo;

const client = new MongoClient(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
await client.connect();

async function comparePasswordWithUserId(userId, password) {
  const db = client.db("test");
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ _id: userId });

  if (!user || !user.password) {
    throw new Error(
      "Usuario no encontrado o contraseña no disponible en la base de datos"
    );
  }
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
}

async function deleteUserById(userId) {
  const client = new MongoClient("MONGO_URL", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();

  try {
    const db = client.db("test");
    const usersCollection = db.collection("users");

    // Borrar el usuario por su _id
    const result = await usersCollection.deleteOne({ _id: ObjectId(userId) });

    if (result.deletedCount === 1) {
      console.log("Usuario eliminado correctamente");
      return true;
    } else {
      console.log("No se encontró el usuario con el _id especificado");
      return false;
    }
  } catch (error) {
    console.error("Error al borrar el usuario:", error);
    return false;
  } finally {
    // Cerrar la conexión con la base de datos
    await client.close();
  }
}

export default comparePasswordWithUserId;
