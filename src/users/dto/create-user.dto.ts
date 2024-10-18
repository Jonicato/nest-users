import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Length(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    password: string;
}