let canvasWidth = 800;
let canvasHeight = 600;


let canvasDepth = 800;

const canvas = document.getElementById("main") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const sizeRange = document.getElementById("size-range") as HTMLInputElement;

sizeRange.min = "0";
sizeRange.max = "1";

sizeRange.value = "0.5";
sizeRange.step = "0.1";
sizeRange.oninput = (e) => handleRanges(e as InputEvent);

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const colorPicker = document.getElementById("color-picker") as HTMLInputElement;
colorPicker.value = "ffffff";

colorPicker.oninput = (e) => handleColorPicker(e as InputEvent);


let previousSize = 0.5;


let max = 0;
let min = 0;

// let resizing = false;

// canvas.addEventListener("click", (event) => resize(event))

class Vec3
{
    public x: GLfloat;
    public y: GLfloat;
    public z: GLfloat;

    constructor(x: GLfloat = 0, y: GLfloat = 0, z: GLfloat = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public add(other: Vec3 | number)
    {
        if(typeof(other) == 'number')
        {
            this.x += other;
            this.y += other;
            this.z += other;

        }else
        {
            this.x += other.x;
            this.y += other.y;
            this.z += other.z;
        }
        return this;
    }

    public static add(a: Vec3, b: Vec3 | number)
    {
        if(typeof(b) == 'number')
        {
            return new Vec3(a.x + b, a.y + b, a.z + b);

        }else
        {
            return new Vec3( a.x + b.x, a.y + b.y, a.z + b.z)
        }
    }


    public sub(other: Vec3 | number)
    {
        if(typeof(other) == 'number')
        {
            this.x -= other;
            this.y -= other;
        }else
        {
            this.x -= other.x;
            this.y -= other.y;
            this.z -= other.z;
        }
        return this;
    }

    public mult(other: Vec3 | number)
    {
        if(typeof(other) == 'number')
        {
            this.x *= other;
            this.y *= other;
            this.z *= other;
        }else
        {
            this.x *= other.x;
            this.y *= other.y;
            this.z *= other.z;
        }

        return this;
    }

    public static mult(a: Vec3, b: Vec3 | number)
    {
        if(typeof(b) == "number")
        {
            return new Vec3(a.x * b, a.y * b, a.z * b);
        }else
        {

            return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
        }
    }
    public div(other: Vec3 | number)
    {
        if(typeof(other) == 'number')
        {
            this.x /= other;
            this.y /= other;
            this.z /= other;
        }else
        {
            this.x /= other.x;
            this.y /= other.y;
            this.z /= other.z;
        }

        return this;
    }

    public static dot(vec1: Vec3, vec2: Vec3): number
    {
         return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
    }

    public getAngle(): GLfloat
    {
        return Math.atan2(this.y, this.x);
    }

    public mag(): number
    {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public normalize(): this
    {
        const mag = this.mag();
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;

        return this;
    }

}

// class Ball
// {

//     private position: Vec3;
//     private velocity: Vec3;
//     private acceleration: Vec3;
//     private size: GLfloat;

//     constructor(position?: Vec3, size?: GLfloat | undefined)
//     {
//         this.position = position == undefined ? new Vec3(canvasWidth / 2, canvasHeight / 2) : position;
//         this.velocity = new Vec3();
//         this.acceleration = new Vec3(Math.random() * 10 - 5, Math.random() * 10 - 5);

//         this.size = size == undefined ? 10 : size;
//     }

//     public render(): void
//     {
//         ctx.beginPath();
//         ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2, false);
//         ctx.lineWidth = 1;
//         ctx.strokeStyle = "white";
//         ctx.stroke();

//     }

//     public update(): void
//     {
//         this.velocity.add(this.acceleration);
//         this.acceleration.mult(0);
//         this.position.add(this.velocity);

//     }

//     public wall(): void
//     {
//         if(this.position.x + this.size / 2 > canvasWidth || this.position.x + this.size / 2 < 0 || this.position.y + this.size / 2 > canvasHeight || this.position.y + this.size / 2 < 0)
//         {
//             this.velocity.mult(-1);
//         }
//     }

// }

// const NUMBER_OF_BALLS = 40;

// const balls: Ball[] = [];

// for(let i = 0; i < NUMBER_OF_BALLS; ++i)
// {
//     balls[i] = new Ball();
// }

// function mainLoop()
// {
//     clearBackground();

//     for(let ball of balls)
//     {
//         ball.update();
//         ball.render();
//         ball.wall();
//     }

//     requestAnimationFrame(mainLoop);
// }

// function resize(event: MouseEvent): void
// {
//     if(event.shiftKey)
//     {
//         console.log("clicked");
//     }
// }

// function clearBackground() : void
// {
//     ctx.clearRect(0,0, canvas.width, canvas.height);
// }

// mainLoop();

 

class Sphere
{
    public position: Vec3;
    public radius: GLfloat;
    public color: string;
    
    constructor(radius: GLfloat = 10, color: string = "#00ffff")
    {
        this.radius = radius;
        this.position = new Vec3(canvasWidth / 2, canvasHeight / 2, 0);
        this.color = color;
        
    }
}

 

const sphere = new Sphere();
const image = ctx.createImageData(canvas.width, canvas.height);


const getColorIndicesForCoord = (x: number, y: number, width: number) => {
  const redIndex = y * (width * 4) + x * 4;
  return [redIndex, redIndex + 1, redIndex + 2, redIndex + 3];
};

function rayTrace(sphere: Sphere)
{
    for (let x = 0; x < canvasWidth; ++x) {
      for (let y = 0; y < canvasHeight; ++y) {
          const colorIndices = getColorIndicesForCoord(x, y, canvasWidth);
          let coord = new Vec3(x / canvasWidth, y / canvasHeight, 0)
          coord = Vec3.mult(coord, 2.0).add(-1.0) ;
          const colors = shader(coord, sphere);
          for(let  i = 0; i < colorIndices.length; ++i)
          {
              image.data[colorIndices[i]] = colors[i];

          }
      }
    }

}




console.log(max, min);
function render() {
  clearBackground();
// ctx.translate(canvasWidth / 2, canvasHeight / 2);

  ctx.putImageData(image, 0, 0);

}

function resize(event: MouseEvent): void {
  if (event.shiftKey) {
    console.log("clicked");
  }
}

function clearBackground(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}



function shader(coord: Vec3, sphere: Sphere): number[]
{
    let radius = sphere.radius;
    let origin = new Vec3(0.0, 0.0, 1.0);

    let a = Vec3.dot(coord, coord);

    let b = 2.0 * Vec3.dot(origin, coord);
    let c = Vec3.dot(origin, origin) - radius * radius;

    let discrim = b * b - 4.0 * a * c;



    // if(result >= 0)
    // {
    //     return [50, 20, 200, 255];
    // }

    if(discrim < 0)
    {
        return convertColor("#000000");
    }

  //  let t0 = -b + Math.sqrt(discrim) / (2.0 * a);
    let t1 = -b - Math.sqrt(discrim) / (2.0 * a);

//    let h0 = Vec3.mult(Vec3.add(origin, coord), t0);
    let h1 = Vec3.mult(Vec3.add(origin, coord), t1);

    let lightDir = new Vec3(1, 1, 1);

    let d = Vec3.dot(h1, lightDir);



    if(d > max)
    {
        max = d;
    }else if(d < min)
    {
        min = d;
    }



    let alpha = map(d,-1, 1, 0, 200);

    return convertColor(sphere.color, alpha);

}

function map(n: number, start1: number, stop1: number, start2: number, stop2: number) {
    return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
  };



function handleRanges(event: InputEvent)
{
    // @ts-ignore
    sphere.radius = event.target.value;

    rayTrace(sphere);
    render();
    
}

function handleColorPicker(event: InputEvent)
{
    // @ts-ignore
    sphere.color = event.target.value;
    rayTrace(sphere);
    render();
}

function convertColor(colorString: string, alpha: number = 255)
{
    const colors: number[] = []
    const start = colorString.charAt(0) == "#" ? 1 : 0;

    for(let i = start; i < colorString.length; i+=2)
    {
        const number = colorString.substring(i, i+2);
        colors.push(parseInt(number, 16));
    }

    colors.push(alpha);
    return colors;
}

console.log(convertColor("#1128d4"));

const s = new Sphere(0.5);


rayTrace(s);
render();



