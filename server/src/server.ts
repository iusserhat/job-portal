import Application from "./application";
import { loadModels } from "./models";

// Önce modelleri yükle
console.log("🔧 Mongoose modellerini yükleme...");
loadModels();

// Uygulama örneğini oluştur ve başlat
const app = new Application();
app.start();

// Hatalar için global event handler'lar
process.on("uncaughtException", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  process.exit(1);
});
