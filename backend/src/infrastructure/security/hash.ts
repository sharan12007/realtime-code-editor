import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';

export const hashValue = async (value: string) => bcrypt.hash(value, env.bcryptRounds);
export const compareHash = async (value: string, hash: string) => bcrypt.compare(value, hash);
