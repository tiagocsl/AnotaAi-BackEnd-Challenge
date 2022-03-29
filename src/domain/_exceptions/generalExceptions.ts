class GeneralError {
    name: string = "GeneralError"
    message: string = "An error occurred while trying to use any endpoints."
    data: any = {}
    statusCode: number = 400;
}

export class DoesNotExistError extends GeneralError {
    constructor(message: string) {
        super();
        this.message = message;
    }
    name = "DoesNotExistError"
    statusCode = 400
}

export class InvalidFieldType extends GeneralError {
    constructor(message: string) {
        super();
        this.message = message;
    }
    name = "InvalidFieldType"
    statusCode = 400
}