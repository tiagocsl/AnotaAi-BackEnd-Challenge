class CategoryError {
    name: string = "CategoryError"
    message: string = "An error occurred while trying to use any category endpoints."
    data: any = {}
    statusCode: number = 400;
}

export class InsufficientPermissionError extends CategoryError {
    constructor(message: string) {
        super();
        this.message = message;
    }
    name = "InsufficientPermissionError"
    statusCode = 403
}

export class RepeatedDataError extends CategoryError {
    constructor(message: string) {
        super();
        this.message = message;
    }
    name = "RepeatedDataError"
    statusCode = 400
}