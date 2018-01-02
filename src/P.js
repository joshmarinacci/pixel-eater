export default class P {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    sub(pt) {
        return new P(this.x - pt.x, this.y - pt.y)
    }

    div(scalar) {
        return new P(this.x / scalar, this.y / scalar)
    }

    floor() {
        // noinspection JSSuspiciousNameCombination
        return new P(Math.floor(this.x), Math.floor(this.y))
    }
}