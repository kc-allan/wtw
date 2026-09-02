import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import {
  issueInvitationSchema,
  sendInvitationSchema,
  type IssueInvitationInput,
  type SendInvitationInput,
} from './invitations.schemas';
import { InvitationsService } from './invitations.service';

@ApiTags('invitations')
@ApiBearerAuth()
@Controller('events/:eventId/invitations')
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get()
  @ApiOperation({ summary: 'Invitation state per guest' })
  list(@CurrentUser() user: AuthenticatedUser, @Param('eventId') eventId: string) {
    return this.invitations.list(user.id, eventId);
  }

  @Post('issue')
  @ApiOperation({
    summary: 'Mint guest links. The raw token is returned only by this call.',
  })
  @ApiZodBody(issueInvitationSchema, 'IssueInvitations')
  issue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body(zodBody(issueInvitationSchema)) body: IssueInvitationInput,
  ) {
    return this.invitations.issue(user.id, eventId, body);
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deliver invitations over WhatsApp, SMS or email' })
  @ApiZodBody(sendInvitationSchema, 'SendInvitations')
  send(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Body(zodBody(sendInvitationSchema)) body: SendInvitationInput,
  ) {
    return this.invitations.send(user.id, eventId, body);
  }

  @Delete(':guestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a guest link' })
  async revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
  ): Promise<void> {
    await this.invitations.revoke(user.id, eventId, guestId);
  }
}
