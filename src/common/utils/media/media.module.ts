import { MediaService } from "./media.service";
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Global()
@Module({
   imports: [ConfigModule.forRoot({ isGlobal: true })],
   providers: [MediaService],
   exports: [MediaService],
})
export class MediaModule {}