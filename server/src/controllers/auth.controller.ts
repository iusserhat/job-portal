import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import UserAccount from "../models/user/user-account.model";
import UserType from "../models/user/user-type.model";
import { BadRequestError } from "../errors/BadRequestError";
import { ApiError } from "../errors/ApiError";
import mongoose from "mongoose";

/**
 * AuthController
 * This class contains methods for handling authentication
 * @class
 *
 * @method login - This method is used to login a user
 * @method signup - This method is used to register a user
 */
export default class AuthController {
  /**
   * This method is used to login a user
   * @param req Request
   * @param res Response
   */
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, user_type_id } = req.body;
      console.log("Login isteği alındı:", { email, user_type_id });
      
      // Kullanıcıyı bul
      const user = await UserAccount.findOne({ email: email });

      // If user account is not found, throw an error
      if (!user) {
        console.log("Kullanıcı bulunamadı:", email);
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Kullanıcı bulunamadı. E-posta adresini kontrol ediniz.",
          []
        );
      }

      // If user account is found, compare the password
      if (!(user as any).comparePassword(password)) {
        console.log("Şifre eşleşmiyor:", email);
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Geçersiz e-posta veya şifre",
          []
        );
      }
      
      console.log("Kullanıcı doğrulandı, şimdi rol kontrolü yapılıyor...");
      
      // ROL KONTROLÜ
      // Kullanıcının veritabanındaki rol ID'sini string'e çevir
      const userTypeIdStr = user.user_type_id.toString();
      
      // Kullanıcının veritabanındaki rolünü bul (display name için)
      const actualUserType = await UserType.findById(userTypeIdStr);
      console.log("Kullanıcının DB'deki rolü:", {
        roleId: userTypeIdStr,
        roleName: actualUserType?.user_type_name,
        roleDisplayName: actualUserType?.user_type_display_name
      });
      
      // İstemciden gelen rol ID varsa
      if (user_type_id) {
        console.log("İstemci tarafından rol belirtildi:", user_type_id);
        
        try {
          // İstemciden gelen rol id ya ObjectId ya da rol adı olabilir
          let requestedRoleId;
          
          // Öncelikle veritabanından rol adı ile eşleşen bir kayıt ara
          const requestedUserType = await UserType.findOne({ 
            user_type_name: user_type_id 
          });
          
          // Eğer rol adıyla eşleşen bir kayıt bulunduysa onun ID'sini kullan
          if (requestedUserType) {
            requestedRoleId = requestedUserType._id.toString();
            console.log("Rol adına göre bulunan rol ID:", requestedRoleId);
          } 
          // Eğer doğrudan bir ObjectId gönderildiyse onu kullan
          else if (mongoose.isValidObjectId(user_type_id)) {
            requestedRoleId = new mongoose.Types.ObjectId(user_type_id).toString();
            console.log("ObjectId formatında rol ID kullanılıyor:", requestedRoleId);
          }
          // Hiçbir şekilde geçerli bir rol bulunamadı
          else {
            console.log("Geçersiz rol formatı:", user_type_id);
            throw new ApiError(
              StatusCodes.UNAUTHORIZED,
              "Geçersiz kullanıcı tipi formatı",
              []
            );
          }
          
          // Kullanıcının rolü ile istenen rol aynı mı?
          console.log("Rol karşılaştırması:", {
            kullanıcıRolü: userTypeIdStr,
            istenenRol: requestedRoleId,
            eşleşiyorMu: userTypeIdStr === requestedRoleId
          });
          
          // Roller eşleşmiyorsa hata döndür
          if (userTypeIdStr !== requestedRoleId) {
            const requestedUserTypeObj = await UserType.findById(requestedRoleId);
            
            console.log("Rol uyuşmazlığı!", {
              kullanıcıRolAdı: actualUserType?.user_type_name,
              istenenRolAdı: requestedUserTypeObj?.user_type_name
            });
            
            throw new ApiError(
              StatusCodes.UNAUTHORIZED,
              `Bu hesap '${requestedUserTypeObj?.user_type_display_name || ''}' rolü ile giriş yapamaz. Hesabınız '${actualUserType?.user_type_display_name || ''}' olarak kayıtlıdır.`,
              []
            );
          }
          
          console.log("Rol kontrolü başarılı: Kullanıcı doğru rolüyle giriş yapıyor");
        } catch (error) {
          console.error("Rol kontrolünde hata:", error);
          throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Kullanıcı tipi doğrulamasında hata oluştu",
            []
          );
        }
      } else {
        console.log("İstemci tarafından rol belirtilmedi, rol kontrolü atlanıyor");
      }

      // Kimlik doğrulama başarılı - token oluştur
      const token = (user as any).generateJWT();
      const userData = {
        _id: user._id,
        email: user.email,
        user_type_id: user.user_type_id.toString(),
      };
      
      console.log("Login başarılı, token oluşturuldu:", { 
        userId: userData._id, 
        userEmail: userData.email,
        userType: userData.user_type_id
      });

      // Send a response with the user account details
      res.status(StatusCodes.OK).json({
        user: userData,
        token: token,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * This method is used to register a user
   * @param req Request
   * @param res Response
   * @param next NextFunction
   */
  public static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      // CORS header'ları ekleyelim
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      console.log("Signup isteği alındı, body:", JSON.stringify(req.body));
      
      // Request headers'ı logla
      console.log("Request headers:", JSON.stringify(req.headers));
      
      const payload = req.body;
      const { user_type_name } = payload;

      // Find the user type where name [job_seeker, hr_recruiter]
      const userType = await UserType.findOne({
        user_type_name: user_type_name,
      });

      // If user type is not found, throw an error
      if (!userType) {
        console.error(`Geçersiz kullanıcı tipi: ${user_type_name}`);
        throw new BadRequestError(
          `User type not found with user_type_name provided`,
          []
        );
      }

      // Check if user account exists
      const existingUser = await UserAccount.findOne({
        email: payload.email,
      });

      // If user account exists, throw an error
      if (existingUser) {
        console.log(`Kullanıcı zaten mevcut: ${payload.email}`);
        throw new BadRequestError("User account already exists", []);
      }

      // Create a new user account with the user type id and other details
      const userAccount = new UserAccount({
        ...payload,
        user_type_id: userType._id,
        registration_date: new Date(),
      });

      // Save the user account
      await userAccount.save();
      console.log("Yeni kullanıcı kaydedildi:", {
        email: userAccount.email,
        user_type_id: userAccount.user_type_id,
        userTypeName: user_type_name
      });

      // Send a response with the user account details
      res.status(StatusCodes.CREATED).json({
        message: "User account created successfully",
        user: userAccount,
      });
    } catch (error) {
      console.error("Kayıt hatası:", error);
      next(error);
    }
  }

  /**
   * This method is used to get the current user
   * @param req Request
   * @param res Response
   * @param next NextFunction
   */
  public static async me(req: Request, res: Response, next: NextFunction) {
    try {
      // Get the user account from the request object
      const user = req.user;

      // Send a response with the user account details
      res.status(StatusCodes.OK).json({
        user: user,
      });
    } catch (error) {
      throw error;
    }
  }
}
