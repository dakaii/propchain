import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import { User, KYCStatus } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.em.findOne(User, { email });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      walletAddress: user.walletAddress
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(email: string, password: string, walletAddress?: string) {
    const existingUser = await this.em.findOne(User, { email });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // For MVP, generate mock wallet address if not provided
    const mockWalletAddress = walletAddress || `0x${Math.random().toString(16).substr(2, 40)}`;

    const user = this.em.create(User, {
      email,
      walletAddress: mockWalletAddress,
      passwordHash: await bcrypt.hash(password, 10),
      kycStatus: KYCStatus.PENDING,
    });

    await this.em.persistAndFlush(user);

    return this.login(user);
  }
}