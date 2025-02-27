import { Injectable } from '@nestjs/common';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    // The registration process does not return user data immediately because email verification is required before login.  
// Once a user registers, they receive a verification email containing a unique link to verify their account.  
// Until the verification is completed, the user cannot log in or access the system.  
// Hence, this endpoint only returns a status indicating that the registration request has been received successfully.  
  
    await this.userService.create(createUserDto);
  }
}
