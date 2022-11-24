import { Module } from '@nestjs/common';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { SalesModule } from 'src/sales/sales.module';
import { GoalService } from './services/goal.service';
import { GoalResolver } from './resolvers/goal.resolver';
import { SalesService } from './services/sales.service';
import { SalesResolver } from './resolvers/sales.resolver';

@Module({
  imports:[SalesModule, ConfigurationsModule],
  providers: [GoalService, GoalResolver, SalesService, SalesResolver]
})
export class ReportsModule {}
