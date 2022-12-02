import { Module } from '@nestjs/common';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { SalesModule } from 'src/sales/sales.module';
import { GoalService } from './services/goal.service';
import { GoalResolver } from './resolvers/goal.resolver';

@Module({
  imports:[SalesModule, ConfigurationsModule],
  providers: [GoalService, GoalResolver]
})
export class ReportsModule {}
