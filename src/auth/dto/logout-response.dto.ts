export class LogoutResponseDto {
    message: string;
    timestamp?: Date;

    constructor(message: string) {
        this.message = message;
        this.timestamp = new Date();
    }
}
