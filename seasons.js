// GRASS by remarkability
// Rain inspired by monicawen

let song;
let scene = 0;
let grass = [];
let grassColour;
let rain = [];
let leaves = [];
let piledLeaves = [];
let snow = [];
let piledSnow = [];
let windPhase = 0;
let windAmplitude = 10;
let ball;
let showBall = false;
let flowers = [];
let clouds = [];
let birds = [];


// preload mp3 song and images from assets
function preload() {
  song = loadSound('assets/lofi-seasons-summer-anthem-251489.mp3');
  tree = loadImage('assets/tree.png');
  cottage = loadImage('assets/cottage.png');
}

function setup() {
  for (let i = 0; i < 5; i++) {
  birds.push(new Bird());
}
  
  createCanvas(800, 600);
  noStroke();
  
  fft = new p5.FFT();

  // Initialize grass
  grassColour = color("#1E4E10");
  for (let i = 0; i <= width; i += 10) {
    grass.push(new Grass(createVector(i + random(-30, 30), height - 20 + random(-10, 10))));
  }
  for (let i = 0; i <= width; i += 10) {
    grass.push(new Grass(createVector(i + random(-30, 30), height - 20 + random(-10, 10))));
  }
  // Initialize rain
  for (let i = 0; i < 100; i++) {
    rain.push(new Rain(random(50, width - 50), random(0, -3000)));
  }
  // Initialize leaves
  for (let i = 0; i < 15; i++) {
    leaves.push(new Leaf(random(width), random(-height, 0)));
  }
  // Initialize snow
  for (let i = 0; i < 150; i++) {
    snow.push(new Snowflake());
  }
  // Initialize ball
  ball = new Ball();

  // Initialize flowers
  for (let i = 0; i < 25; i++) {
    let flowerX = random(0, width);
    let flowerY = height - 100;
    flowers.push(new Flower(flowerX, flowerY));
  }
  // Initialize clouds
  for (let i = 0; i < 5; i++) {
    clouds.push(new Cloud(random(width), random(50, 150)));
  }

  
  // Start song
  userStartAudio().then(() => {
    if (!song.isPlaying()) {
      song.loop();
    }
  });
}

// Change scene depending on timestamp in song
function draw() {
  
  let energy = fft.getEnergy("lowMid");
  let beatForce = map(energy, 0, 255, -1.5, 1.5); // Stronger push with beat
  windX = beatForce * sin(frameCount * 0.05); // Sway side-to-side
  
  let spectrum = fft.analyze();
  
  if (song.currentTime() >= 43 && scene === 0) {
    scene = 1; // Fall
  } else if (song.currentTime() >= 85 && scene === 1) {
    scene = 2; // Winter
  } else if (song.currentTime() >= 128 && scene === 2) {
    scene = 3; // Spring
  }

  // ------------------ Scene 0 (Summer) ------------------
  if (scene === 0) {
    // Ombre sky
    for (let i = 0; i < height; i++) {
      let inter = map(i, 0, height, 0, 1);
      let skyColor = lerpColor(color(0, 153, 255), color(153, 255, 255), inter);
      stroke(skyColor);
      line(0, i, width, i);
    }
    
    drawSwirlyWind(125, 250, 0.7, fft.getEnergy("highMid"));
    drawSwirlyWind(325, 350, 0.9, fft.getEnergy("highMid"));
    drawSwirlyWind(450, 200, 1.0, fft.getEnergy("highMid"));
    drawSwirlyWind(650, 325, 0.7, fft.getEnergy("highMid"));
    
    // Trigger ball bouncing into scene
    if (song.currentTime() >= 21 && song.currentTime() <= 31) {
      showBall = true;
    }

    if (showBall && ball) {
      ball.update();
      ball.display();

      if (ball.isOffScreen()) {
        showBall = false;
        ball = new Ball();
      }
    }
    
    // Grass
    stroke(grassColour, random(50, 200));
    for (let i = 0; i < grass.length; i++) {
      grass[i].draw();
    }
    // Ground
    fill(color("#1E4E10"));
    rect(0, height - 60, width, 60);
    
    drawSunshine();
    
    // Birds
    for (let bird of birds) bird.update();
    for (let bird of birds) bird.display();

  }
  
  // Add sunshine, ball falling into and out of frame, birdlike shapes, wind

  // ------------------ Scene 1 (Fall) ------------------
  if (scene === 1) {
    // Ombre sky
    for (let i = 0; i < height; i++) {
      let inter = map(i, 0, height, 0, 1);
      let skyColor = lerpColor(color(11,137,213), color(0,102,177), inter);
      stroke(skyColor);
      line(0, i, width, i);
    }
    
    // Ground
    fill(color("#1E4E10"));
    rect(0, height - 100, width, 100);
    
    image(tree, 250, 50, 500, 500);
    
    let leafEnergy = fft.getEnergy("mid");
    let leafScale = map(leafEnergy, 0, 255, 0.3, 1.8);  


    // Falling leaves
    if (frameCount % 90 === 0 && random() < 0.7) {
      for (let i = 0; i < int(random(5, 10)); i++) {
        leaves.push(new Leaf(random(width), -20));
      }
    }

    // Update and display falling leaves
    for (let i = leaves.length - 1; i >= 0; i--) {
      leaves[i].applyForce(createVector(0, 0.01));
      leaves[i].update();

      if (leaves[i].pos.y >= height - 50) {
        piledLeaves.push(leaves[i]);
        leaves.splice(i, 1);
      } else {
        leaves[i].display(leafScale);
      }
    }

    // Cap on leaf pile size
    if (piledLeaves.length > 300) {
      piledLeaves.shift();
    }


    // Leaf Pile
    for (let i = 0; i < piledLeaves.length; i++) {
      piledLeaves[i].display(1);
    }
    
    drawSwirlyWind(125, 250, 0.7, fft.getEnergy("highMid"));
    drawSwirlyWind(325, 350, 0.9, fft.getEnergy("highMid"));
    
  }
  
  // Add trees swaying, change shape of leaves, add falling effect, make ground already have     leaves on it

  // ------------------ Scene 2 (Winter) ------------------
  if (scene === 2) {
    // Sky color
    for (let i = 0; i < height; i++) {
      let inter = map(i, 0, height, 0, 1);
      let skyColor = lerpColor(color(62,101,137), color(165,192,223), inter);
      stroke(skyColor);
      line(0, i, width, i);
    }
    
    image(cottage, 30, 50, 500, 500);
    
    drawBumpySnow();
    
    drawSnowman(width - 100, height - 130);
    
    drawLight();

    // Falling snowflakes
    for (let flake of snow) {
      flake.update();
      flake.display();
    }

    // Piled snowflakes
    for (let snowflake of piledSnow) {
      snowflake.display();
    }
  
  }

  
  // ------------------ Scene 3 (Spring) ------------------
  if (scene === 3) {
    // Ombre Sky
    for (let i = 0; i < height; i++) {
      let inter = map(i, 0, height, 0, 1);
      let skyColor = lerpColor(color(156, 208, 249), color(179, 237, 254), inter);
      stroke(skyColor);
      line(0, i, width, i);
    }
    
    // Ground
    fill(color(34, 139, 34)); // Grass color
    rect(0, height - 100, width, 100);
    
    drawSunshine();
    
    // Draw clouds
    for (let cloud of clouds) {
      cloud.update();
      cloud.display();
    }

    
    // Flower
    for (let flower of flowers) {
      flower.update();  // Grow the flower gradually
      flower.display();
    }
  

    // Create and display puddles from raindrops
    for (let i = 0; i < rain.length; i++) {
      rain[i].dropRain();
      rain[i].splash();
    }
    drawSwirlyWind(650, 300, 1.2, fft.getEnergy("lowMid"));
    drawSwirlyWind(400, 250, 1.0, fft.getEnergy("lowMid"));
    drawSwirlyWind(200, 350, 0.9, fft.getEnergy("lowMid"));
    
  }

  // Add flowers blooming / bugs, sunshine
}


// ------------------ Grass Logic ------------------

function Grass(loc) {
  this.blades = [];
  this.am = int(random(4, 12));
  this.loc = loc;
  this.loc.x += random(-100, 100);

  for (let i = 0; i < this.am; i++) {
    this.blades.push(new Blade(random(10, 50)));
  }

  Grass.prototype.draw = function () {
    for (let i = 0; i < this.blades.length; i++) {
      let blade = this.blades[i];
      push();
      translate(this.loc.x, this.loc.y);
      rotate(radians(blade.angle));
      blade.branch(blade.segments);
      pop();
    }
  };
}

function Blade(segments) {
  let num = 0;
  this.segments = segments;
  this.angle = random(-10, 10);

  this.branch = function (len) {
    let lenNew = len * 0.79;
    strokeWeight(map(len, 1, this.segments, 0.1, 3));
    line(0, 0, 0, -lenNew);
    push();
    translate(0, -lenNew);
    if (lenNew > 5) {
      rotate(radians(this.angle + sin(lenNew + num)));
      this.branch(lenNew);
    }
    pop();
    num += 0.01;
  };
}

// ------------------ Rain Logic ------------------

function Rain(x, y) {
  this.x = x;
  this.y = y;
  this.length = 15;
  this.r = 0;
  this.opacity = 200;

  this.dropRain = function () {
    noStroke();
    fill(135, 206, 250);
    ellipse(this.x, this.y, 3, this.length);
    this.y += 6;
    if (this.y > height - 50) {
      this.length -= 5;
    }
    if (this.length < 0) {
      this.length = 0;
    }
  };

  // splash effect when hitting ground
  this.splash = function () {
    strokeWeight(2);
    stroke(59, 85, 177, this.opacity);
    noFill();
    if (this.y > height - 50) {
      ellipse(this.x, height - 30, this.r * 2, this.r / 2);
      this.r++;
      this.opacity -= 10;

      if (this.opacity < 0) {
        this.y = random(0, -100);
        this.length = 15;
        this.r = 0;
        this.opacity = 200;
      }
    }
  };
}

// ------------------ Leaf Logic ------------------

class Leaf {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(0.5, 1));
    this.acc = createVector(0, 0.02);
    this.rotation = random(360);
    this.rotationSpeed = random(-1, 1.5);
    this.size = random(10, 35);

    // colors
    let palettes = [
      color(255, 165, 0),
      color(255, 69, 0),
      color(255, 215, 0),
      color(139, 69, 19),
      color(255, 255, 102)
    ];
    this.color = random(palettes);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.rotation += this.rotationSpeed;
    this.acc.mult(0);
    this.rotation += windX;

    if (this.pos.x < -50) this.pos.x = width + 50;
    if (this.pos.x > width + 50) this.pos.x = -50;
  }

  isOffScreen() {
    return this.pos.y > height + 50;
  }

  display(scaleFactor = 1) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(radians(this.rotation));
    fill(this.color);
    noStroke();
    ellipse(0, 0, this.size * scaleFactor, (this.size / 2) * scaleFactor);
    pop();
  }
}
// ------------------ Snow Logic ------------------
class Snowflake {
  constructor() {
    this.pos = createVector(random(width), random(-height, 0));
    this.vel = createVector(random(-0.5, 0.5), random(0.5, 1.5));
    this.size = random(2, 6);
  }

  update() {
    let beatEnergy = fft.getEnergy("bass");
    if (beatEnergy > 180) {
      this.pos.x += random(-2, 2); // sudden scatter
}
    this.pos.add(this.vel);

    // If the snowflake hits the ground, add it to the pile
    if (this.pos.y > height - 116) {
      piledSnow.push(new SnowflakePiled(this.pos.x, height - 116, this.size));
      this.pos.y = -10;  // Reset it above the screen
      this.pos.x = random(width);
    }
  }

  display() {
    fill(255, 250, 250);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

class SnowflakePiled {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.size = size;
  }

  display() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size);  // Draw the snowflake in the pile
  }
}

function drawBumpySnow() {
  noStroke();
  fill(255, 250, 250);

  beginShape();
  for (let x = 0; x <= width; x++) {
    let y = height - 125 + noise(x * 0.05) * 20; // Generate a bumpy surface for ground
    vertex(x, y);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function drawSnowman(x, y) {
  push();
  translate(x, y);

  // Bottom
  fill(255);
  stroke(200);
  ellipse(0, 0, 80);

  // Middle
  ellipse(0, -60, 60);

  // Head
  ellipse(0, -110, 40);

  // Eyes
  fill(0);
  noStroke();
  ellipse(-8, -115, 5);
  ellipse(8, -115, 5);

  // Carrot nose
  fill(255, 100, 0);
  triangle(0, -110, 0, -105, 20, -108);

  // Buttons
  fill(0);
  ellipse(0, -70, 5);
  ellipse(0, -55, 5);
  ellipse(0, -40, 5);

  // Arms
  stroke(139, 69, 19); // Brown stick arms
  strokeWeight(2);
  line(-30, -60, -60, -90);
  line(30, -60, 60, -90);

  pop();
}

// ------------------ Wind Logic ------------------

function drawSwirlyWind(x, y, scaleFactor, energy) {
  push();
  translate(x, y);
  stroke(255, 180); // light white
  noFill();
  strokeWeight(2);

  // Spiral core (like a snail shell)
  beginShape();
  let a = 0;
  let b = 2 + map(energy, 0, 255, 0, 4); // controls spiral size with music
  for (let t = 0; t < TWO_PI * 2.5; t += 0.1) {
    let r = a + b * t;
    let x = r * cos(t) * scaleFactor;
    let y = r * sin(t) * scaleFactor;
    vertex(x, y);
  }
  endShape();

  // Wind flow lines
  for (let i = 0; i < 4; i++) {
    let lineLength = 40 + i * 15 + map(energy, 0, 255, 0, 20);
    let yOffset = i * 5;
    line(0, yOffset, -lineLength, yOffset);
  }

  pop();
}

// ------------------ Sun Logic ------------------

function drawSunshine() {
  push();
  translate(100, 100);
  fill(255, 204, 0);
  noStroke();
  ellipse(0, 0, 100); // Sun body

  let energy = fft.getEnergy("highMid");
  
  let rayLength = map(energy, 0, 255, 50, 100); // Ray length varies with the beat
  
  stroke(255, 204, 0);
  strokeWeight(3);

  for (let i = 0; i < 12; i++) {
    let angle = radians(i * 30 + frameCount * 0.3); // Ray rotation
    let x = cos(angle) * rayLength;
    let y = sin(angle) * rayLength;
    line(0, 0, x, y); // Sun rays
  }
  pop();
}



// ------------------ Bird Logic ------------------

class Bird {
  constructor() {
    this.x = random(width);
    this.y = random(50, 150);
    this.speed = random(1, 3);
  }

  update() {
    this.x -= this.speed;
    if (this.x < -20) {
      this.x = width + 20;
      this.y = random(50, 150);
    }
  }

  display() {
    noFill();
    stroke(0);
    strokeWeight(2);
    arc(this.x, this.y, 20, 10, PI, 0);
    arc(this.x + 20, this.y, 20, 10, PI, 0);
  }
}

// ------------------ Ball Logic ------------------

class Ball {
  constructor() {
    this.x = -50;
    this.y = height - 120;
    this.radius = 60;
    this.vx = 10;  // velocity
    this.vy = -10;  // velocity
    this.gravity = 0.5;
    this.bounce = 0.7;
    this.rotation = 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    this.rotation += this.vx * 0.005; // Rotation speed

    if (this.y + this.radius > height - 60) {
      this.y = height - 60 - this.radius;
      this.vy *= -this.bounce;
    }
  }

  display() {
    push();
    translate(this.x, this.y);

    let segments = 6;
    let colors = [
      color(235, 0, 0), // Red
      color(26, 8, 188), // Blue
      color(247, 241, 38), // Yellow
      color(26, 216, 19), // Green
      color(216, 105, 19), // Orange
      color(255, 255, 255) // White
    ];
    let angleStep = TWO_PI / segments;
    let r = this.radius;

    // Rotate the ball
    rotate(this.rotation);

    // Ball design
    stroke(80, 80, 80, 50);
    strokeWeight(1);
    for (let i = 0; i < segments; i++) {
      fill(colors[i % colors.length]);
      beginShape();
      vertex(0, 0);
      for (let a = i * angleStep; a <= (i + 1) * angleStep; a += 0.05) {
        let x = cos(a) * r;
        let y = sin(a) * r;
        vertex(x, y);
      }
      endShape(CLOSE);
    }

    // Ball middle
    fill(255);
    stroke(150);
    strokeWeight(1);
    ellipse(0, 0, r * 0.3);

    // Ball highlight
    noStroke();
    fill(255, 255, 255, 100);
    ellipse(-r * 0.4, -r * 0.4, r * 0.7, r * 0.5);

    // Shading
    for (let i = 0; i < 10; i++) {
      fill(0, 0, 0, 10);
      ellipse(0, 0, r * 2 - i * 4);
    }

    pop();
  }
  isOffScreen() {
    return;
  }
}


// ------------------ Flower Logic ------------------

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = random(height - 80, height); 
    this.stemLength = 0; // Start with a stem length of 0
    this.finalStemLength = random(50, 75); // Final length of the stem
    this.growthSpeed = random(0.05, 0.2); // Speed of stem growth
    this.color = color(random(200, 255), random(100, 255), random(100, 255));
    this.size = random(15, 25); // Size of flower
  }

  update() {
    // Gradually increase stem length
    if (this.stemLength < this.finalStemLength) {
      this.stemLength += this.growthSpeed;
    }
  }

  display() {
    // Draw stem
    stroke(106, 175, 71); // Green color for stem
    strokeWeight(4);
    line(this.x, this.y, this.x, this.y - this.stemLength);

    // Draw flower petals
    fill(this.color);
    noStroke();
    for (let i = 0; i < 6; i++) { // 6 petals
      let angle = map(i, 0, 6, 0, TWO_PI);
      let petalX = this.x + cos(angle) * this.size;
      let petalY = this.y - this.stemLength + sin(angle) * (this.size * 0.5);
      ellipse(petalX, petalY, this.size, this.size / 2);
    }

    // Draw flower center
    fill(255, 204, 0); // Yellow center
    ellipse(this.x, this.y - this.stemLength, this.size / 2, this.size / 2);
  }
}


// ------------------ Cloud Logic ------------------

class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(0.2, 0.5);
  }

  update() {
    this.x += this.speed;
    if (this.x > width + 50) {
      this.x = -50;
    }
  }

  display() {
    fill(255, 255, 255, 200);
    noStroke();
    ellipse(this.x, this.y, 100, 60); // shape
    ellipse(this.x + 40, this.y + 10, 70, 40); // shape
    ellipse(this.x - 40, this.y + 10, 70, 40); // shape
  }
}

// ------------------ Light Logic ------------------
// for windows of cottage

function drawLight() {
  let energy = fft.getEnergy("lowMid");
  
  let lightSize = map(energy, 0, 255, 50, 100); // pulsing to bead
  let lightBrightness = map(energy, 0, 255, 100, 65);
  
  // Glowing yellow light
  noStroke();
  fill(255, 255, 0, lightBrightness); // Yellow
  
  ellipse(150, height - 205, lightSize, lightSize); // left window
  ellipse(296, height - 205, lightSize, lightSize); // right window
}

