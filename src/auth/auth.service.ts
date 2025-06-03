import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(createUserDto: CreateUserDto){ 
        if (await this.usersService.findByOneEmail(createUserDto.email)) {
            throw new BadRequestException('User already exists');
        }
        return await this.usersService.create(createUserDto);
    }

    login() {
        return "login";
    }
}

