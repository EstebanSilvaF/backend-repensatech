import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../infrastructure/config/env';
import { userRepository } from '../../infrastructure/persistence/repositories/user.repository';
import { universityRepository } from '../../infrastructure/persistence/repositories/university.repository';
import { CreateUserDTO, LoginDTO, AuthPayload, User } from '../../domain/types/user.types';
import {
  assertEmailAvailable,
  assertUniversityForRegistration,
  assertValidCredentials,
  validateEmailBelongsToUniversity,
  validateLogin,
  validateRegister,
} from '../../domain/validators/user.validator';

const SALT_ROUNDS = 10;

export const userService = {
  async register(data: CreateUserDTO) {
    validateRegister(data);

    const existing = await userRepository.findByEmail(data.email);
    assertEmailAvailable(existing);

    const university = await universityRepository.findById(data.university_id);
    assertUniversityForRegistration(university);
    validateEmailBelongsToUniversity(data.email, university.email_domain);

    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userRepository.create({ ...data, password_hash });

    return sanitizeUser(user);
  },

  async login(data: LoginDTO) {
    validateLogin(data);

    const user = await userRepository.findByEmail(data.email);
    const valid = user ? await bcrypt.compare(data.password, user.password_hash) : false;
    assertValidCredentials(user, valid);

    const payload: AuthPayload = {
      userId: user.id,
      universityId: user.university_id,
      role: user.role,
    };

    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: '7d',
    });

    return { token, user: sanitizeUser(user) };
  },
};

function sanitizeUser(user: User) {
  const { password_hash, ...safe } = user;
  return safe;
}
