import { Module } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CountriesController } from "./countries.controller";
import { JwtModule } from "@/common/utils/jwt/jwt.module";

@Module({
   imports: [JwtModule],
   providers: [CountriesService],
   controllers: [CountriesController],
})
export class CountriesModule {}