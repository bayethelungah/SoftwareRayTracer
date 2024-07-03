var canvasWidth = 800;
var canvasHeight = 600;
var canvasDepth = 800;
var canvas = document.getElementById("main");
var ctx = canvas.getContext("2d");
var sizeRange = document.getElementById("size-range");
sizeRange.min = "0";
sizeRange.max = "1";
sizeRange.value = "0.5";
sizeRange.step = "0.1";
sizeRange.oninput = function (e) { return handleRanges(e); };
canvas.width = canvasWidth;
canvas.height = canvasHeight;
var colorPicker = document.getElementById("color-picker");
colorPicker.value = "ffffff";
colorPicker.oninput = function (e) { return handleColorPicker(e); };
var previousSize = 0.5;
var max = 0;
var min = 0;
var Vec3 = (function () {
    function Vec3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Vec3.prototype.add = function (other) {
        if (typeof (other) == 'number') {
            this.x += other;
            this.y += other;
            this.z += other;
        }
        else {
            this.x += other.x;
            this.y += other.y;
            this.z += other.z;
        }
        return this;
    };
    Vec3.add = function (a, b) {
        if (typeof (b) == 'number') {
            return new Vec3(a.x + b, a.y + b, a.z + b);
        }
        else {
            return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
        }
    };
    Vec3.prototype.sub = function (other) {
        if (typeof (other) == 'number') {
            this.x -= other;
            this.y -= other;
        }
        else {
            this.x -= other.x;
            this.y -= other.y;
            this.z -= other.z;
        }
        return this;
    };
    Vec3.prototype.mult = function (other) {
        if (typeof (other) == 'number') {
            this.x *= other;
            this.y *= other;
            this.z *= other;
        }
        else {
            this.x *= other.x;
            this.y *= other.y;
            this.z *= other.z;
        }
        return this;
    };
    Vec3.mult = function (a, b) {
        if (typeof (b) == "number") {
            return new Vec3(a.x * b, a.y * b, a.z * b);
        }
        else {
            return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
        }
    };
    Vec3.prototype.div = function (other) {
        if (typeof (other) == 'number') {
            this.x /= other;
            this.y /= other;
            this.z /= other;
        }
        else {
            this.x /= other.x;
            this.y /= other.y;
            this.z /= other.z;
        }
        return this;
    };
    Vec3.dot = function (vec1, vec2) {
        return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
    };
    Vec3.prototype.getAngle = function () {
        return Math.atan2(this.y, this.x);
    };
    Vec3.prototype.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    Vec3.prototype.normalize = function () {
        var mag = this.mag();
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
        return this;
    };
    return Vec3;
}());
var Sphere = (function () {
    function Sphere(radius, color) {
        if (radius === void 0) { radius = 10; }
        if (color === void 0) { color = "#00ffff"; }
        this.radius = radius;
        this.position = new Vec3(canvasWidth / 2, canvasHeight / 2, 0);
        this.color = color;
    }
    return Sphere;
}());
var sphere = new Sphere();
var image = ctx.createImageData(canvas.width, canvas.height);
var getColorIndicesForCoord = function (x, y, width) {
    var redIndex = y * (width * 4) + x * 4;
    return [redIndex, redIndex + 1, redIndex + 2, redIndex + 3];
};
function rayTrace(sphere) {
    for (var x = 0; x < canvasWidth; ++x) {
        for (var y = 0; y < canvasHeight; ++y) {
            var colorIndices = getColorIndicesForCoord(x, y, canvasWidth);
            var coord = new Vec3(x / canvasWidth, y / canvasHeight, 0);
            coord = Vec3.mult(coord, 2.0).add(-1.0);
            var colors = shader(coord, sphere);
            for (var i = 0; i < colorIndices.length; ++i) {
                image.data[colorIndices[i]] = colors[i];
            }
        }
    }
}
console.log(max, min);
function render() {
    clearBackground();
    ctx.putImageData(image, 0, 0);
}
function resize(event) {
    if (event.shiftKey) {
        console.log("clicked");
    }
}
function clearBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function shader(coord, sphere) {
    var radius = sphere.radius;
    var origin = new Vec3(0.0, 0.0, 1.0);
    var a = Vec3.dot(coord, coord);
    var b = 2.0 * Vec3.dot(origin, coord);
    var c = Vec3.dot(origin, origin) - radius * radius;
    var discrim = b * b - 4.0 * a * c;
    if (discrim < 0) {
        return convertColor("#000000");
    }
    var t1 = -b - Math.sqrt(discrim) / (2.0 * a);
    var h1 = Vec3.mult(Vec3.add(origin, coord), t1);
    var lightDir = new Vec3(1, 1, 1);
    var d = Vec3.dot(h1, lightDir);
    if (d > max) {
        max = d;
    }
    else if (d < min) {
        min = d;
    }
    var alpha = map(d, -1, 1, 0, 200);
    return convertColor(sphere.color, alpha);
}
function map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}
;
function handleRanges(event) {
    sphere.radius = event.target.value;
    rayTrace(sphere);
    render();
}
function handleColorPicker(event) {
    sphere.color = event.target.value;
    rayTrace(sphere);
    render();
}
function convertColor(colorString, alpha) {
    if (alpha === void 0) { alpha = 255; }
    var colors = [];
    var start = colorString.charAt(0) == "#" ? 1 : 0;
    for (var i = start; i < colorString.length; i += 2) {
        var number = colorString.substring(i, i + 2);
        colors.push(parseInt(number, 16));
    }
    colors.push(alpha);
    return colors;
}
console.log(convertColor("#1128d4"));
var s = new Sphere(0.5);
rayTrace(s);
render();
//# sourceMappingURL=index.js.map