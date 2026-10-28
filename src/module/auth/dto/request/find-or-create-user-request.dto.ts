export class FindOrCreateUserRequestDto {
  firebaseUid!: string;
  appleId!: string;
  displayName: string | undefined;
  email: string | undefined;
}
