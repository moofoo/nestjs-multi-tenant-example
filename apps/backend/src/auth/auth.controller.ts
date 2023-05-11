import {
    Body,
    Controller,
    Post
} from '@nestjs/common';

import { Public } from 'decorators/public.decorator';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly auth: AuthService) { }

    @Public()
    @Post('/login')
    login(@Body() credentials: { userName: string, password: string; }) {
        return this.auth.login(credentials);
    }

    @Post('/logout')
    logout() {
        return this.auth.logout();
    }
}