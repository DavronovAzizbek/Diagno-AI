import { PartialType } from '@nestjs/mapped-types';
import { CreateUserChatDto } from './create-user-chat.dto';

export class UpdateUserChatDto extends PartialType(CreateUserChatDto) {}
