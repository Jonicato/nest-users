import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const createUserDto = {
    email: 'test@example.com',
    name: 'Test',
    lastName: 'User',
    password: 'Password1!',
  };

  const mockUser = { id: 1, ...createUserDto };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw an error if user already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockUser);
      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne(mockUser.id);
      expect(result).toEqual({ data: mockUser });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto = { name: 'Updated' };
      const result = await service.update(mockUser.id, updateUserDto);
      expect(result).toEqual({ data: { ...mockUser, ...updateUserDto } });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(repository.save).toHaveBeenCalledWith({ ...mockUser, ...updateUserDto });
    });

    it('should throw an error if name and last name combination already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockUser);
      await expect(service.update(mockUser.id, { name: 'Existing', lastName: 'User' })).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.update(mockUser.id, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const result = await service.remove(mockUser.id);
      expect(result).toEqual({ data: { message: 'Usuario eliminado exitosamente.' } });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.remove(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });
});
