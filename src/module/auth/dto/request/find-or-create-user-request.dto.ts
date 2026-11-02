export class FindOrCreateUserRequestDto {
  firebaseUid!: string;
  appleId!: string;
  email: string | undefined;
}
