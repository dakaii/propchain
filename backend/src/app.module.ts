import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { YellowModule } from './modules/yellow/yellow.module';

// Configuration
import mikroOrmConfig from '../mikro-orm.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    MikroOrmModule.forRoot(mikroOrmConfig),

    // Task Scheduling (for periodic settlements)
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    PropertiesModule,
    OrdersModule,
    PortfolioModule,
    YellowModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}