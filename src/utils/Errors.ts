
export class CancelProcess extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CancelProcess";
    }
}
