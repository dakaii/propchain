import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User, KYCStatus, UserRole } from '../entities/user.entity';
import { Property, PropertyStatus, PropertyType } from '../entities/property.entity';
import * as bcrypt from 'bcrypt';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🌱 Seeding database...');

    // Create demo users
    const demoPassword = await bcrypt.hash('demo123', 10);

    const demoUser = em.create(User, {
      email: 'demo@fractional.property',
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      firstName: 'Demo',
      lastName: 'User',
      passwordHash: demoPassword,
      kycStatus: KYCStatus.VERIFIED,
      role: UserRole.INVESTOR,
      emailVerified: true,
      kycVerifiedAt: new Date(),
    });

    const adminUser = em.create(User, {
      email: 'admin@fractional.property',
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: demoPassword,
      kycStatus: KYCStatus.VERIFIED,
      role: UserRole.ADMIN,
      emailVerified: true,
      kycVerifiedAt: new Date(),
    });

    // Create sample properties
    const property1 = em.create(Property, {
      name: 'Luxury Miami Beach Condo',
      description: 'Premium beachfront property with stunning ocean views. 2BR/2BA with modern amenities.',
      address: {
        street: '1500 Ocean Drive',
        city: 'Miami Beach',
        state: 'FL',
        zipCode: '33139',
        country: 'USA',
      },
      type: PropertyType.RESIDENTIAL,
      status: PropertyStatus.ACTIVE,
      totalValue: 1500000,
      totalShares: 30000,
      pricePerShare: 50,
      availableShares: 25000,
      minimumInvestment: 50,
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      tokenSymbol: 'MIAMI',
      metrics: {
        monthlyRent: 8500,
        annualYield: 6.8,
        occupancyRate: 95,
        squareFootage: 1200,
        yearBuilt: 2020,
        bedrooms: 2,
        bathrooms: 2,
      },
      images: [
        'https://images.unsplash.com/photo-1558036117-15d82a90b9b1',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      ],
    });

    const property2 = em.create(Property, {
      name: 'Downtown Austin Office Space',
      description: 'Modern office building in the heart of Austin tech district. Class A commercial space.',
      address: {
        street: '600 Congress Avenue',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA',
      },
      type: PropertyType.COMMERCIAL,
      status: PropertyStatus.ACTIVE,
      totalValue: 3500000,
      totalShares: 70000,
      pricePerShare: 50,
      availableShares: 45000,
      minimumInvestment: 50,
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      tokenSymbol: 'AUST',
      metrics: {
        monthlyRent: 28000,
        annualYield: 9.6,
        occupancyRate: 98,
        squareFootage: 15000,
        yearBuilt: 2018,
        bedrooms: 0,
        bathrooms: 0,
      },
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
        'https://images.unsplash.com/photo-1565623006066-82f23c79210b',
      ],
    });

    const property3 = em.create(Property, {
      name: 'Brooklyn Brownstone',
      description: 'Historic 4-unit brownstone in prime Brooklyn location. Fully renovated with modern amenities.',
      address: {
        street: '245 Park Slope Avenue',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11217',
        country: 'USA',
      },
      type: PropertyType.RESIDENTIAL,
      status: PropertyStatus.ACTIVE,
      totalValue: 2800000,
      totalShares: 56000,
      pricePerShare: 50,
      availableShares: 30000,
      minimumInvestment: 50,
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      tokenSymbol: 'BKLN',
      metrics: {
        monthlyRent: 18000,
        annualYield: 7.7,
        occupancyRate: 100,
        squareFootage: 4800,
        yearBuilt: 1920,
        bedrooms: 12,
        bathrooms: 8,
      },
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
        'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e',
      ],
    });

    const property4 = em.create(Property, {
      name: 'San Francisco Retail Complex',
      description: 'Premium retail space in high-traffic shopping district. Multiple tenant spaces.',
      address: {
        street: '1200 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
      },
      type: PropertyType.RETAIL,
      status: PropertyStatus.FULLY_FUNDED,
      totalValue: 5000000,
      totalShares: 100000,
      pricePerShare: 50,
      availableShares: 0,
      minimumInvestment: 50,
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      tokenSymbol: 'SFRT',
      metrics: {
        monthlyRent: 45000,
        annualYield: 10.8,
        occupancyRate: 100,
        squareFootage: 25000,
        yearBuilt: 2015,
        bedrooms: 0,
        bathrooms: 0,
      },
      images: [
        'https://images.unsplash.com/photo-1555636222-cae831e670b3',
        'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d',
      ],
      fundingCompletedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    });

    await em.persistAndFlush([
      demoUser,
      adminUser,
      property1,
      property2,
      property3,
      property4,
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('📧 Demo Accounts:');
    console.log('  User: demo@fractional.property / Password: demo123');
    console.log('  Admin: admin@fractional.property / Password: demo123');
    console.log('');
    console.log('🏠 Sample Properties: 4 properties created');
    console.log('');
  }
}