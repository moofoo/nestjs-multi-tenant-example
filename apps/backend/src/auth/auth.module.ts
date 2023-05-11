import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UsersModule } from "models/users/users.module";
import { TenantsModule } from "models/tenants/tenants.module";
import { AuthService } from "./auth.service";
import { ClsModule } from "nestjs-cls";

@Module({
    imports: [UsersModule, TenantsModule, ClsModule],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule { } 