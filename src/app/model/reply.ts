import { UserProfile } from './user/user-profile';

export interface Reply {
  content: string;
  lastUpdated: Date;
  profile: UserProfile;
}
