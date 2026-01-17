import { JwtModule } from "@/common/utils/jwt/jwt.module";
import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { MediaModule } from "@/common/utils/media/media.module";

@Module({
   controllers: [ProductsController],
   providers: [ProductsService],
   imports: [
      JwtModule,
      MediaModule
   ],
})
export class ProductsModule {};
