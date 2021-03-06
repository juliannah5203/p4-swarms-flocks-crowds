let flock;

function setup() {
  createCanvas(640, 360);

  
  
  createP("Click and Drag with your mouse to generate new avatars.");

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 10; i++) {
    let b = new Boid(0,0);
    flock.addBoid(b);
    let c = new Boid1(width, 0);
    flock.addBoid(c);
    let a = new Boid(width, height);
    flock.addBoid(a);
    let d = new Boid1(0, height);
    flock.addBoid(d);
  }
}

function draw() {
  background(0);
  
  noStroke();
  push();
  fill(200,200,200);
  beginShape();
  vertex(320-40, 180);
  vertex(320-40, 360);
  vertex(320+40, 360);
  vertex(320+40, 180);

  endShape(CLOSE);
  pop();
  strokeWeight(2);
  stroke(0);
  fill(255,255,255);
  ellipse(320,180,90,32);
  
  fill(150,150,150);
  ellipse(320,180,75,25);

  
  flock.run();
}

// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY-20));
  flock.addBoid(new Boid1(mouseX, mouseY+20));
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 15.0;
  this.maxspeed = 3;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  // this.borders();
  this.renderBoy();
  
  // this.renderGirl();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  let avo = this.avoid(boids);      // Avoid walls
  let att = this.attract(boids);

  // Arbitrarily weight these forces
  sep.mult(5.0);
  ali.mult(2.0);
  coh.mult(1.0);
  avo.mult(3.0);
  att.mult(10.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.applyForce(avo);
  this.applyForce(att);



 
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);

}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.renderBoy = function() {
  // Draw a triangle rotated in the direction of velocity
  // let theta = this.velocity.heading() + radians(90);
  // fill(127);
  // stroke(200);
  push();
  translate(this.position.x, this.position.y);


  noStroke();

  fill(173,216,230);

  circle(6,4,8);

  fill(255);
  beginShape();
  vertex(1,9);
  vertex(11, 9);
  vertex(11,19);
  vertex(1,19);
  endShape();

  fill(127);


  beginShape();
  vertex(2,8);
  vertex(10, 8);
  vertex(10,20);
  vertex(2,20);
  endShape();

  rect(3,20,2,6);
  rect(7,20,2,6);

  pop();
}



// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width + this.r;
  if (this.position.y < -this.r)  this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;

}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0,0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}

Boid.prototype.attract = function(boids) {
  var neighbordist = 50;
  var m = createVector(315, 160);
  var d = p5.Vector.dist(this.position, m);
  if ((d > 0) && (d < neighbordist)) {

    return this.seek(m); // Steer towards the mouse location 
  } else {
    return createVector(0, 0);
  }
}



Boid.prototype.avoid = function(boids) {
  let steer = createVector(0, 0);
  if (this.position.x <= 0) {
    steer.add(createVector(1, 0));
  }
  if (this.position.x > 640) { // width of canvas
    steer.add(createVector(-1, 0));
  }
  if (this.position.y <= 0) {
    steer.add(createVector(0, 1));
  }
  if (this.position.y > 360) { // height of canvas
    steer.add(createVector(0, -1));
  }


  if(this.position.y > 150){
    if(this.position.x > 260 && this.position.x < 370){
      // steer.add(createVector(0,-1));
      if(this.position.x > 260){
        steer.add(createVector(0,-1));
        steer.add(createVector(-1,0));

      }
      if(this.position.x < 368){
        steer.add(createVector(0,-1));
        steer.add(createVector(1,0));
      }
    }
  }



  return steer;
}


function Boid1(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 15.0;
  this.maxspeed = 3;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid1.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  // this.borders();
  // this.renderBoy();
  this.renderGirl();
}

Boid1.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid1.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  let avo = this.avoid(boids);      // Avoid walls
  let att = this.attract(boids);
  // Arbitrarily weight these forces
  sep.mult(5.0);
  ali.mult(2.0);
  coh.mult(1.0);
  avo.mult(3.0);
  att.mult(10.0);

  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.applyForce(avo);
  this.applyForce(att);
}

// Method to update location
Boid1.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid1.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}





Boid1.prototype.renderGirl = function() {
  // Draw a triangle rotated in the direction of velocity
  // let theta = this.velocity.heading() + radians(90);
  // fill(127);
  // stroke(200);
  push();
  translate(this.position.x, this.position.y);


  noStroke();

  fill(255,182,193);
  circle(6,4,8);

  fill(255);
  beginShape();
  vertex(1,9);
  vertex(11, 9);
  vertex(13,19);
  vertex(-1,19);
  endShape();

  fill(127);


  beginShape();
  vertex(2,8);
  vertex(10, 8);
  vertex(11,20);
  vertex(1,20);
  endShape();

  rect(3,20,2,6);
  rect(7,20,2,6);

  pop();
}

// Wraparound
Boid1.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width + this.r;
  if (this.position.y < -this.r)  this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;

}

// Separation
// Method checks for nearby boids and steers away
Boid1.prototype.separate = function(boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid1.prototype.align = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0,0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid1.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}


Boid1.prototype.attract = function(boids) {
  var neighbordist = 50;
  var m = createVector(315, 160);
  var d = p5.Vector.dist(this.position, m);
  if ((d > 0) && (d < neighbordist)) {
    return this.seek(m); // Steer towards the mouse location 
  } else {
    return createVector(0, 0);
  }
}

Boid1.prototype.avoid = function(boids) {
  let steer = createVector(0, 0);
  if (this.position.x <= 0) {
    steer.add(createVector(1, 0));
  }
  if (this.position.x > 640) { // width of canvas
    steer.add(createVector(-1, 0));
  }
  if (this.position.y <= 0) {
    steer.add(createVector(0, 1));
  }
  if (this.position.y > 360) { // height of canvas
    steer.add(createVector(0, -1));
  }


  if(this.position.y > 150){
    if(this.position.x > 260 && this.position.x < 370){
      // steer.add(createVector(0,-1));
      if(this.position.x > 260){
        steer.add(createVector(0,-1));
        steer.add(createVector(-1,0));

      }
      if(this.position.x < 368){
        steer.add(createVector(0,-1));
        steer.add(createVector(1,0));
      }
    
    }
  }



  return steer;
}


