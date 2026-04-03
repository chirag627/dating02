import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/utils/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get conversation list' })
  getConversations(@CurrentUser() user: any) {
    return this.chatService.getConversationList(user._id.toString());
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get conversation with a user' })
  getConversation(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
    @Query('page') page = 1,
  ) {
    return this.chatService.getConversation(user._id.toString(), userId, +page);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread messages count' })
  getUnreadCount(@CurrentUser() user: any) {
    return this.chatService.getUnreadCount(user._id.toString());
  }
}
