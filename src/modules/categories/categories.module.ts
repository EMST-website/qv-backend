import { JwtModule } from "@/common/utils/jwt/jwt.module";
import { Module } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CategoriesController } from "./categories.controller";
import { MediaModule } from "@/common/utils/media/media.module";



@Module({
   controllers: [CategoriesController],
   providers: [CategoriesService],
   imports: [
      JwtModule,
      MediaModule
   ],
})
export class CategoriesModule {};
