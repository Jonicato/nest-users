import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ data: Partial<User> }> {
    const { email, name, lastName } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException(this.formatError('Este usuario ya existe.'));
    }

    const nameConflict = await this.userRepository.findOne({ where: { name, lastName } });
    if (nameConflict) {
      throw new BadRequestException(this.formatError('Ya existe un usuario registrado con este nombre y apellido.'));
    }

    this.validateEmail(createUserDto.email);
    this.validatePassword(createUserDto.password);

    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);

    return {
      data: this.formatResponse(user),
    };
  }

  async findAll(): Promise<{ data: Partial<User>[] }> {
    const users = await this.userRepository.find();
    return {
      data: users.map(user => this.formatResponse(user)),
    };
  }

  async findOne(id: number): Promise<{ data: Partial<User> }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(this.formatError('Usuario no encontrado.'));
    }
    return {
      data: this.formatResponse(user),
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<{ data: Partial<User> }> {
      const { data: user } = await this.findOne(id);

      const nameConflict = await this.userRepository.findOne({
        where: { name: updateUserDto.name, lastName: updateUserDto.lastName },
      });

      if (nameConflict && nameConflict.id !== id) {
        throw new BadRequestException(this.formatError('Ya existe un usuario registrado con este nombre y apellido.'));
      }

      if (updateUserDto.email) {
        this.validateEmail(updateUserDto.email);
      }

      if (updateUserDto.password) {
        this.validatePassword(updateUserDto.password);
      }

      Object.assign(user, updateUserDto);
      const updatedUser = await this.userRepository.save(user);
      return {
        data: this.formatResponse(updatedUser),
      };
  }

  async remove(id: number): Promise<{ data: { message: string } }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(this.formatError('Usuario no encontrado.'));
    }
    await this.userRepository.remove(user);
    return {
      data: { message: 'Usuario eliminado exitosamente.' },
    };
  }

  private validateEmail(email: string): void {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      throw new BadRequestException(this.formatError('Formato de correo electrónico inválido'));
    }
  }

  private validatePassword(password: string): void {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(password)) {
      throw new BadRequestException(this.formatError('La contraseña debe contener:\n * Al menos 8 caracteres de longitud.\n * Al menos una mayúscula.\n * Al menos una minúscula.\n * Al menos un dígito.\n * Al menos un caracter especial.'));
    }
  }

  private formatResponse(user: User) {
    return {
      type: 'users',
      id: user.id,
      attributes: {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }

  private formatError(message: string) {
    return {
      errors: [
        {
          status: '400',
          title: 'Bad Request',
          detail: message,
        },
      ],
    };
  }
}
