import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Workspaces this host belongs to' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.accounts.listForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One workspace with its members' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.accounts.findForUser(user.id, id);
  }
}
